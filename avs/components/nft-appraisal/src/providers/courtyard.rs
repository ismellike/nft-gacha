//! Courtyard provider implementation for graded trading card metadata
//!
//! This module handles all Courtyard-specific logic including:
//! - Metadata fetching from Courtyard APIs
//! - Card parsing and attribute extraction
//! - Integrity verification for graded cards
//! - Conversion to unified metadata format

use alloy_primitives::{keccak256, B256};
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use hex;
use serde::{Deserialize, Serialize};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

use crate::resolvers::PokemonPriceResolver;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::traits::pricing::{PriceResolver, ResolverQuote};
use crate::types::{ProviderType, ResolverArgs, ResolverKind, ResolverRoute};

// ============================================================================
// Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTMetadata {
    pub collection_name: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub external_url: Option<String>,
    pub image: Option<String>,
    pub animation_url: Option<String>,
    pub video: Option<String>,
    pub token_info: Option<TokenInfo>,
    pub reveal_state: Option<RevealState>,
    pub item_info: Option<ItemInfo>,
    pub attributes: Vec<NFTAttribute>,
    pub product_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct TokenInfo {
    pub token_id: Option<String>,
    pub contract_address: Option<String>,
    pub chain: Option<String>,
    pub proof_of_integrity: Option<ProofOfIntegrityInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofOfIntegrityInfo {
    pub fingerprint: String,
    pub salt: u64,
    pub hex_proof: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevealState {
    pub revealed: Option<bool>,
    pub reveal_animation: Option<String>,
    pub sealed_pack_image: Option<String>,
    pub sealed_pack_animation: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ItemInfo {
    pub original_owner: Option<String>,
    pub asset_pictures: Option<Vec<String>>,
    pub storage: Option<StorageInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageInfo {
    pub vaulted: Option<bool>,
    pub insured: Option<bool>,
    pub location: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTAttribute {
    pub trait_type: Option<String>,
    pub value: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardInfo {
    pub title: String,
    pub card_number: Option<String>,
    pub grade: Option<String>,
    pub set_name: Option<String>,
    pub year: Option<String>,
}

// ============================================================================
// Client
// ============================================================================

#[derive(Debug)]
pub struct CourtyardClient;

impl CourtyardClient {
    pub fn new() -> Self {
        Self
    }

    /// Fetch NFT metadata directly from a URI (for Courtyard URIs)
    pub async fn get_nft_metadata_from_uri(&self, uri: &str) -> Result<NFTMetadata> {
        let request = http_request_get(uri)
            .map_err(|e| anyhow!("Failed to create HTTP request for URI {}: {}", uri, e))?;

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch NFT metadata from URI {}: {}", uri, e))?;

        let metadata: NFTMetadata = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse metadata JSON from URI {}: {}", uri, e))?;

        Ok(metadata)
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        // Extract proof information
        let proof_info = metadata
            .token_info
            .as_ref()
            .and_then(|ti| ti.proof_of_integrity.as_ref())
            .ok_or_else(|| {
                anyhow!("No proof of integrity found in metadata - this card may not be authentic")
            })?;

        IntegrityVerifier::verify_proof_of_integrity(proof_info)
    }
}

// ============================================================================
// Integrity Verifier
// ============================================================================

pub struct IntegrityVerifier;

impl IntegrityVerifier {
    /// Verify the proof of integrity for a Courtyard NFT
    ///
    /// This verifies that the NFT metadata has not been tampered with by checking
    /// the cryptographic proof stored on-chain against the metadata fingerprint.
    pub fn verify_proof_of_integrity(proof_info: &ProofOfIntegrityInfo) -> Result<bool> {
        // Validate fingerprint format
        if proof_info.fingerprint.is_empty() {
            return Err(anyhow!("Empty fingerprint in integrity proof"));
        }

        // Create verification message using Solidity's abi.encodePacked algorithm
        // abi.encodePacked concatenates raw bytes: fingerprint + salt (as uint256, 32 bytes, big-endian)
        let mut encoded = Vec::new();
        encoded.extend_from_slice(proof_info.fingerprint.as_bytes());

        // Salt as uint256 (32 bytes, big-endian) - same as Solidity's encoding
        let salt_bytes = proof_info.salt.to_be_bytes();
        let mut salt_256 = [0u8; 32];
        salt_256[32 - 8..].copy_from_slice(&salt_bytes);
        encoded.extend_from_slice(&salt_256);

        let expected_hash = keccak256(encoded);

        // Decode the hex proof (strip 0x prefix if present)
        let hex_proof_clean = proof_info
            .hex_proof
            .strip_prefix("0x")
            .unwrap_or(&proof_info.hex_proof);
        let proof_bytes = hex::decode(hex_proof_clean).map_err(|e| {
            anyhow!(
                "Failed to decode hex proof '{}': {}",
                proof_info.hex_proof,
                e
            )
        })?;

        if proof_bytes.len() != 32 {
            return Err(anyhow!(
                "Invalid proof format: expected 32 bytes, got {}",
                proof_bytes.len()
            ));
        }

        // The hex proof should be exactly 32 bytes (the keccak256 hash)
        let actual_hash = B256::from_slice(&proof_bytes);

        // Compare hashes
        let is_valid = expected_hash == actual_hash;

        if !is_valid {
            return Err(anyhow!(
                "Integrity verification failed: fingerprint hash mismatch. This may indicate tampered metadata."
            ));
        }

        Ok(is_valid)
    }
}

// ============================================================================
// Provider Implementation
// ============================================================================

/// Provider for Courtyard NFT metadata
pub struct CourtyardProvider {
    client: CourtyardClient,
}

impl CourtyardProvider {
    /// Create a new Courtyard provider
    pub fn new() -> Self {
        Self {
            client: CourtyardClient::new(),
        }
    }
}

#[async_trait(?Send)]
impl MetadataProvider for CourtyardProvider {
    fn provider_type(&self) -> ProviderType {
        ProviderType::Courtyard
    }

    fn can_handle_uri(&self, uri: &str) -> bool {
        // Check if URI matches Courtyard patterns
        uri.contains("courtyard.io")
            || uri.contains("api.courtyard.io")
            || (uri.contains("static.courtyard.io") && uri.contains("token_uri"))
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        // Fetch Courtyard metadata document
        let courtyard_metadata = self.client.get_nft_metadata_from_uri(uri).await?;

        // Verify integrity before proceeding (fail fast)
        if let Err(e) = self.client.verify_proof_of_integrity(&courtyard_metadata) {
            return Err(anyhow!("Integrity verification failed for {}: {}", uri, e));
        }

        let categories = Self::categories_from_attributes(&courtyard_metadata.attributes);
        let resolver = Self::infer_resolver(&courtyard_metadata, &categories);
        Ok(ProviderMetadata {
            provider: ProviderType::Courtyard,
            title: courtyard_metadata.name.clone(),
            product_type: courtyard_metadata.product_type.clone(),
            categories,
            resolver,
        })
    }
}

impl CourtyardProvider {
    /// Extract card information from Courtyard metadata attributes
    fn extract_card_info(&self, metadata: &NFTMetadata) -> CardInfo {
        let mut card_info = CardInfo {
            title: metadata.name.clone(),
            card_number: None,
            grade: None,
            set_name: None,
            year: None,
        };

        // Extract information from attributes
        for attr in &metadata.attributes {
            if let Some(trait_type) = &attr.trait_type {
                let value_str = Self::attribute_value_as_string(&attr.value);

                match trait_type.to_lowercase().as_str() {
                    "card number" | "number" => card_info.card_number = value_str,
                    "grade" | "rating" => card_info.grade = value_str,
                    "set" | "set name" => card_info.set_name = value_str,
                    "year" => card_info.year = value_str,
                    _ => {}
                }
            }
        }

        card_info
    }

    fn categories_from_attributes(attributes: &[NFTAttribute]) -> Vec<String> {
        attributes
            .iter()
            .filter_map(|attr| {
                let trait_type = attr.trait_type.as_deref()?;
                if trait_type.eq_ignore_ascii_case("Category") {
                    Self::attribute_value_as_string(&attr.value)
                } else {
                    None
                }
            })
            .collect()
    }

    fn attribute_value_as_string(value: &serde_json::Value) -> Option<String> {
        match value {
            serde_json::Value::String(s) => Some(s.clone()),
            serde_json::Value::Number(n) => Some(n.to_string()),
            serde_json::Value::Bool(b) => Some(b.to_string()),
            _ => None,
        }
    }

    pub async fn resolve_price(
        &self,
        route: &ResolverRoute,
        pokemon_api_key: &str,
    ) -> Result<Option<ResolverQuote>> {
        if pokemon_api_key.trim().is_empty() {
            return Err(anyhow!(
                "Pokemon price API key is required to resolve Courtyard appraisals"
            ));
        }

        match route.kind {
            ResolverKind::PokemonTradingCard => {
                if !matches!(route.args, ResolverArgs::PokemonCardInfo { .. }) {
                    return Err(anyhow!(
                        "Courtyard provider expected Pokemon card info arguments"
                    ));
                }

                let resolver = PokemonPriceResolver::new(pokemon_api_key.to_string());
                let quote = resolver.get_price(&route.args).await?;
                Ok(quote.map(|q| resolver.normalize_quote(q)))
            }
        }
    }

    fn infer_resolver(metadata: &NFTMetadata, categories: &[String]) -> Option<ResolverRoute> {
        let is_graded_card = metadata
            .product_type
            .as_deref()
            .map(|value| value.eq_ignore_ascii_case("GRADED_CARD"))
            .unwrap_or(false);

        let has_pokemon_category = categories.iter().any(|category| {
            let upper = category.to_uppercase();
            if upper.contains("POKÉMON") {
                true
            } else {
                upper.replace('É', "E").contains("POKEMON")
            }
        });

        if is_graded_card && has_pokemon_category {
            let card_info = Self::new().extract_card_info(metadata);
            return Some(ResolverRoute::pokemon_card_info(
                card_info.title,
                card_info.card_number,
                card_info.grade,
                card_info.set_name,
                card_info.year,
            ));
        }

        None
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use wstd::runtime::block_on;

    // Default implementations for test cases
    impl Default for NFTMetadata {
        fn default() -> Self {
            Self {
                collection_name: None,
                name: "Test".to_string(),
                description: None,
                external_url: None,
                image: None,
                animation_url: None,
                video: None,
                token_info: None,
                reveal_state: None,
                item_info: None,
                attributes: Vec::new(),
                product_type: None,
            }
        }
    }

    #[test]
    fn test_courtyard_provider_creation() {
        let provider = CourtyardProvider::new();
        assert!(matches!(provider.provider_type(), ProviderType::Courtyard));
    }

    #[test]
    fn test_uri_pattern_matching() {
        let provider = CourtyardProvider::new();

        assert!(provider.can_handle_uri("https://api.courtyard.io/token/123"));
        assert!(provider.can_handle_uri("https://courtyard.io/metadata/456"));
        assert!(provider.can_handle_uri("https://static.courtyard.io/token_uri/789"));

        assert!(!provider.can_handle_uri("https://opensea.io/token/123"));
        assert!(!provider.can_handle_uri("https://example.com/metadata"));
    }

    #[test]
    fn test_categories_from_attributes() {
        let attributes = vec![
            NFTAttribute {
                trait_type: Some("Category".to_string()),
                value: json!("Pokémon"),
            },
            NFTAttribute {
                trait_type: Some("Other".to_string()),
                value: json!("Ignore me"),
            },
            NFTAttribute {
                trait_type: None,
                value: json!("Missing trait"),
            },
        ];

        let categories = CourtyardProvider::categories_from_attributes(&attributes);
        assert_eq!(categories, vec!["Pokémon".to_string()]);
    }

    #[test]
    fn test_resolver_selection_for_pokemon_category() {
        let metadata = NFTMetadata {
            product_type: Some("GRADED_CARD".to_string()),
            name: "Pokémon Charizard".to_string(),
            ..Default::default()
        };
        let categories = vec!["Pokémon".to_string()];

        let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
        assert!(resolver.is_some());
        let route = resolver.unwrap();
        assert_eq!(route.kind, ResolverKind::PokemonTradingCard);
        match route.args {
            ResolverArgs::PokemonCardInfo {
                title,
                card_number,
                grade,
                set_name,
                year,
            } => {
                assert_eq!(title, "Pokemon Charizard");
                assert_eq!(card_number, None);
                assert_eq!(grade, None);
                assert_eq!(set_name, None);
                assert_eq!(year, None);
            }
        }
    }

    #[test]
    fn test_resolver_selection_without_match() {
        let metadata = NFTMetadata {
            product_type: Some("COLLECTIBLE".to_string()),
            ..Default::default()
        };
        let categories = vec!["Baseball".to_string()];

        let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
        assert!(resolver.is_none());
    }

    #[test]
    fn test_resolve_price_requires_api_key() {
        let provider = CourtyardProvider::new();
        let route = ResolverRoute::pokemon_card_info("Sample Title", None, None, None, None);

        let result = block_on(provider.resolve_price(&route, ""));
        assert!(result.is_err());
    }

    #[test]
    fn test_extract_card_info_from_attributes() {
        let provider = CourtyardProvider::new();

        let metadata = NFTMetadata {
            name: "1999 Fossil #17 Articuno".to_string(),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("17"),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: json!("PSA 8"),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: json!("Fossil"),
                },
                NFTAttribute {
                    trait_type: Some("Year".to_string()),
                    value: json!("1999"),
                },
            ],
            ..Default::default()
        };

        let card_info = provider.extract_card_info(&metadata);
        assert_eq!(card_info.title, "1999 Fossil #17 Articuno");
        assert_eq!(card_info.card_number, Some("17".to_string()));
        assert_eq!(card_info.grade, Some("PSA 8".to_string()));
        assert_eq!(card_info.set_name, Some("Fossil".to_string()));
        assert_eq!(card_info.year, Some("1999".to_string()));
    }

    #[test]
    fn test_resolver_selection_with_card_info() {
        let metadata = NFTMetadata {
            name: "1999 Fossil #17 Articuno".to_string(),
            product_type: Some("GRADED_CARD".to_string()),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("17"),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: json!("CGC 8"),
                },
            ],
            ..Default::default()
        };
        let categories = vec!["Pokémon".to_string()];

        let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
        assert!(resolver.is_some());
        let route = resolver.unwrap();
        assert_eq!(route.kind, ResolverKind::PokemonTradingCard);

        match route.args {
            ResolverArgs::PokemonCardInfo {
                title,
                card_number,
                grade,
                set_name,
                year,
            } => {
                assert_eq!(title, "1999 Fossil #17 Articuno");
                assert_eq!(card_number, Some("17".to_string()));
                assert_eq!(grade, Some("CGC 8".to_string()));
                assert_eq!(set_name, None);
                assert_eq!(year, None);
            }
        }
    }

    #[test]
    fn test_integrity_verification() {
        // Create a valid integrity proof by computing the expected hash using alloy
        let fingerprint = "test_fingerprint";
        let salt = 12345u64;

        // Compute the expected hash using Solidity's abi.encodePacked algorithm
        let mut encoded = Vec::new();
        encoded.extend_from_slice(fingerprint.as_bytes());

        // Salt as uint256 (32 bytes, big-endian)
        let salt_bytes = salt.to_be_bytes();
        let mut salt_256 = [0u8; 32];
        salt_256[32 - 8..].copy_from_slice(&salt_bytes);
        encoded.extend_from_slice(&salt_256);

        let expected_hash = keccak256(encoded);

        // Create a valid proof - the hex proof should be exactly 32 bytes (the hash)
        let hex_proof = hex::encode(expected_hash);

        let proof_info = ProofOfIntegrityInfo {
            fingerprint: fingerprint.to_string(),
            salt,
            hex_proof,
        };

        // This should now pass verification
        let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_integrity_verification_failure() {
        // Create an invalid proof (wrong hash)
        let proof_info = ProofOfIntegrityInfo {
            fingerprint: "test_fingerprint".to_string(),
            salt: 12345,
            hex_proof: "0000000000000000000000000000000000000000000000000000000000000000"
                .to_string(),
        };

        // This should fail verification
        let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Integrity verification failed"));
    }

    #[test]
    fn test_integrity_verification_missing_proof() {
        let metadata = NFTMetadata {
            token_info: Some(TokenInfo {
                proof_of_integrity: None,
                ..Default::default()
            }),
            ..Default::default()
        };

        // This test verifies the client-level error handling for missing proof
        let client = CourtyardClient::new();
        let result = client.verify_proof_of_integrity(&metadata);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("No proof of integrity found"));
    }

    #[test]
    fn test_integrity_verification_real_courtyard_data() {
        // Test with real Courtyard proof data
        let proof_info = ProofOfIntegrityInfo {
            fingerprint: "Graded Pokemon TCG | PSA 52435045 | 2000 Pokemon Base Set 2 Holo Charizard #4 | PSA 8 NM-MT".to_string(),
            salt: 265765525986,
            hex_proof: "217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c".to_string(),
        };

        // This should pass verification with the correct Solidity encoding
        let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
        assert!(result.is_ok(), "Verification failed: {:?}", result.err());
        assert!(
            result.unwrap(),
            "Verification returned false - integrity check failed"
        );
    }
}
