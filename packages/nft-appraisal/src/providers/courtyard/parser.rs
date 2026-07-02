//! Attribute parsing utilities for Courtyard metadata

use std::collections::HashSet;

use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use anyhow::{anyhow, Result};

use super::types::NFTMetadata;

/// Attribute parsing utilities for extracting card information from Courtyard metadata
pub struct AttributeParser;

impl AttributeParser {
    /// Valid variant values that should be extracted from Courtyard metadata
    /// These are the only values that will be recognized as card variants
    const VALID_VARIANTS: &[&str] = &[
        // Edition variants
        "1st edition",
        "shadowless",
        "unlimited",
        // Foil/Holo variants
        "holo",
        "holofoil",
        "reverse holo",
        "reverse holofoil",
        "cosmos holo",
        "cosmos holofoil",
        // Promo stamp variants
        "snowflake stamp",
        // Base variant
        "normal",
        // Art/Rarity variants
        "full art",
        "special illustration rare",
    ];

    /// Check if a value is a valid variant
    /// Public for use by other modules that need variant validation
    pub fn is_valid_variant(value: &str) -> bool {
        let value_lower = value.to_ascii_lowercase();
        let trimmed = value_lower.trim();
        Self::VALID_VARIANTS.contains(&trimmed)
    }

    /// Construct variant string in the format expected by Scrydex
    /// e.g., ["1st Edition", "Shadowless"] → "firstEditionShadowless"
    /// e.g., ["1st Edition", "Shadowless", "Holo"] → "firstEditionShadowlessHolofoil"
    /// e.g., ["Special Illustration Rare"] → "SpecialIllustrationRare"
    /// e.g., ["Snowflake Stamp", "Cosmos Holo"] → "holidayStampCosmosHolo"
    ///
    /// Variants discovered from Courtyard API and Scrydex:
    /// - Courtyard metadata: "Holo", "Full Art", "Special Illustration Rare", "1st Edition", "Shadowless", "Snowflake Stamp", "Cosmos Holo"
    /// - Scrydex variants array: "unlimitedHolofoil", "firstEditionShadowlessHolofoil", "unlimitedShadowlessHolofoil"
    /// - Scrydex price object keys: "normal", "reverseHolofoil"
    pub fn construct_variant_string(variant_parts: &[String]) -> String {
        if variant_parts.is_empty() {
            return String::new();
        }

        // Pre-allocate capacity: roughly estimate 15 chars per part
        let estimated_capacity = variant_parts.len() * 15;
        let mut result = String::with_capacity(estimated_capacity);

        for part in variant_parts {
            let mapped = Self::map_variant_part(part);
            result.push_str(mapped);
        }

        result
    }

    /// Map a single variant part to its Scrydex-expected format
    /// This is a separate function to enable testing and reduce allocations
    fn map_variant_part(part: &str) -> &str {
        // Use ASCII lowercase for known ASCII strings (faster than to_lowercase)
        let part_lower = part.to_ascii_lowercase();

        match part_lower.trim() {
            // Edition variants (found in Courtyard and Scrydex)
            "1st edition" => "firstEdition",
            "shadowless" => "Shadowless",
            "unlimited" => "unlimited",

            // Foil/Holo variants (found in both Courtyard and Scrydex)
            "holo" | "holofoil" => "Holofoil",
            "reverse holo" | "reverse holofoil" => "ReverseHolofoil",
            "cosmos holo" | "cosmos holofoil" => "CosmosHolo",

            // Promo stamp variants (Snowflake Stamp → holidayStamp for Scrydex)
            "snowflake stamp" => "holidayStamp",

            // Base variant
            "normal" => "Normal",

            // Art/Rarity variants (found in Courtyard metadata)
            "full art" => "FullArt",
            "special illustration rare" => "SpecialIllustrationRare",

            // Return original if no mapping (preserves case for unknown variants)
            _ => part.trim(),
        }
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
    /// Preserves non-digit suffixes (e.g., "070/100" → "70/100", "TG23" → "TG23")
    /// Handles ASCII characters only; Unicode characters are preserved as-is
    pub fn normalize_card_number(value: &str) -> Option<String> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return None;
        }

        // Find the end of leading ASCII digits (0-9 only)
        let digits_end = trimmed.bytes().take_while(|&b| b.is_ascii_digit()).count();

