use super::types::{NFTAttribute, NFTMetadata};
use anyhow::{anyhow, Result};
use std::collections::HashMap;

pub struct CardParser;

impl CardParser {
    /// Parse graded card attributes from Courtyard metadata
    pub fn parse_graded_card_attributes(metadata: &NFTMetadata) -> Result<GradedCardAttributes> {
        // Verify this is a graded card
        if metadata.product_type.as_deref() != Some("GRADED_CARD") {
            return Err(anyhow!("NFT is not a graded card (product_type: {:?})", metadata.product_type));
        }

        // Convert attributes to map for easy lookup
        let attr_map = Self::attributes_to_map(&metadata.attributes);
        
        // Extract required fields using normalized trait types
        let grader = attr_map.get("Grader")
            .ok_or_else(|| anyhow!("Missing required Grader attribute"))?
            .clone();
            
        let grade = attr_map.get("Grade")
            .ok_or_else(|| anyhow!("Missing required Grade attribute"))?
            .clone();
            
        let title = attr_map.get("Title/Subject")
            .ok_or_else(|| anyhow!("Missing required Title/Subject attribute"))?
            .clone();
            
        let card_number = attr_map.get("Card Number")
            .ok_or_else(|| anyhow!("Missing required Card Number attribute"))?
            .clone();
            
        let year = attr_map.get("Year")
            .ok_or_else(|| anyhow!("Missing required Year attribute"))?
            .clone();
            
        // Optional fields
        let set = attr_map.get("Set").cloned();
        let language = attr_map.get("Language").cloned();
        let category = attr_map.get("Category").cloned();
        let serial = attr_map.get("Serial").cloned();
        
        Ok(GradedCardAttributes {
            grader,
            grade,
            title,
            card_number,
            year,
            set,
            language,
            category,
            serial,
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

#[derive(Debug, Clone)]
pub struct GradedCardAttributes {
    pub grader: String,
    pub grade: String, 
    pub title: String,
    pub card_number: String,
    pub year: String,
    pub set: Option<String>,
    pub language: Option<String>,
    pub category: Option<String>,
    pub serial: Option<String>,
}
