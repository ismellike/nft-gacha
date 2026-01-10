//! Attribute parsing utilities for Courtyard metadata

use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use anyhow::{anyhow, Result};

use super::types::NFTMetadata;

/// Attribute parsing utilities for extracting card information from Courtyard metadata
pub struct AttributeParser;

impl AttributeParser {
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

    /// Extract categories from attributes
    pub fn categories_from_attributes(attributes: &[super::types::NFTAttribute]) -> Vec<String> {
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

    /// Convert attribute value to string
    pub fn attribute_value_as_string(value: &serde_json::Value) -> Option<String> {
        match value {
            serde_json::Value::String(s) => Some(s.clone()),
            serde_json::Value::Number(n) => Some(n.to_string()),
            serde_json::Value::Bool(b) => Some(b.to_string()),
            _ => None,
        }
    }

    /// Extract set ID from set name
    pub fn extract_set_id(raw_value: &str) -> Option<String> {
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

    /// Normalize card number by removing leading zeros
    pub fn normalize_card_number(value: &str) -> Option<String> {
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

    /// Normalize grade value to extract numeric grade
    pub fn normalize_grade_value(value: &str) -> Option<String> {
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

    /// Detect if grade is a perfect grade (Pristine, Black Label, etc.)
    pub fn detect_perfect_grade(value: &str) -> bool {
        let upper = value.to_ascii_uppercase();
        upper.contains("PRISTINE") || upper.contains("BLACK LABEL") || upper.contains("PERFECT")
    }
}

/// TryInto implementation for converting NFTMetadata to ScrydexCardInfo
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
                let value_str = AttributeParser::attribute_value_as_string(&attr.value);

                match trait_type.to_lowercase().as_str() {
                    "card number" | "number" => {
                        if let Some(value) = value_str {
                            card_number = AttributeParser::normalize_card_number(&value);
                        }
                    }
                    "grade" | "rating" => {
                        if let Some(value) = value_str {
                            grade = AttributeParser::normalize_grade_value(&value);
                            if AttributeParser::detect_perfect_grade(&value) {
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
                if let Some(value_str) = AttributeParser::attribute_value_as_string(&attr.value) {
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
            Some(AttributeParser::construct_variant_string(&variant_parts))
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
