use super::types::{NFTAttribute, NFTMetadata};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};
use std::collections::HashMap;

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

        let grade = all_attributes
            .get("Grade")
            .ok_or_else(|| anyhow!("Missing required Grade attribute"))?
            .clone();

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
        // e.g., { "value": "Holo" }, { "value": "Full Art" }
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
        // Sort tags for stable grouping
        tags.sort();

        Ok(GradedCardAttributes {
            grader,
            grade,
            title,
            card_number,
            year,
            set,
            language,
            category,
            event,
            tags,
            other_attributes,
        })
    }

    /// Convert attributes to a simple map for easy lookups
    fn attributes_to_map(attributes: &[NFTAttribute]) -> HashMap<String, String> {
        let mut map = HashMap::new();
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                if let Some(value) = attr.value.as_str() {
                    map.insert(trait_type.clone(), value.to_string());
                }
            }
        }
        map
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedCardAttributes {
    // Core grouping attributes (used for price grouping)
    pub grader: String,
    pub grade: String,
    pub title: String,
    pub card_number: String,
    pub year: String,
    pub set: Option<String>,
    pub language: Option<String>,
    pub category: Option<String>,
    pub event: Option<String>,
    pub tags: Vec<String>, // Attributes without trait_type

    // All other attributes (Serial, etc.) - for display purposes only.
    // IMPORTANT: Skip serializing this field to avoid including unique
    // per-token data in the bytes used to derive the on-chain cardId.
    // Without this, identical cards could fail to group/share prices.
    #[serde(skip, default)]
    pub other_attributes: HashMap<String, String>,
}

impl GradedCardAttributes {
    /// Generate a keccak256 hash of the graded card attributes for use as groupId/cardId.
    /// Uses only the attributes that determine price grouping for consistent hashing.
    pub fn to_keccak_hash(&self) -> [u8; 32] {
        let mut hasher = Keccak256::new();

        // Hash the core grouping attributes in a deterministic order
        hasher.update(self.grader.as_bytes());
        hasher.update(self.grade.as_bytes());
        hasher.update(self.title.as_bytes());
        hasher.update(self.card_number.as_bytes());
        hasher.update(self.year.as_bytes());

        // Handle optional fields with consistent default values
        hasher.update(self.set.as_ref().unwrap_or(&String::new()).as_bytes());
        hasher.update(
            self.language
                .as_ref()
                .unwrap_or(&"English".to_string())
                .as_bytes(),
        );
        hasher.update(self.category.as_ref().unwrap_or(&String::new()).as_bytes());
        hasher.update(self.event.as_ref().unwrap_or(&String::new()).as_bytes());

        // Hash sorted tags for consistent ordering
        for tag in &self.tags {
            hasher.update(tag.as_bytes());
        }

        hasher.finalize().into()
    }
}
