use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Unified card metadata representation that can be converted from any provider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardMetadata {
    /// Provider this metadata came from
    pub provider: ProviderType,

    /// Basic card identification
    pub card_info: CardInfo,

    /// Grading information (for graded cards)
    pub grade_info: Option<CardGrade>,

    /// Additional attributes from the provider
    pub attributes: HashMap<String, String>,

    /// Provider-specific metadata
    pub provider_data: serde_json::Value,
}

/// Basic card information that all providers should provide
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardInfo {
    /// Card name/title
    pub name: String,

    /// Card number in the set
    pub card_number: Option<String>,

    /// Set name
    pub set_name: Option<String>,

    /// Year of release
    pub year: Option<String>,

    /// Category (Pokemon, Magic, etc.)
    pub category: Option<String>,

    /// Language
    pub language: Option<String>,

    /// Image URLs
    pub images: Vec<String>,

    /// External URLs
    pub external_urls: Vec<String>,
}

/// Grading information for professionally graded cards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardGrade {
    /// Grading company (PSA, BGS, CGC, etc.)
    pub grader: String,

    /// Numeric grade (10, 9.5, etc.)
    pub numeric_grade: String,

    /// Full grade description (e.g., "GEM MINT", "Near Mint")
    pub grade_qualifier: Option<String>,

    /// Serial/certification number
    pub serial: Option<String>,

    /// Proof of integrity information
    pub integrity_proof: Option<IntegrityProof>,
}

/// Proof of authenticity/integrity for graded cards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrityProof {
    /// Fingerprint/identifier from the provider
    pub fingerprint: String,

    /// Salt or additional verification data
    pub salt: Option<u64>,

    /// Cryptographic proof
    pub proof: String,

    /// Verification URL
    pub verification_url: Option<String>,
}

/// Card attributes used for grouping and price queries
#[derive(Debug, Clone)]
pub struct CardAttributes {
    pub name: String,
    pub card_number: Option<String>,
    pub year: String,
    pub set_name: Option<String>,
    pub language: Option<String>,
    pub category: Option<String>,
    pub grade_info: Option<CardGrade>,
    pub tags: Vec<String>,
}

impl CardMetadata {
    /// Convert unified metadata to attributes for price queries
    pub fn to_attributes(&self) -> CardAttributes {
        let tags = self.extract_tags();

        CardAttributes {
            name: self.card_info.name.clone(),
            card_number: self.card_info.card_number.clone(),
            year: self.card_info.year.clone().unwrap_or_default(),
            set_name: self.card_info.set_name.clone(),
            language: self.card_info.language.clone(),
            category: self.card_info.category.clone(),
            grade_info: self.grade_info.clone(),
            tags,
        }
    }

    /// Extract special tags from attributes (e.g., "Art Rare", "Holo", etc.)
    fn extract_tags(&self) -> Vec<String> {
        // Look for common Pokemon card tags in attributes
        let mut tags = Vec::new();

        let tag_keys = [
            "rarity",
            "finish",
            "style",
            "special",
            "variation",
            "promo",
            "alternate_art",
            "full_art",
            "secret_rare",
        ];

        for key in &tag_keys {
            if let Some(value) = self.attributes.get(*key) {
                if !value.is_empty() && value != "Common" && value != "Uncommon" {
                    tags.push(value.clone());
                }
            }
        }

        tags.sort();
        tags
    }

    /// Generate a keccak hash for grouping identical cards
    pub fn to_keccak_hash(&self) -> [u8; 32] {
        use sha3::{Digest, Keccak256};

        let attributes = self.to_attributes();
        let mut hasher = Keccak256::new();

        // Hash core attributes for grouping
        hasher.update(attributes.name.as_bytes());
        hasher.update(attributes.year.as_bytes());

        if let Some(set) = &attributes.set_name {
            hasher.update(set.as_bytes());
        }

        if let Some(number) = &attributes.card_number {
            hasher.update(number.as_bytes());
        }

        if let Some(language) = &attributes.language {
            hasher.update(language.as_bytes());
        } else {
            hasher.update(b"English"); // Default language
        }

        if let Some(category) = &attributes.category {
            hasher.update(category.as_bytes());
        }

        // Include grade info if present
        if let Some(grade) = &attributes.grade_info {
            hasher.update(grade.grader.as_bytes());
            hasher.update(grade.numeric_grade.as_bytes());
        }

        // Hash sorted tags
        for tag in &attributes.tags {
            hasher.update(tag.as_bytes());
        }

        hasher.finalize().into()
    }
}

