//! Courtyard provider implementation for graded trading card metadata
//!
//! This module handles all Courtyard-specific logic including:
//! - Metadata fetching from Courtyard APIs
//! - Card parsing and attribute extraction
//! - Integrity verification for graded cards
//! - Conversion to unified metadata format

use anyhow::{anyhow, Result};
use hex;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};
use std::collections::HashMap;
use wavs_wasi_utils::http::{fetch_string, http_request_get};

use crate::traits::metadata::MetadataProvider;
use crate::types::{CardGrade, CardInfo, CardMetadata, IntegrityProof, ProviderType};

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

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Clone)]
pub struct GradedCardAttributes {
    pub grader: String,
    pub grade: String,
    pub grade_qualifier: Option<String>,
    pub raw_grade: String,
    pub title: String,
    pub card_number: String,
    pub year: String,
    pub set: Option<String>,
    pub language: Option<String>,
    pub category: Option<String>,
    #[allow(dead_code)]
    pub event: Option<String>,
    pub other_attributes: HashMap<String, String>,
    pub tags: Vec<String>,
    pub integrity_proof: Option<IntegrityProof>,
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

    /// Parse graded card information from NFT metadata
    pub fn parse_graded_card_info(&self, metadata: &NFTMetadata) -> Result<GradedCardAttributes> {
        CardParser::parse_graded_card_attributes(metadata)
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        IntegrityVerifier::verify_proof_of_integrity(metadata)
    }
}

// ============================================================================
// Card Parser
// ============================================================================

pub struct CardParser;

impl CardParser {
    /// Parse graded card attributes from Courtyard metadata
    pub fn parse_graded_card_attributes(metadata: &NFTMetadata) -> Result<GradedCardAttributes> {
        // Verify this is a graded card
        if metadata.product_type.as_deref() != Some("GRADED_CARD") {
            return Err(anyhow!(
                "NFT is not a graded card (product_type: {:?})",
                metadata.product_type
            ));
        }

        // Convert all attributes to comprehensive map
        let all_attributes = Self::attributes_to_map(&metadata.attributes);

        // Define core grouping attribute keys
        let core_keys = [
            "Grader",
            "Grade",
            "Title/Subject",
            "Card Number",
            "Year",
            "Set",
            "Language",
            "Category",
            "Event",
        ];

        // Extract required fields using normalized trait types
        let grader = all_attributes
            .get("Grader")
            .ok_or_else(|| anyhow!("Missing required Grader attribute"))?
            .clone();
        let raw_grade = all_attributes
            .get("Grade")
            .ok_or_else(|| anyhow!("Missing required Grade attribute"))?
            .clone();
        let (grade, grade_qualifier) = Self::split_grade(&raw_grade);

        let title = all_attributes
            .get("Title/Subject")
            .ok_or_else(|| anyhow!("Missing required Title/Subject attribute"))?
            .clone();

        let card_number = all_attributes
            .get("Card Number")
            .ok_or_else(|| anyhow!("Missing required Card Number attribute"))?
            .clone();

        let year = all_attributes
            .get("Year")
            .ok_or_else(|| anyhow!("Missing required Year attribute"))?
            .clone();

        // Optional fields
        let set = all_attributes.get("Set").cloned();
        let language = all_attributes.get("Language").cloned();
        let category = all_attributes.get("Category").cloned();
        let event = all_attributes.get("Event").cloned();

        // Separate other attributes (Serial, etc.)
        let mut other_attributes = HashMap::new();
        for (key, value) in &all_attributes {
            if !core_keys.contains(&key.as_str()) {
                other_attributes.insert(key.clone(), value.clone());
            }
        }

        // Collect any tag-like attributes that have a value but no trait_type
        let mut tags: Vec<String> = Vec::new();
        for attr in &metadata.attributes {
            if attr.trait_type.is_none() {
                if let Some(val) = attr.value.as_str() {
                    let trimmed = val.trim();
                    if !trimmed.is_empty() {
                        tags.push(trimmed.to_string());
                    }
                }
            }
        }
        tags.sort();

        let integrity_proof = metadata
            .token_info
            .as_ref()
            .and_then(|ti| ti.proof_of_integrity.as_ref())
            .map(|pi| IntegrityProof {
                fingerprint: pi.fingerprint.clone(),
                salt: Some(pi.salt),
                proof: pi.hex_proof.clone(),
                verification_url: None,
            });

        Ok(GradedCardAttributes {
            grader,
            grade,
            grade_qualifier,
            raw_grade,
            title,
            card_number,
            year,
            set,
            language,
            category,
            event,
            other_attributes,
            tags,
            integrity_proof,
        })
    }

