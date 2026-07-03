use crate::{
    traits::pricing::{AppraisalPrice, ResolverQuote},
    wasi::keyvalue::store::{self, Bucket},
};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// Result of a cache lookup, avoiding confusing `Option<Option<T>>`.
pub enum CacheResult {
    /// Key was not in the cache (or expired).
    Miss,
    /// Key was cached but resolved to no quote (negative lookup).
    NegativeHit,
    /// Key was cached with a valid quote.
    Hit(ResolverQuote),
}

/// Cache management for NFT appraisals
#[derive(Debug)]
pub struct AppraisalCache {
    bucket: Option<Bucket>,
    default_ttl: Duration,
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedResolverQuote {
    price: Option<AppraisalPrice>,
    timestamp: u64,
    #[serde(default)]
    ttl_secs: u64,
    /// Deterministic price epoch (derived from the trigger event's block number) this entry was
    /// resolved for. Entries are valid only for their own epoch — this pins the result across ALL
    /// operators for the whole epoch and removes per-operator cache drift, the main source of
    /// cross-operator (AVS quorum) disagreement. Defaults to 0 for entries written before epoch
    /// anchoring existed.
    #[serde(default)]
    price_epoch: u64,
}

impl CachedResolverQuote {
    fn from_quote(quote: Option<&ResolverQuote>, fallback_ttl: Duration, price_epoch: u64) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        match quote {
            Some(actual) => Self {
                price: Some(actual.price.clone()),
                timestamp,
                ttl_secs: actual.ttl.as_secs(),
                price_epoch,
            },
            None => Self {
                price: None,
                timestamp,
                ttl_secs: fallback_ttl.as_secs(),
                price_epoch,
            },
        }
    }

    /// Whether this entry is still usable for a request in `expected_epoch`.
    ///
    /// BOTH priced and negative (no-price) entries are **epoch-pinned**: valid iff resolved for the
    /// same epoch, with no wall-clock component anywhere. This keeps every operator consistent for
    /// the whole epoch on both outcomes — a price *and* a "no price found" result. It is safe to pin
    /// negatives because only genuine no-price results are cached: transient upstream failures
    /// surface as `Err` and propagate (never cached), while a card genuinely having no price for a
    /// grade is stable within an epoch just like a price is.
    fn is_valid(&self, expected_epoch: u64) -> bool {
        self.price_epoch == expected_epoch
    }

    fn into_quote(self) -> Option<ResolverQuote> {
        self.price.map(|price| ResolverQuote {
            price,
            ttl: Duration::from_secs(self.ttl_secs),
        })
    }
}