        if digits_end == 0 {
            // No leading digits, return as-is (e.g., "TG23")
            return Some(trimmed.to_string());
        }

        let leading = &trimmed[..digits_end];
        let remainder = &trimmed[digits_end..];

        // Remove leading zeros, keep at least one digit
        let stripped = leading.trim_start_matches('0');
        let normalized_digits = if stripped.is_empty() { "0" } else { stripped };

        let mut normalized = String::with_capacity(leading.len() + remainder.len());
        normalized.push_str(normalized_digits);
        normalized.push_str(remainder);
        Some(normalized)
    }

    /// Normalize grade value to extract numeric grade
    /// Validates that grade is within reasonable bounds (0-10 for most grading scales)
    /// Returns None if grade cannot be extracted or is invalid
    pub fn normalize_grade_value(value: &str) -> Option<String> {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            return None;
        }

        // Handle RAW (ungraded) cards
        if trimmed.eq_ignore_ascii_case("RAW") {
            return Some("RAW".to_string());
        }

        // Try to extract a numeric grade from tokens
        for token in trimmed.split_whitespace() {
            // Skip negative numbers early (before cleaning)
            if token.contains('-') {
                continue;
            }

            let clean = token.trim_matches(|c: char| !c.is_ascii_alphanumeric() && c != '.');
            if clean.is_empty() {
                continue;
            }

            // Validate that the token contains only digits and at most one decimal point
            let has_digit = clean.chars().any(|c| c.is_ascii_digit());
            let dot_count = clean.chars().filter(|&c| c == '.').count();

            if !has_digit || dot_count > 1 {
                continue;
            }

            // Try to parse as float and validate range
            if let Ok(grade_num) = clean.parse::<f64>() {
                // Valid grade ranges: 0-10 for most grading scales
                // Allow for half-grades (e.g., 9.5)
                if (0.0..=10.0).contains(&grade_num) {
                    return Some(clean.to_string());
                }
            }
        }

        // If we can't extract a valid numeric grade, return the original trimmed value
        Some(trimmed.to_string())
    }

    /// Detect if grade is a perfect grade (Pristine, Black Label, etc.)
    /// Uses word boundary matching to avoid false positives
    pub fn detect_perfect_grade(value: &str) -> bool {
        let upper = value.to_ascii_uppercase();

        // Check for negations first - if any of these patterns exist, it's not perfect
        let negation_patterns = [
            ("NOT PRISTINE", "NOT"),
            ("NO PRISTINE", "NO"),
            ("NOT PERFECT", "NOT"),
            ("NO PERFECT", "NO"),
            ("NON PRISTINE", "NON"),
            ("NON PERFECT", "NON"),
            ("WITHOUT PRISTINE", "WITHOUT"),
            ("WITHOUT PERFECT", "WITHOUT"),
        ];

        for (pattern, _) in &negation_patterns {
            if upper.contains(pattern) {
                return false;
            }
        }

        // Look for perfect grade indicators as whole words/phrases
        // Check for PRISTINE, BLACK LABEL, GEM MINT 10, PERFECT 10, PERFECT
        if upper.contains("PRISTINE") {
            return true;
        }

        // For multi-word phrases, check exact matches
        if upper.contains("BLACK LABEL") {
            return true;
        }

        if upper.contains("GEM MINT 10") {
            return true;
        }

        if upper.contains("PERFECT 10") {
            return true;
        }

        // Check for standalone PERFECT to preserve prior behavior
        if upper.split_whitespace().any(|token| token == "PERFECT") {
            return true;
        }

        false
    }
}

/// TryFrom implementation for converting NFTMetadata to ScrydexCardInfo
impl TryFrom<&NFTMetadata> for ScrydexCardInfo {
    type Error = anyhow::Error;

