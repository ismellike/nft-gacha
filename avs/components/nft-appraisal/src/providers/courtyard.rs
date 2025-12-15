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
use std::convert::TryInto;
use wavs_wasi_utils::http::{fetch_string, http_request_get};

use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::types::{ProviderType, ResolverRoute};

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

impl TryInto<ScrydexCardInfo> for &NFTMetadata {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<ScrydexCardInfo> {
        let mut card_number = None;
        let mut grade = None;
        let mut company = None;
        let mut is_perfect = false;
        let mut set_name = None;
        let mut variant_parts = Vec::new();

        // Extract information from attributes
        for attr in &self.attributes {
            if let Some(trait_type) = &attr.trait_type {
                let value_str = CourtyardProvider::attribute_value_as_string(&attr.value);

                match trait_type.to_lowercase().as_str() {
                    "card number" | "number" => {
                        if let Some(value) = value_str {
                            card_number = CourtyardProvider::normalize_card_number(&value);
                        }
                    }
                    "grade" | "rating" => {
                        if let Some(value) = value_str {
                            grade = CourtyardProvider::normalize_grade_value(&value);
                            if CourtyardProvider::detect_perfect_grade(&value) {
                                is_perfect = true;
                            }
                        }
                    }
                    "grader" | "grading company" => {
                        company = value_str
                            .map(|value| value.trim().to_string())
                            .filter(|value| !value.is_empty())
                    }
                    "set" | "set name" => set_name = value_str,
                    _ => {}
                }
            } else {
                // Handle variant attributes that don't have a trait_type (like "1st Edition", "Shadowless", "Holo")
                if let Some(value_str) = CourtyardProvider::attribute_value_as_string(&attr.value) {
                    let value_lower = value_str.to_lowercase();
                    if matches!(
                        value_lower.as_str(),
                        "1st edition"
                            | "shadowless"
                            | "unlimited"
                            | "holo"
                            | "holofoil"
                            | "reverse holofoil"
                            | "reverse holo"
                    ) {
                        variant_parts.push(value_str.trim().to_string());
                    }
                }
            }
        }

        // Validate that all required fields are present
        let card_number =
            card_number.ok_or_else(|| anyhow!("Missing required card number attribute"))?;

        let grade = grade.ok_or_else(|| anyhow!("Missing required grade attribute"))?;

        let company =
            company.ok_or_else(|| anyhow!("Missing required grading company attribute"))?;

        let set_id = set_name.ok_or_else(|| anyhow!("Missing required set name attribute"))?;

        let variant = if variant_parts.is_empty() {
            None
        } else {
            Some(CourtyardProvider::construct_variant_string(&variant_parts))
        };

        Ok(ScrydexCardInfo {
            card_number,
            grade,
            company,
            is_perfect,
            set_id,
            variant,
        })
    }
}

impl CourtyardProvider {
    /// Construct variant string in the format expected by Scrydex
    /// e.g., ["1st Edition", "Shadowless"] → "firstEditionShadowless"
    /// e.g., ["1st Edition", "Shadowless", "Holo"] → "firstEditionShadowlessHolofoil"
    fn construct_variant_string(variant_parts: &[String]) -> String {
        let mut result = String::new();

        for part in variant_parts {
            let part_lower = part.to_lowercase();
            let mapped = match part_lower.as_str() {
                "1st edition" => "firstEdition",
                "shadowless" => "Shadowless",
                "unlimited" => "unlimited",
                "holo" | "holofoil" => "Holofoil",
                "reverse holo" | "reverse holofoil" => "ReverseHolofoil",
                _ => part, // Keep original if no mapping
            };
            result.push_str(mapped);
        }

        result
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
            // Try to convert metadata to ScrydexCardInfo, returning None if conversion fails
            let card_info: ScrydexCardInfo = match metadata.try_into() {
                Ok(info) => info,
                Err(_) => return None, // Silently fail if required attributes are missing
            };

            let set_id =
                Self::extract_set_id(&card_info.set_id).unwrap_or_else(|| card_info.set_id.clone());

            if !card_info.card_number.is_empty()
                && !card_info.grade.is_empty()
                && !card_info.company.is_empty()
                && !set_id.is_empty()
            {
                return Some(ResolverRoute::pokemon_card_info(
                    card_info.card_number,
                    card_info.grade,
                    card_info.company,
                    card_info.is_perfect,
                    set_id,
                    card_info.variant,
                ));
            }
        }

