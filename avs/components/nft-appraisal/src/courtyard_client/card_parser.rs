use super::types::NFTAttribute;
use anyhow::{anyhow, Result};

pub struct CardParser;

impl CardParser {
    /// Extract a clean rarity from the NFT name when attributes are missing.
    /// Example: "... Infernape - Art Rare (PSA 10 GEM MINT)" -> "Art Rare"
    pub fn extract_rarity_from_name(name: &str) -> Option<String> {
        let mut s = name;
        // Find segment after " - " if present
        if let Some(idx) = s.find(" - ") {
            s = &s[idx + 3..];
        } else {
            return None;
        }
        // Cut off grade/parenthetical
        if let Some(p) = s.find("(") {
            s = &s[..p];
        }
        let rarity = s.trim();
        if rarity.is_empty() {
            None
        } else {
            Some(rarity.to_string())
        }
    }

    /// Extract a better card name from attributes if available.
    /// Prefer "Title/Subject", then "Title" or "Subject".
    pub fn extract_title_from_attributes(attributes: &[NFTAttribute]) -> Option<String> {
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                let key = trait_type.to_lowercase();
                if key == "title/subject"
                    || key == "title"
                    || key == "subject"
                    || key == "card title"
                {
                    if let Some(v) = attr.value.as_str() {
                        let t = v.trim();
                        if !t.is_empty() {
                            return Some(t.to_string());
                        }
                    }
                }
            }
        }
        None
    }
    /// Extract card name from NFT name (remove set info, numbers, etc.)
    pub fn extract_card_name(name: &str) -> Result<String> {
        if name.trim().is_empty() {
            return Err(anyhow!("NFT name cannot be empty"));
        }

        // Common patterns in Pokemon card names:
        // "Charizard #004/102 - Base Set"
        // "Pikachu (PSA 10)"
        // "Charizard VMAX - Champion's Path #020/073"

        let mut card_name = name.to_string();

        // Remove set information in parentheses or after dashes
        if let Some(pos) = card_name.find(" - ") {
            card_name = card_name[..pos].to_string();
        }

        // Remove card numbers like "#004/102"
        if let Some(pos) = card_name.find(" #") {
            card_name = card_name[..pos].to_string();
        }

        // Remove grade information in parentheses like "(PSA 10)"
        if let Some(pos) = card_name.find(" (") {
            if card_name.contains("PSA") {
                card_name = card_name[..pos].to_string();
            }
        }

        let cleaned_name = card_name.trim().to_string();
        if cleaned_name.is_empty() {
            return Err(anyhow!("Could not extract card name from: {}", name));
        }

        Ok(cleaned_name)
    }

    /// Extract set information from NFT attributes
    pub fn extract_set_from_attributes(attributes: &[NFTAttribute]) -> Option<String> {
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                match trait_type.to_lowercase().as_str() {
                    "set" | "expansion" | "series" => {
                        return attr.value.as_str().map(|s| s.to_string())
                    }
                    _ => continue,
                }
            }
        }
        None
    }

    /// Extract grade information from NFT attributes
    pub fn extract_grade_from_attributes(attributes: &[NFTAttribute]) -> Option<String> {
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                match trait_type.to_lowercase().as_str() {
                    "grade" | "condition" | "grading" => {
                        let grade_str = attr.value.as_str()?.to_uppercase();
                        if grade_str.contains("10") {
                            return Some("PSA 10".to_string());
                        } else if grade_str.contains("9") {
                            return Some("PSA 9".to_string());
                        } else if grade_str.contains("RAW") || grade_str.contains("UNGRADED") {
                            return Some("raw".to_string());
                        }
                        return attr.value.as_str().map(|s| s.to_string());
                    }
                    _ => continue,
                }
            }
        }
        None
    }

    /// Extract card number from NFT attributes
    pub fn extract_card_number_from_attributes(attributes: &[NFTAttribute]) -> Option<String> {
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                match trait_type.to_lowercase().as_str() {
                    "card number" | "number" | "card_number" => {
                        return attr.value.as_str().map(|s| s.to_string())
                    }
                    _ => continue,
                }
            }
        }
        None
    }

    /// Extract rarity from NFT attributes  
    pub fn extract_rarity_from_attributes(attributes: &[NFTAttribute]) -> Option<String> {
        for attr in attributes {
            if let Some(trait_type) = &attr.trait_type {
                match trait_type.to_lowercase().as_str() {
                    "rarity" | "card_rarity" => return attr.value.as_str().map(|s| s.to_string()),
                    _ => continue,
                }
            }
        }
        None
    }
}