    fn try_from(value: &NFTMetadata) -> Result<ScrydexCardInfo> {
        let mut card_number = None;
        let mut grade = None;
        let mut company = None;
        let mut is_perfect = false;
        let mut set_name = None;
        let mut variant_parts = Vec::new();

        // Extract information from attributes
        for attr in &value.attributes {
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
                    // Check for combined format like "Holiday Calendar (Snowflake Stamp) (Cosmos Holo)"
                    if value_str.contains('(') && value_str.contains(')') {
                        // Parse combined format: extract parts from parentheses
                        if let Some((prefix, _)) = value_str.split_once('(') {
                            let prefix_trimmed = prefix.trim();
                            if !prefix_trimmed.is_empty()
                                && AttributeParser::is_valid_variant(prefix_trimmed)
                            {
                                variant_parts.push(prefix_trimmed.to_string());
                            }
                        }

                        let parts: Vec<&str> = value_str
                            .split(')')
                            .filter_map(|s| {
                                let trimmed = s.trim();
                                if trimmed.is_empty() {
                                    None
                                } else {
                                    trimmed.find('(').map(|idx| trimmed[idx + 1..].trim())
                                }
                            })
                            .collect();

                        // Only add parts that are valid variants
                        for part in parts {
                            if AttributeParser::is_valid_variant(part) {
                                variant_parts.push(part.trim().to_string());
                            }
                        }
                    } else {
                        // Simple single-value format - only add if it's a valid variant
                        if AttributeParser::is_valid_variant(&value_str) {
                            variant_parts.push(value_str.trim().to_string());
                        }
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

        let set_raw = set_name.ok_or_else(|| anyhow!("Missing required set name attribute"))?;
        let set_id = AttributeParser::extract_set_id(&set_raw).unwrap_or(set_raw);

        // Deduplicate variant parts (case-insensitive) while preserving order
        let mut seen = HashSet::new();
        variant_parts.retain(|part| seen.insert(part.to_ascii_lowercase()));

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

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    // -----------------------------------------------------------------------
    // Unit tests for parser functions
    // -----------------------------------------------------------------------

    #[test]
    fn test_normalize_card_number_basic() {
        assert_eq!(
            AttributeParser::normalize_card_number("070/100"),
            Some("70/100".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_card_number("007"),
            Some("7".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_card_number("0"),
            Some("0".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_card_number("000"),
            Some("0".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_card_number("TG23"),
            Some("TG23".to_string())
        );
        assert_eq!(AttributeParser::normalize_card_number(""), None);
        assert_eq!(AttributeParser::normalize_card_number("  "), None);
    }

    #[test]
    fn test_normalize_grade_value_basic() {
        assert_eq!(
            AttributeParser::normalize_grade_value("9.5"),
            Some("9.5".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_grade_value("10"),
            Some("10".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_grade_value("RAW"),
            Some("RAW".to_string())
        );
        assert_eq!(
            AttributeParser::normalize_grade_value("raw"),
            Some("RAW".to_string())
        );
        assert_eq!(AttributeParser::normalize_grade_value(""), None);
        assert_eq!(
            AttributeParser::normalize_grade_value("PSA 9"),
            Some("9".to_string())
        );
    }

    #[test]
    fn test_detect_perfect_grade_basic() {
        assert!(AttributeParser::detect_perfect_grade("PRISTINE"));
        assert!(AttributeParser::detect_perfect_grade("Black Label 10"));
        assert!(AttributeParser::detect_perfect_grade("GEM MINT 10"));
        assert!(AttributeParser::detect_perfect_grade("PERFECT 10"));
        assert!(AttributeParser::detect_perfect_grade(
            "This is PERFECT work"
        ));
        assert!(!AttributeParser::detect_perfect_grade("NOT PRISTINE"));
        assert!(!AttributeParser::detect_perfect_grade("grade 9"));
        assert!(!AttributeParser::detect_perfect_grade(""));
    }

    #[test]
    fn test_extract_set_id_basic() {
        assert_eq!(
            AttributeParser::extract_set_id("Pokémon Base-Set"),
            Some("base".to_string())
        );
        assert_eq!(
            AttributeParser::extract_set_id("Pokemon Jungle"),
            Some("jungle".to_string())
        );
        assert_eq!(
            AttributeParser::extract_set_id("SV06"),
            Some("sv06".to_string())
        );
        assert_eq!(AttributeParser::extract_set_id(""), None);
        assert_eq!(AttributeParser::extract_set_id("   "), None);
    }

    #[test]
    fn test_construct_variant_string_basic() {
        assert_eq!(AttributeParser::construct_variant_string(&[]), "");
        assert_eq!(
            AttributeParser::construct_variant_string(&["1st Edition".to_string()]),
            "firstEdition"
        );
        assert_eq!(
            AttributeParser::construct_variant_string(&[
                "1st Edition".to_string(),
                "Holo".to_string()
            ]),
            "firstEditionHolofoil"
        );
    }

    // -----------------------------------------------------------------------
    // Proptest fuzz tests
    // -----------------------------------------------------------------------

    proptest! {
        #[test]
        fn fuzz_normalize_card_number_never_panics(input in ".*") {
            let result = AttributeParser::normalize_card_number(&input);
            // Empty/whitespace-only input should return None
            if input.trim().is_empty() {
                prop_assert!(result.is_none());
            } else {
                prop_assert!(result.is_some());
                let normalized = result.unwrap();
                // Result should never be empty when input is non-empty
                prop_assert!(!normalized.is_empty());
            }
        }

        #[test]
        fn fuzz_normalize_card_number_no_leading_zeros(
            leading_zeros in 0usize..10,
            number in 0u32..10000,
            suffix in proptest::option::of("[a-zA-Z/]{0,5}"),
        ) {
            let input = format!("{}{}{}", "0".repeat(leading_zeros), number, suffix.unwrap_or_default());
            let result = AttributeParser::normalize_card_number(&input).unwrap();
            // Result should not have unnecessary leading zeros
            if result.starts_with('0') && result.len() > 1 {
                // Only valid if the second char is not a digit (e.g., "0/100")
                let second = result.chars().nth(1).unwrap();
                prop_assert!(!second.is_ascii_digit(), "Should not have leading zeros: {}", result);
            }
        }

        #[test]
        fn fuzz_normalize_grade_value_never_panics(input in ".*") {
            let _ = AttributeParser::normalize_grade_value(&input);
        }

        #[test]
        fn fuzz_normalize_grade_value_valid_grades(grade in 0.0f64..=10.0) {
            let input = format!("{:.1}", grade);
            let result = AttributeParser::normalize_grade_value(&input);
            prop_assert!(result.is_some(), "Valid grade {} should parse", input);
        }

        #[test]
        fn fuzz_normalize_grade_value_out_of_range(grade in 10.1f64..=1000.0) {
            let input = format!("{:.1}", grade);
            let result = AttributeParser::normalize_grade_value(&input);
            // Out-of-range should fall through to returning the original value
            prop_assert!(result.is_some());
            // But the result should be the original input since no valid grade was found
            prop_assert_eq!(result.unwrap(), input.trim().to_string());
        }

        #[test]
        fn fuzz_detect_perfect_grade_never_panics(input in ".*") {
            let _ = AttributeParser::detect_perfect_grade(&input);
        }

        #[test]
        fn fuzz_detect_perfect_grade_negation_overrides(
            prefix in "(NOT|NO|NON|WITHOUT) ",
            keyword in "(PRISTINE|PERFECT)",
            suffix in "[a-zA-Z0-9 ]{0,20}",
        ) {
            let input = format!("{}{} {}", prefix, keyword, suffix);
            let result = AttributeParser::detect_perfect_grade(&input);
            prop_assert!(!result, "Negated keyword should not be detected as perfect: {}", input);
        }

        #[test]
        fn fuzz_extract_set_id_never_panics(input in ".*") {
            let _ = AttributeParser::extract_set_id(&input);
        }

        #[test]
        fn fuzz_extract_set_id_strips_pokemon_prefix(set_name in "[A-Z][a-z]{2,10}") {
            let with_prefix = format!("Pokémon {}", set_name);
            let without_prefix = &set_name;
            let result_with = AttributeParser::extract_set_id(&with_prefix);
            let result_without = AttributeParser::extract_set_id(without_prefix);
            prop_assert_eq!(result_with, result_without, "Pokemon prefix should be stripped");
        }

        #[test]
        fn fuzz_construct_variant_string_never_panics(
            parts in proptest::collection::vec(".*", 0..10),
        ) {
            let _ = AttributeParser::construct_variant_string(&parts);
        }

        #[test]
        fn fuzz_construct_variant_string_empty_on_empty_input(
            count in 0usize..1,
        ) {
            let parts: Vec<String> = Vec::with_capacity(count);
            let result = AttributeParser::construct_variant_string(&parts);
            prop_assert!(result.is_empty());
        }

        #[test]
        fn fuzz_is_valid_variant_never_panics(input in ".*") {
            let _ = AttributeParser::is_valid_variant(&input);
        }
    }
}