    /// Convert NFT attributes to a HashMap for easier access
    fn attributes_to_map(attributes: &[NFTAttribute]) -> HashMap<String, String> {
        let mut map = HashMap::new();

        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                let value = match &attr.value {
                    serde_json::Value::String(s) => s.clone(),
                    serde_json::Value::Number(n) => n.to_string(),
                    serde_json::Value::Bool(b) => b.to_string(),
                    _ => attr.value.to_string(),
                };
                map.insert(trait_type.clone(), value);
            }
        }

        map
    }

    /// Split a raw grade label into numeric grade + optional qualifier (e.g. "9 MINT" -> ("9", Some("MINT")))
    fn split_grade(raw_grade: &str) -> (String, Option<String>) {
        let trimmed = raw_grade.trim();
        if trimmed.is_empty() {
            return (String::new(), None);
        }

        let mut parts = trimmed.split_whitespace();
        if let Some(first) = parts.next() {
            if first.chars().all(|c| c.is_ascii_digit() || c == '.') {
                let qualifier = parts.collect::<Vec<_>>().join(" ");
                let qualifier = if qualifier.is_empty() {
                    None
                } else {
                    Some(qualifier)
                };
                return (first.to_string(), qualifier);
            }
        }

        let mut numeric = String::new();
        let mut reading = false;
        for ch in trimmed.chars() {
            if ch.is_ascii_digit() || ch == '.' {
                reading = true;
                numeric.push(ch);
            } else if reading {
                break;
            }
        }

        if numeric.is_empty() {
            return (trimmed.to_string(), None);
        }

        let qualifier = trimmed
            .split_once(&numeric)
            .map(|(_, tail)| tail.trim())
            .filter(|tail| !tail.is_empty())
            .map(|tail| tail.to_string());

        (numeric, qualifier)
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
    pub fn verify_proof_of_integrity(metadata: &NFTMetadata) -> Result<bool> {
        // Extract proof information
        let proof_info = metadata
            .token_info
            .as_ref()
            .and_then(|ti| ti.proof_of_integrity.as_ref())
            .ok_or_else(|| {
                anyhow!("No proof of integrity found in metadata - this card may not be authentic")
            })?;

        // Validate fingerprint format
        if proof_info.fingerprint.is_empty() {
            return Err(anyhow!("Empty fingerprint in integrity proof"));
        }

        // Create verification message from fingerprint and salt (same as Courtyard's algorithm)
        let mut hasher = Keccak256::new();
        hasher.update(proof_info.fingerprint.as_bytes());
        hasher.update(proof_info.salt.to_le_bytes());
        let expected_hash = hasher.finalize();

        // Decode the hex proof
        let proof_bytes = hex::decode(&proof_info.hex_proof).map_err(|e| {
            anyhow!(
                "Failed to decode hex proof '{}': {}",
                proof_info.hex_proof,
                e
            )
        })?;

        if proof_bytes.len() < 32 {
            return Err(anyhow!(
                "Invalid proof format: proof too short ({} bytes, expected at least 32)",
                proof_bytes.len()
            ));
        }

        // Extract the actual hash from the end of the proof
        let actual_hash = &proof_bytes[proof_bytes.len() - 32..];

        // Compare hashes
        let is_valid = expected_hash.as_slice() == actual_hash;

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

    fn fetch_metadata(&self, uri: &str) -> Result<CardMetadata> {
        // Use wstd::runtime::block_on for async operations
        let courtyard_metadata =
            wstd::runtime::block_on(self.client.get_nft_metadata_from_uri(uri))?;

        // 🔥 Verify integrity BEFORE conversion (fail fast)
        if let Err(e) = self.client.verify_proof_of_integrity(&courtyard_metadata) {
            return Err(anyhow!("Integrity verification failed for {}: {}", uri, e));
        }

        // Convert to unified format only after verification passes
        self.convert_metadata(courtyard_metadata)
    }

    fn verify(&self, metadata: &CardMetadata) -> Result<()> {
        // Verify this is Courtyard metadata
        if metadata.provider != ProviderType::Courtyard {
            return Err(anyhow!("Metadata provider mismatch"));
        }

        // ✅ Integrity verification is now done in fetch_metadata()
        // This method can focus on business logic validation

        // Verify that the card has required grade information
        if let Some(grade_info) = &metadata.grade_info {
            // Verify that we have a valid grader
            if grade_info.grader.is_empty() {
                return Err(anyhow!("Missing grader information"));
            }

            // Verify that we have a valid grade
            if grade_info.numeric_grade.is_empty() {
                return Err(anyhow!("Missing grade information"));
            }
        }

        // Additional business logic validations can be added here
        Ok(())
    }
}

impl CourtyardProvider {
    /// Convert Courtyard metadata to unified format
    fn convert_metadata(&self, courtyard_metadata: NFTMetadata) -> Result<CardMetadata> {
        // Parse graded card information
        let graded_attributes = self.client.parse_graded_card_info(&courtyard_metadata)?;

        // Extract images
        let mut images = Vec::new();
        if let Some(ref image) = courtyard_metadata.image {
            images.push(image.clone());
        }
        if let Some(ref animation_url) = courtyard_metadata.animation_url {
            images.push(animation_url.clone());
        }

        // Extract external URLs
        let mut external_urls = Vec::new();
        if let Some(ref external_url) = courtyard_metadata.external_url {
            external_urls.push(external_url.clone());
        }

        // Convert attributes map
        let mut attributes = HashMap::new();
        for (key, value) in &graded_attributes.other_attributes {
            attributes.insert(key.clone(), value.clone());
        }

        // Add core attributes to the map as well
        attributes.insert("grader".to_string(), graded_attributes.grader.clone());
        attributes.insert("grade".to_string(), graded_attributes.grade.clone());
        attributes.insert(
            "grade_display".to_string(),
            graded_attributes.raw_grade.clone(),
        );
        attributes.insert(
            "card_number".to_string(),
            graded_attributes.card_number.clone(),
        );
        attributes.insert("year".to_string(), graded_attributes.year.clone());

        if let Some(set) = &graded_attributes.set {
            attributes.insert("set".to_string(), set.clone());
        }

        if let Some(language) = &graded_attributes.language {
            attributes.insert("language".to_string(), language.clone());
        }

        if let Some(category) = &graded_attributes.category {
            attributes.insert("category".to_string(), category.clone());
        }

        // Add tags as individual attributes
        for (i, tag) in graded_attributes.tags.iter().enumerate() {
            attributes.insert(format!("tag_{}", i), tag.clone());
        }

        // Create grade info
        let grade_info = Some(CardGrade {
            grader: graded_attributes.grader.clone(),
            numeric_grade: graded_attributes.grade.clone(),
            grade_qualifier: graded_attributes.grade_qualifier.clone(),
            serial: graded_attributes.other_attributes.get("Serial").cloned(),
            integrity_proof: graded_attributes.integrity_proof,
        });

        // Create card info
        let card_info = CardInfo {
            name: graded_attributes.title.clone(),
            card_number: Some(graded_attributes.card_number.clone()),
            set_name: graded_attributes.set.clone(),
            year: Some(graded_attributes.year.clone()),
            category: graded_attributes.category.clone(),
            language: graded_attributes.language.clone(),
            images,
            external_urls,
        };

        Ok(CardMetadata {
            provider: ProviderType::Courtyard,
            card_info,
            grade_info,
            attributes,
            provider_data: serde_json::to_value(courtyard_metadata)
                .map_err(|e| anyhow!("Failed to serialize provider data: {}", e))?,
        })
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_attributes_to_map() {
        let attributes = vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("10".to_string()),
            },
            NFTAttribute {
                trait_type: None,
                value: serde_json::Value::String("Holo".to_string()),
            },
        ];

        let map = CardParser::attributes_to_map(&attributes);
        assert_eq!(map.get("Grader"), Some(&"PSA".to_string()));
        assert_eq!(map.get("Grade"), Some(&"10".to_string()));
        assert!(!map.contains_key("Holo")); // trait_type is None
    }

    #[test]
    fn test_split_grade_numeric_with_qualifier() {
        let (grade, qualifier) = CardParser::split_grade("9 MINT");
        assert_eq!(grade, "9");
        assert_eq!(qualifier, Some("MINT".to_string()));
    }

    #[test]
    fn test_split_grade_with_prefix() {
        let (grade, qualifier) = CardParser::split_grade("PSA 10 GEM MINT");
        assert_eq!(grade, "10");
        assert_eq!(qualifier, Some("GEM MINT".to_string()));
    }

    #[test]
    fn test_integrity_verification() {
        // Create a valid integrity proof by computing the expected hash
        let fingerprint = "test_fingerprint";
        let salt = 12345u64;

        // Compute the expected hash (same algorithm as the verifier)
        let mut hasher = Keccak256::new();
        hasher.update(fingerprint.as_bytes());
        hasher.update(salt.to_le_bytes());
        let expected_hash = hasher.finalize();

        // Create a valid proof with the expected hash at the end
        let mut proof_bytes = vec![0u8; 32]; // Prefix with zeros
        proof_bytes.extend_from_slice(&expected_hash);
        let hex_proof = hex::encode(&proof_bytes);

        let proof_info = ProofOfIntegrityInfo {
            fingerprint: fingerprint.to_string(),
            salt,
            hex_proof,
        };

        let metadata = NFTMetadata {
            token_info: Some(TokenInfo {
                proof_of_integrity: Some(proof_info),
                ..Default::default()
            }),
            ..Default::default()
        };

        // This should now pass verification
        let result = IntegrityVerifier::verify_proof_of_integrity(&metadata);
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

        let metadata = NFTMetadata {
            token_info: Some(TokenInfo {
                proof_of_integrity: Some(proof_info),
                ..Default::default()
            }),
            ..Default::default()
        };

        // This should fail verification
        let result = IntegrityVerifier::verify_proof_of_integrity(&metadata);
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

        // This should fail because there's no proof
        let result = IntegrityVerifier::verify_proof_of_integrity(&metadata);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("No proof of integrity found"));
    }
}
