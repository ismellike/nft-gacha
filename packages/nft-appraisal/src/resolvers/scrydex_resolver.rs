//! Scrydex card info type for resolver arguments
//!
//! This file contains the shared ScrydexCardInfo type that is used
//! across the appraisal system.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ScrydexCardInfo {
    pub card_number: String,
    pub grade: String,
    pub company: String,
    pub is_perfect: bool,
    pub set_id: String,
    pub variant: Option<String>,
}

impl ScrydexCardInfo {
    /// Returns the card identifier in the format "{set_id}-{card_number}"
    pub fn card_identifier(&self) -> String {
        format!("{}-{}", self.set_id.trim(), self.card_number.trim())
    }

    /// Extract variant information from Courtyard metadata attributes
    pub fn from_courtyard_metadata(
        card_number: String,
        grade: String,
        company: String,
        is_perfect: bool,
        set_id: String,
        attributes: &[serde_json::Value],
    ) -> Self {
        let variant = Self::extract_variant_from_attributes(attributes);
        Self {
            card_number,
            grade,
            company,
            is_perfect,
            set_id,
            variant,
        }
    }

    /// Construct variant string in the format expected by Scrydex
    /// e.g., ["1st Edition", "Shadowless"] → "firstEditionShadowless"
    /// e.g., ["1st Edition", "Shadowless", "Holo"] → "firstEditionShadowlessHolofoil"
    pub fn construct_variant_string(variant_parts: &[String]) -> String {
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

    /// Extract variant information from Courtyard attributes array
    /// Combines variant attributes like "1st Edition" and "Shadowless" into "firstEditionShadowless"
    pub fn extract_variant_from_attributes(attributes: &[serde_json::Value]) -> Option<String> {
        let mut variant_parts = Vec::new();

        for attr in attributes {
            if let Some(obj) = attr.as_object() {
                // Check for variant attributes that don't have a trait_type
                if !obj.contains_key("trait_type") {
                    if let Some(value) = obj.get("value").and_then(|v| v.as_str()) {
                        // Common variant indicators that we want to include
                        if matches!(
                            value.to_lowercase().as_str(),
                            "1st edition"
                                | "shadowless"
                                | "unlimited"
                                | "holo"
                                | "holofoil"
                                | "reverse holofoil"
                                | "reverse holo"
                        ) {
                            variant_parts.push(value.trim().to_string());
                        }
                    }
                }
            }
        }

        if variant_parts.is_empty() {
            None
        } else {
            Some(Self::construct_variant_string(&variant_parts))
        }
    }
}
