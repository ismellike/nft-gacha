//! Generic fallback provider that assigns deterministic pseudo-random prices.
//!
//! Price distribution mirrors the gacha rarity weights:
//!   Common (70%):    $1 – $15
//!   Uncommon (20%):  $16 – $60
//!   Rare (6%):       $61 – $250
//!   Epic (3%):       $251 – $1,200
//!   Legendary (1%):  $1,201 – $5,000

use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::types::ProviderType;
use anyhow::Result;
use async_trait::async_trait;
use sha3::{Digest, Keccak256};

/// Fallback provider that handles any URI not claimed by a specific provider.
pub struct GenericProvider;

impl GenericProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait(?Send)]
impl MetadataProvider for GenericProvider {
    fn provider_type(&self) -> ProviderType {
        ProviderType::Generic
    }

    fn can_handle_uri(&self, _uri: &str) -> bool {
        // Catch-all: handles anything not matched by earlier providers
        true
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        // Use the URI itself as the card title (keeps each token unique)
        let title = uri.to_string();

        Ok(ProviderMetadata {
            provider: ProviderType::Generic,
            title,
            resolver: None, // No external resolver — price computed inline
        })
    }
}

/// Compute a deterministic pseudo-random price from a URI string.
/// The price is spread across rarity tiers matching gacha weights.
pub fn random_price_from_uri(uri: &str) -> f64 {
    let hash = Keccak256::digest(uri.as_bytes());

    // Use first 4 bytes as a u32 for tier selection (0..10000 basis points)
    let tier_roll = u32::from_be_bytes([hash[0], hash[1], hash[2], hash[3]]) % 10000;

    // Use next 4 bytes for price interpolation within the tier
    let price_roll = u32::from_be_bytes([hash[4], hash[5], hash[6], hash[7]]);
    let fraction = (price_roll as f64) / (u32::MAX as f64); // 0.0..1.0

    // Weighted tier selection matching gacha probabilities
    let (min, max) = match tier_roll {
        0..7000 => (1.0, 15.0),        // Common 70%
        7000..9000 => (16.0, 60.0),    // Uncommon 20%
        9000..9600 => (61.0, 250.0),   // Rare 6%
        9600..9900 => (251.0, 1200.0), // Epic 3%
        _ => (1201.0, 5000.0),         // Legendary 1%
    };

    // Interpolate within the tier range, round to nearest dollar
    let price = min + fraction * (max - min);
    (price * 100.0).round() / 100.0 // Round to cents
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_random_price_deterministic() {
        let p1 = random_price_from_uri("testnet-gacha://1");
        let p2 = random_price_from_uri("testnet-gacha://1");
        assert_eq!(p1, p2, "Same URI should produce same price");
    }

    #[test]
    fn test_random_price_different_tokens() {
        let p1 = random_price_from_uri("testnet-gacha://1");
        let p2 = random_price_from_uri("testnet-gacha://2");
        // Not guaranteed to differ but extremely likely with different hashes
        // Just check they're both valid
        assert!(p1 > 0.0);
        assert!(p2 > 0.0);
    }

    #[test]
    fn test_random_price_within_bounds() {
        // Test many URIs to verify all prices land within expected ranges
        for i in 0..1000 {
            let uri = format!("testnet-gacha://{}", i);
            let price = random_price_from_uri(&uri);
            assert!(price >= 1.0, "Price {} too low for URI {}", price, uri);
            assert!(price <= 5000.0, "Price {} too high for URI {}", price, uri);
        }
    }

    #[test]
    fn test_distribution_roughly_matches_weights() {
        let mut common: i32 = 0;
        let mut uncommon: i32 = 0;
        let mut rare: i32 = 0;
        let mut epic: i32 = 0;
        let mut legendary: i32 = 0;
        let total = 10000;

        for i in 0..total {
            let uri = format!("test://{}", i);
            let price = random_price_from_uri(&uri);
            match price {
                p if p <= 15.0 => common += 1,
                p if p <= 60.0 => uncommon += 1,
                p if p <= 250.0 => rare += 1,
                p if p <= 1200.0 => epic += 1,
                _ => legendary += 1,
            }
        }

        // Allow 5% tolerance from expected distribution
        let tolerance = (total as f64 * 0.05) as i32;
        assert!((common - 7000).abs() < tolerance, "Common: {}", common);
        assert!(
            (uncommon - 2000).abs() < tolerance,
            "Uncommon: {}",
            uncommon
        );
        assert!((rare - 600).abs() < tolerance, "Rare: {}", rare);
        assert!((epic - 300).abs() < tolerance, "Epic: {}", epic);
        assert!(
            (legendary - 100).abs() < tolerance,
            "Legendary: {}",
            legendary
        );
    }
}
