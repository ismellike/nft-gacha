//! Price matching logic for Scrydex card data

use super::types::{ScrydexCard, ScrydexGradedPrice};

/// Price matching utilities for Scrydex card data
pub struct PriceMatcher;

impl PriceMatcher {
    /// Find matching price from card variants based on grade, company, perfect status, and variant
    pub fn find_matching_price<'a>(
        card: &'a ScrydexCard,
        grade: &str,
        company: &str,
        is_perfect: bool,
        variant: &Option<String>,
    ) -> Option<&'a ScrydexGradedPrice> {
        // If no variant specified, only proceed if there's exactly 1 variant
        let allowed_variants: Vec<&super::types::ScrydexCardVariant> = match variant {
            Some(requested_variant) => {
                // Find the specific variant that matches
                let requested_normalized = requested_variant.to_lowercase().replace(" ", "");
                card.variants
                    .iter()
                    .filter(|v| {
                        let card_variant_normalized = v.name.to_lowercase().replace(" ", "");
                        requested_normalized == card_variant_normalized
                    })
                    .collect()
            }
            None => {
                // Only allow if there's exactly 1 variant
                if card.variants.len() == 1 {
                    vec![&card.variants[0]]
                } else {
                    return None; // Multiple variants but none specified
                }
            }
        };

        // Search for matching price in allowed variants
        for card_variant in allowed_variants {
            for price in &card_variant.prices {
                let grade_matches = price.grade == grade;
                let company_matches = price.company.to_uppercase() == company.to_uppercase();
                let perfect_matches = price.is_perfect == is_perfect;

                if grade_matches && company_matches && perfect_matches {
                    return Some(price);
                }
            }
        }
        None
    }
}