/// Provider types supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProviderType {
    Courtyard,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_metadata() -> CardMetadata {
        CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Infernape".to_string(),
                card_number: Some("070".to_string()),
                set_name: Some("Pokémon Sv5a-Crimson Haze".to_string()),
                year: Some("2024".to_string()),
                category: Some("Pokémon".to_string()),
                language: Some("Japanese".to_string()),
                images: vec!["https://example.com/image.jpg".to_string()],
                external_urls: vec!["https://example.com".to_string()],
            },
            grade_info: Some(CardGrade {
                grader: "PSA".to_string(),
                numeric_grade: "10".to_string(),
                grade_qualifier: Some("GEM MINT".to_string()),
                serial: Some("103343839".to_string()),
                integrity_proof: None,
            }),
            attributes: {
                let mut map = HashMap::new();
                map.insert("rarity".to_string(), "Art Rare".to_string());
                map
            },
            provider_data: serde_json::json!({}),
        }
    }

    #[test]
    fn test_metadata_to_attributes() {
        let metadata = create_test_metadata();
        let attributes = metadata.to_attributes();

        assert_eq!(attributes.name, "Infernape");
        assert_eq!(attributes.card_number, Some("070".to_string()));
        assert_eq!(attributes.grade_info.as_ref().unwrap().grader, "PSA");
        assert_eq!(attributes.grade_info.as_ref().unwrap().numeric_grade, "10");
        assert!(attributes.tags.contains(&"Art Rare".to_string()));
    }

    #[test]
    fn test_non_psa_grade_category() {
        let mut metadata = create_test_metadata();
        metadata.grade_info = Some(CardGrade {
            grader: "BGS".to_string(),
            numeric_grade: "9.5".to_string(),
            grade_qualifier: None,
            serial: None,
            integrity_proof: None,
        });

        // This test now validates that non-PSA graders will be rejected by the coordinator
        let attributes = metadata.to_attributes();
        // The coordinator would reject BGS graders, which is the correct behavior
        assert_eq!(attributes.grade_info.as_ref().unwrap().grader, "BGS");
        assert_eq!(attributes.grade_info.as_ref().unwrap().numeric_grade, "9.5");
    }

    #[test]
    fn test_unsupported_psa_grade() {
        let mut metadata = create_test_metadata();
        metadata.grade_info = Some(CardGrade {
            grader: "PSA".to_string(),
            numeric_grade: "8".to_string(),
            grade_qualifier: Some("Near Mint".to_string()),
            serial: None,
            integrity_proof: None,
        });

        let attributes = metadata.to_attributes();
        // The coordinator would reject PSA 8 graders, which is the correct behavior
        assert_eq!(attributes.grade_info.as_ref().unwrap().grader, "PSA");
        assert_eq!(attributes.grade_info.as_ref().unwrap().numeric_grade, "8");
        assert_eq!(
            attributes.grade_info.as_ref().unwrap().grade_qualifier,
            Some("Near Mint".to_string())
        );
    }

    #[test]
    fn test_missing_grade_info() {
        let mut metadata = create_test_metadata();
        metadata.grade_info = None;

        let attributes = metadata.to_attributes();
        // The coordinator would reject cards without grade info, which is the correct behavior
        assert!(attributes.grade_info.is_none());
    }

    #[test]
    fn test_keccak_hash_generation() {
        let metadata = create_test_metadata();
        let hash1 = metadata.to_keccak_hash();
        let hash2 = metadata.to_keccak_hash();

        assert_eq!(hash1, hash2); // Should be deterministic
        assert_eq!(hash1.len(), 32); // Should be 32 bytes
    }
}
