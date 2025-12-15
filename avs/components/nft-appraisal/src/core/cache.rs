use crate::traits::pricing::{AppraisalPrice, ResolverQuote};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// Cache management for NFT appraisals
#[derive(Debug)]
pub struct AppraisalCache {
    bucket: Option<crate::bindings::wasi::keyvalue::store::Bucket>,
    default_ttl: Duration,
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedResolverQuote {
    price: Option<AppraisalPrice>,
    timestamp: u64,
    #[serde(default)]
    ttl_secs: u64,
}

impl CachedResolverQuote {
    fn from_quote(quote: Option<&ResolverQuote>, fallback_ttl: Duration) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        match quote {
            Some(actual) => Self {
                price: Some(actual.price.clone()),
                timestamp,
                ttl_secs: actual.ttl.as_secs(),
            },
            None => Self {
                price: None,
                timestamp,
                ttl_secs: fallback_ttl.as_secs(),
            },
        }
    }

    fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        if self.ttl_secs == 0 {
            return true;
        }
        now.saturating_sub(self.timestamp) > self.ttl_secs
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
            bucket: crate::bindings::wasi::keyvalue::store::open("nft-card-price-cache").ok(),
            default_ttl: ttl,
        }
    }

    pub fn get(&self, cache_key: &str) -> Result<Option<Option<ResolverQuote>>> {
        if let Some(ref bucket) = self.bucket {
            if let Ok(Some(cached_data)) = bucket.get(cache_key) {
                if let Ok(cached_str) = String::from_utf8(cached_data) {
                    if let Ok(cached_quote) =
                        serde_json::from_str::<CachedResolverQuote>(&cached_str)
                    {
                        if !cached_quote.is_expired() {
                            return Ok(Some(cached_quote.into_quote()));
                        }
                    }
                }
            }
        }
        Ok(None)
    }

    pub fn set(&self, cache_key: &str, quote: Option<&ResolverQuote>) -> Result<()> {
        if let Some(ref bucket) = self.bucket {
            let fallback_ttl = if quote.is_some() {
                self.default_ttl
            } else {
                // Keep negative lookups short-lived to avoid sticking on transient failures
                Duration::from_secs(300)
            };

            let cached_quote = CachedResolverQuote::from_quote(quote, fallback_ttl);
            if let Ok(serialized) = serde_json::to_string(&cached_quote) {
                let _ = bucket.set(cache_key, serialized.as_bytes());
            }
        }
        Ok(())
    }

    pub fn generate_cache_key(&self, title: &str) -> String {
        use sha3::{Digest, Keccak256};
        let mut hasher = Keccak256::new();
        hasher.update(title.as_bytes());
        hex::encode(hasher.finalize())
    }
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

        let cached = CachedResolverQuote::from_quote(Some(&quote), Duration::from_secs(60));
        assert!(cached.price.is_some());
        assert_eq!(cached.price.as_ref().unwrap().value, 25.0);
        assert!(cached.timestamp > 0);
        assert_eq!(cached.ttl_secs, 3600);

        let resolver_quote = cached.into_quote().expect("expected cached quote");
        assert_eq!(resolver_quote.price.value, 25.0);
        assert_eq!(resolver_quote.price.currency, "USD");
    }

    #[test]
    fn test_ttl_expiration() {
        let mut cached = CachedResolverQuote::from_quote(None, Duration::from_secs(3600));
        assert!(!cached.is_expired());

        // Set timestamp to past
        cached.timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            - 7200; // 2 hours ago

        assert!(cached.is_expired());

        cached.ttl_secs = 86_400;
        assert!(!cached.is_expired());
    }

    #[test]
    fn test_negative_cache_ttl_is_short() {
        let cached = CachedResolverQuote::from_quote(None, Duration::from_secs(300));
        assert_eq!(cached.ttl_secs, 300);
        assert!(cached.price.is_none());
    }
}
