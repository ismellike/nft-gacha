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
struct CachedCardPrice {
    price: Option<f64>,
    timestamp: u64,
    #[serde(default)]
    ttl_secs: u64,
}

impl CachedCardPrice {
    fn new(price: Option<f64>, ttl: Duration) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        Self {
            price,
            timestamp,
            ttl_secs: ttl.as_secs(),
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
}

impl AppraisalCache {
    pub fn new(ttl: Duration) -> Self {
        Self {
            bucket: crate::bindings::wasi::keyvalue::store::open("nft-card-price-cache").ok(),
            default_ttl: ttl,
        }
    }

    pub fn get_price(&self, cache_key: &str) -> Result<Option<f64>> {
        if let Some(ref bucket) = self.bucket {
            if let Ok(Some(cached_data)) = bucket.get(cache_key) {
                if let Ok(cached_str) = String::from_utf8(cached_data) {
                    if let Ok(cached_price) = serde_json::from_str::<CachedCardPrice>(&cached_str) {
                        if !cached_price.is_expired() {
                            return Ok(cached_price.price);
                        }
                    }
                }
            }
        }
        Ok(None)
    }

    pub fn set_price(
        &self,
        cache_key: &str,
        price: Option<f64>,
        ttl: Option<Duration>,
    ) -> Result<()> {
        if let Some(ref bucket) = self.bucket {
            let ttl = ttl.unwrap_or(self.default_ttl);
            let cached_price = CachedCardPrice::new(price, ttl);
            if let Ok(serialized) = serde_json::to_string(&cached_price) {
                let _ = bucket.set(cache_key, serialized.as_bytes());
            }
        }
        Ok(())
    }

    pub fn generate_cache_key(&self, metadata: &crate::types::CardMetadata) -> String {
        hex::encode(metadata.to_keccak_hash())
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

    #[test]
    fn test_cached_card_price_creation() {
        let cached = CachedCardPrice::new(Some(25.0), Duration::from_secs(3600));
        assert!(cached.price.is_some());
        assert_eq!(cached.price.unwrap(), 25.0);
        assert!(cached.timestamp > 0);
        assert_eq!(cached.ttl_secs, 3600);
    }

    #[test]
    fn test_ttl_expiration() {
        let mut cached = CachedCardPrice::new(Some(25.0), Duration::from_secs(3600));
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
}