        None
    }

    fn extract_set_id(raw_value: &str) -> Option<String> {
        let trimmed = raw_value.trim();
        if trimmed.is_empty() {
            return None;
        }

        let without_prefix = trimmed
            .strip_prefix("Pokémon ")
            .or_else(|| trimmed.strip_prefix("Pokemon "))
            .unwrap_or(trimmed);

        let first_word = without_prefix.split_whitespace().next()?;
        let head = first_word.split('-').next().unwrap_or(first_word).trim();

        if head.is_empty() {
            return None;
        }

        Some(head.to_ascii_lowercase())
    }

    fn normalize_card_number(value: &str) -> Option<String> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return None;
        }

        let mut digits_end = 0;
        for (idx, ch) in trimmed.char_indices() {
            if ch.is_ascii_digit() {
                digits_end = idx + ch.len_utf8();
            } else {
                break;
            }
        }

        if digits_end == 0 {
            return Some(trimmed.to_string());
        }

        let leading = &trimmed[..digits_end];
        let remainder = &trimmed[digits_end..];
        let stripped = leading.trim_start_matches('0');
        let normalized_digits = if stripped.is_empty() { "0" } else { stripped };

        let mut normalized = normalized_digits.to_string();
        normalized.push_str(remainder);
        Some(normalized)
    }

    fn normalize_grade_value(value: &str) -> Option<String> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return None;
        }

        for token in trimmed.split_whitespace() {
            let clean = token.trim_matches(|c: char| !c.is_ascii_alphanumeric() && c != '.');
            if clean.is_empty() {
                continue;
            }

            let mut has_digit = false;
            let mut valid = true;
            for ch in clean.chars() {
                if ch.is_ascii_digit() {
                    has_digit = true;
                } else if ch != '.' {
                    valid = false;
                    break;
                }
            }

            if valid && has_digit {
                return Some(clean.to_string());
            }
        }

        Some(trimmed.to_string())
    }

    fn detect_perfect_grade(value: &str) -> bool {
        let upper = value.to_ascii_uppercase();
        upper.contains("PRISTINE") || upper.contains("BLACK LABEL") || upper.contains("PERFECT")
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{ResolverArgs, ResolverKind};
    use serde_json::json;

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
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: json!("Pokémon Sv5a-Crimson Haze"),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("070"),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: json!("PSA 10"),
                },
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: json!("PSA"),
                },
            ],
            ..Default::default()
        };
        let categories = vec!["Pokémon".to_string()];

        let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
        assert!(resolver.is_some());
        let route = resolver.unwrap();
        assert_eq!(route.kind, ResolverKind::PokemonGradedCard);
        match route.args {
            ResolverArgs::ScrydexCardInfo(info) => {
                assert_eq!(info.card_number, "70");
                assert_eq!(info.grade, "10");
                assert_eq!(info.company, "PSA");
                assert!(!info.is_perfect);
                assert_eq!(info.set_id, "sv5a");
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
    fn test_into_card_info_from_attributes() {
        let _provider = CourtyardProvider::new();

        let metadata = NFTMetadata {
            name: "1999 Fossil #17 Articuno".to_string(),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("070"),
                },
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: json!("PSA"),
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

        let card_info: ScrydexCardInfo = (&metadata).try_into().unwrap();
        assert_eq!(card_info.card_number, "70");
        assert_eq!(card_info.grade, "8");
        assert_eq!(card_info.company, "PSA");
        assert!(!card_info.is_perfect);
        assert_eq!(card_info.set_id, "Fossil");
    }

    #[test]
    fn test_into_card_info_perfect_grade() {
        let _provider = CourtyardProvider::new();

        let metadata = NFTMetadata {
            name: "2023 Shiny Treasure ex #349 Charizard ex - Special Art Rare".to_string(),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("349"),
                },
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: json!("BGS"),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: json!("10 PRISTINE"),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: json!("Pokémon sv5a-Crimson Haze"),
                },
            ],
            ..Default::default()
        };

        let card_info: ScrydexCardInfo = (&metadata).try_into().unwrap();
        assert_eq!(card_info.card_number, "349");
        assert_eq!(card_info.grade, "10");
        assert_eq!(card_info.company, "BGS");
        assert!(card_info.is_perfect);
        assert_eq!(card_info.set_id, "Pokémon sv5a-Crimson Haze");
    }

    #[test]
    fn test_extract_set_id_from_attribute() {
        let value = "Pokémon Sv5a-Crimson Haze";
        assert_eq!(
            CourtyardProvider::extract_set_id(value),
            Some("sv5a".to_string())
        );

        let value_no_prefix = "SWSH08-Evolving Skies";
        assert_eq!(
            CourtyardProvider::extract_set_id(value_no_prefix),
            Some("swsh08".to_string())
        );

        let promo_value = "Pokémon Svp EN-SV Black Star Promo";
        assert_eq!(
            CourtyardProvider::extract_set_id(promo_value),
            Some("svp".to_string())
        );

        let simple_value = "Base Set";
        assert_eq!(
            CourtyardProvider::extract_set_id(simple_value),
            Some("base".to_string())
        );
    }

    #[test]
    fn test_normalize_card_number() {
        assert_eq!(
            CourtyardProvider::normalize_card_number("070"),
            Some("70".to_string())
        );

        assert_eq!(
            CourtyardProvider::normalize_card_number("0070/100"),
            Some("70/100".to_string())
        );

        assert_eq!(
            CourtyardProvider::normalize_card_number("000"),
            Some("0".to_string())
        );

        assert_eq!(
            CourtyardProvider::normalize_card_number("TG23"),
            Some("TG23".to_string())
        );
    }

    #[test]
    fn test_normalize_grade_value_and_perfect_detection() {
        assert_eq!(
            CourtyardProvider::normalize_grade_value("10 PRISTINE"),
            Some("10".to_string())
        );
        assert!(CourtyardProvider::detect_perfect_grade("10 PRISTINE"));

        assert_eq!(
            CourtyardProvider::normalize_grade_value("9.5 GEM MINT"),
            Some("9.5".to_string())
        );
        assert!(!CourtyardProvider::detect_perfect_grade("9.5 GEM MINT"));

        assert_eq!(
            CourtyardProvider::normalize_grade_value("RAW"),
            Some("RAW".to_string())
        );
        assert!(!CourtyardProvider::detect_perfect_grade("RAW"));
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
        assert!(resolver.is_none());
    }

    #[test]
    fn test_try_into_fails_with_missing_required_fields() {
        let metadata = NFTMetadata {
            name: "1999 Fossil #17 Articuno".to_string(),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: json!("17"),
                },
                // Missing required grade, company, and set attributes
            ],
            ..Default::default()
        };

        let result: Result<ScrydexCardInfo> = (&metadata).try_into();
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Missing required"));
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

    #[test]
    fn test_variant_extraction_from_courtyard_metadata() {
        use crate::resolvers::scrydex_resolver::ScrydexCardInfo;

        let metadata = NFTMetadata {
            collection_name: None,
            name: "1999 Base Set #53 Magnemite - 1st Edition Shadowless (PSA 9 MINT)".to_string(),
            description: Some("A test card".to_string()),
            external_url: Some("https://example.com".to_string()),
            image: Some("https://example.com/image.jpg".to_string()),
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            product_type: Some("GRADED_CARD".to_string()),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("9 MINT".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Base Set".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: serde_json::Value::String("53".to_string()),
                },
                NFTAttribute {
                    trait_type: None, // Variant attribute
                    value: serde_json::Value::String("1st Edition".to_string()),
                },
                NFTAttribute {
                    trait_type: None, // Variant attribute
                    value: serde_json::Value::String("Shadowless".to_string()),
                },
            ],
        };

        let card_info: ScrydexCardInfo =
            (&metadata).try_into().expect("Failed to convert metadata");

        assert_eq!(card_info.card_number, "53");
        assert_eq!(card_info.grade, "9");
        assert_eq!(card_info.company, "PSA");
        assert_eq!(card_info.set_id, "Base Set");
        assert_eq!(
            card_info.variant,
            Some("firstEditionShadowless".to_string())
        );
        assert!(!card_info.is_perfect);
    }

    #[test]
    fn test_variant_extraction_with_holo() {
        use crate::resolvers::scrydex_resolver::ScrydexCardInfo;

        let metadata = NFTMetadata {
            collection_name: None,
            name: "1999 Base Set #4 Charizard - 1st Edition Shadowless Holo (PSA 10)".to_string(),
            description: Some("A test holo card".to_string()),
            external_url: Some("https://example.com".to_string()),
            image: Some("https://example.com/image.jpg".to_string()),
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            product_type: Some("GRADED_CARD".to_string()),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("10 PRISTINE".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Base Set".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: serde_json::Value::String("4".to_string()),
                },
                NFTAttribute {
                    trait_type: None, // Variant attribute
                    value: serde_json::Value::String("1st Edition".to_string()),
                },
                NFTAttribute {
                    trait_type: None, // Variant attribute
                    value: serde_json::Value::String("Shadowless".to_string()),
                },
                NFTAttribute {
                    trait_type: None, // Variant attribute
                    value: serde_json::Value::String("Holo".to_string()),
                },
            ],
        };

        let card_info: ScrydexCardInfo =
            (&metadata).try_into().expect("Failed to convert metadata");

        assert_eq!(card_info.card_number, "4");
        assert_eq!(card_info.grade, "10");
        assert_eq!(card_info.company, "PSA");
        assert_eq!(card_info.set_id, "Base Set");
        assert_eq!(
            card_info.variant,
            Some("firstEditionShadowlessHolofoil".to_string())
        );
        assert!(card_info.is_perfect);
    }

    #[test]
    fn test_variant_extraction_no_variant_attributes() {
        use crate::resolvers::scrydex_resolver::ScrydexCardInfo;

        let metadata = NFTMetadata {
            collection_name: None,
            name: "1999 Base Set #53 Magnemite (PSA 9 MINT)".to_string(),
            description: Some("A test card".to_string()),
            external_url: Some("https://example.com".to_string()),
            image: Some("https://example.com/image.jpg".to_string()),
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            product_type: Some("GRADED_CARD".to_string()),
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("9 MINT".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Base Set".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: serde_json::Value::String("53".to_string()),
                },
                // No variant attributes
            ],
        };

        let card_info: ScrydexCardInfo =
            (&metadata).try_into().expect("Failed to convert metadata");

        assert_eq!(card_info.card_number, "53");
        assert_eq!(card_info.grade, "9");
        assert_eq!(card_info.company, "PSA");
        assert_eq!(card_info.set_id, "Base Set");
        assert_eq!(card_info.variant, None);
        assert!(!card_info.is_perfect);
    }
}