impl AppraisalCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            bucket: store::open("nft-card-price-cache").ok(),
            default_ttl: ttl,
        }
    }

    pub fn get(&self, cache_key: &str, expected_epoch: u64) -> Result<CacheResult> {
        if let Some(ref bucket) = self.bucket {
            match bucket.get(cache_key) {
                Ok(Some(cached_data)) => match String::from_utf8(cached_data) {
                    Ok(cached_str) => {
                        match serde_json::from_str::<CachedResolverQuote>(&cached_str) {
                            Ok(cached_quote) => {
                                if cached_quote.is_valid(expected_epoch) {
                                    return Ok(match cached_quote.into_quote() {
                                        Some(quote) => CacheResult::Hit(quote),
                                        None => CacheResult::NegativeHit,
                                    });
                                }
                            }
                            Err(e) => {
                                eprintln!("WARN: cache entry '{cache_key}' corrupted (JSON): {e}");
                                let _ = bucket.delete(cache_key);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("WARN: cache entry '{cache_key}' corrupted (UTF-8): {e}");
                        let _ = bucket.delete(cache_key);
                    }
                },
                Ok(None) => {}
                Err(e) => {
                    eprintln!("WARN: cache read error for '{cache_key}': {e}");
                }
            }
        }
        Ok(CacheResult::Miss)
    }

    pub fn set(
        &self,
        cache_key: &str,
        quote: Option<&ResolverQuote>,
        price_epoch: u64,
    ) -> Result<()> {
        if let Some(ref bucket) = self.bucket {
            // ttl_secs is retained only to reconstruct ResolverQuote.ttl for priced entries; it no
            // longer governs cache validity (epoch does). Negatives carry a nominal value.
            let fallback_ttl = if quote.is_some() {
                self.default_ttl
            } else {
                Duration::from_secs(300)
            };

            let cached_quote = CachedResolverQuote::from_quote(quote, fallback_ttl, price_epoch);
            if let Ok(serialized) = serde_json::to_string(&cached_quote) {
                let _ = bucket.set(cache_key, serialized.as_bytes());
            }
        }
        Ok(())
    }

    pub fn generate_cache_key(&self, title: &str) -> String {
        keccak256_hex(title)
    }
}

/// Pure helper: compute the Keccak-256 hex digest of the given string.
/// Extracted so tests can call this without constructing an `AppraisalCache`
/// (which would invoke the WASI key-value store host import).
pub(crate) fn keccak256_hex(input: &str) -> String {
    use sha3::{Digest, Keccak256};
    let mut hasher = Keccak256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

impl Default for AppraisalCache {
    fn default() -> Self {
        Self::new(Duration::from_secs(86_400)) // 24 hour TTL
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::pricing::AppraisalPrice;

    #[test]
    fn test_cached_quote_with_value() {
        let quote = ResolverQuote {
            price: AppraisalPrice {
                value: 25.0,
                currency: "USD".to_string(),
                source: "test".to_string(),
                context: None,
            },
            ttl: Duration::from_secs(3600),
        };

        let cached = CachedResolverQuote::from_quote(Some(&quote), Duration::from_secs(60), 7);
        assert!(cached.price.is_some());
        assert_eq!(cached.price.as_ref().unwrap().value, 25.0);
        assert!(cached.timestamp > 0);
        assert_eq!(cached.ttl_secs, 3600);
        assert_eq!(cached.price_epoch, 7);

        let resolver_quote = cached.into_quote().expect("expected cached quote");
        assert_eq!(resolver_quote.price.value, 25.0);
        assert_eq!(resolver_quote.price.currency, "USD");
    }

    #[test]
    fn negative_entry_is_epoch_pinned_not_wall_clock() {
        // Negative (no-price) entries are epoch-pinned like priced ones: valid for their own epoch
        // regardless of wall-clock age, invalid for any other epoch.
        let mut cached = CachedResolverQuote::from_quote(None, Duration::from_secs(3600), 42);
        assert!(
            cached.is_valid(42),
            "negative entry valid for its own epoch"
        );
        assert!(
            !cached.is_valid(43),
            "negative entry invalid for a different epoch"
        );

        // Wall-clock age no longer affects validity.
        cached.timestamp = 0;
        assert!(
            cached.is_valid(42),
            "negative entry ignores wall-clock age within its epoch"
        );
    }

    #[test]
    fn positive_entry_is_epoch_pinned_not_wall_clock() {
        let quote = ResolverQuote {
            price: AppraisalPrice {
                value: 25.0,
                currency: "USD".to_string(),
                source: "test".to_string(),
                context: None,
            },
            ttl: Duration::from_secs(3600),
        };
        let mut cached =
            CachedResolverQuote::from_quote(Some(&quote), Duration::from_secs(60), 100);

        // Valid only for its own epoch, regardless of wall-clock age.
        assert!(
            cached.is_valid(100),
            "priced entry must be valid for its own epoch"
        );
        assert!(
            !cached.is_valid(101),
            "priced entry must be invalid for a different epoch"
        );

        // Even an ancient timestamp does not expire a priced entry within its epoch.
        cached.timestamp = 0;
        assert!(
            cached.is_valid(100),
            "priced entry must ignore wall-clock age within its epoch"
        );
    }

    #[test]
    fn test_negative_cache_ttl_is_short() {
        let cached = CachedResolverQuote::from_quote(None, Duration::from_secs(300), 0);
        assert_eq!(cached.ttl_secs, 300);
        assert!(cached.price.is_none());
    }

    // -----------------------------------------------------------------------
    // generate_cache_key / keccak256_hex
    //
    // We test the pure `keccak256_hex` helper directly to avoid constructing
    // an `AppraisalCache`, which calls the WASI key-value store host import
    // and panics in the native test harness.
    // -----------------------------------------------------------------------

    #[test]
    fn generate_cache_key_equal_inputs_produce_equal_keys() {
        let key_a = keccak256_hex("sv5a-1-9-psa-false-base1-novariant");
        let key_b = keccak256_hex("sv5a-1-9-psa-false-base1-novariant");
        assert_eq!(
            key_a, key_b,
            "same input must always produce the same cache key"
        );
    }

    #[test]
    fn generate_cache_key_different_inputs_produce_different_keys() {
        let key_a = keccak256_hex("sv5a-1-9-psa-false-base1-normal");
        let key_b = keccak256_hex("sv5a-1-10-psa-true-base1-normal");
        assert_ne!(
            key_a, key_b,
            "different inputs must produce different cache keys"
        );
    }

    #[test]
    fn generate_cache_key_empty_string_is_stable() {
        let key_a = keccak256_hex("");
        let key_b = keccak256_hex("");
        // Empty string hashes to a deterministic value.
        assert_eq!(key_a, key_b);
        assert!(!key_a.is_empty());
    }

    #[test]
    fn generate_cache_key_output_is_hex_string() {
        let key = keccak256_hex("test-input");
        // Keccak256 produces 32 bytes -> 64 hex chars.
        assert_eq!(key.len(), 64, "cache key should be 64 hex characters");
        assert!(
            key.chars().all(|c| c.is_ascii_hexdigit()),
            "cache key must be a lowercase hex string"
        );
    }

    // -----------------------------------------------------------------------
    // CachedResolverQuote::is_valid — negative entries are invalid for other epochs
    // -----------------------------------------------------------------------

    #[test]
    fn negative_entry_invalid_for_other_epoch() {
        // ttl_secs no longer affects validity; only the epoch does. A negative entry from epoch 5
        // is invalid once the request epoch moves on, forcing a re-fetch in the new epoch.
        let cached = CachedResolverQuote {
            price: None,
            timestamp: u64::MAX, // wall-clock is irrelevant now
            ttl_secs: 0,
            price_epoch: 5,
        };
        assert!(cached.is_valid(5), "valid for its own epoch");
        assert!(!cached.is_valid(6), "invalid once the epoch moves on");
    }

    // -----------------------------------------------------------------------
    // CachedResolverQuote — negative cache (price = None)
    // -----------------------------------------------------------------------

    #[test]
    fn negative_cache_into_quote_returns_none() {
        let cached = CachedResolverQuote::from_quote(None, Duration::from_secs(300), 0);
        assert!(cached.price.is_none(), "negative cache must have no price");
        // into_quote on a negative cache entry returns None.
        assert!(cached.into_quote().is_none());
    }

    #[test]
    fn negative_cache_is_not_immediately_invalid() {
        // A fresh negative cache entry with a 5-minute TTL should still be valid.
        let cached = CachedResolverQuote::from_quote(None, Duration::from_secs(300), 0);
        assert!(
            cached.is_valid(0),
            "fresh negative cache entry must still be valid"
        );
    }

    #[test]
    fn negative_cache_serializes_and_deserializes() {
        let cached = CachedResolverQuote::from_quote(None, Duration::from_secs(300), 0);
        let json = serde_json::to_string(&cached).expect("serialization must succeed");
        let recovered: CachedResolverQuote =
            serde_json::from_str(&json).expect("deserialization must succeed");
        assert!(recovered.price.is_none());
        assert_eq!(recovered.ttl_secs, 300);
    }
}
