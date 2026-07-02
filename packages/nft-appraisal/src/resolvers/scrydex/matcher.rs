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
                // Skip entries Scrydex itself flags as erroneous/placeholder so a bad
                // price can never be pushed on-chain as a valid appraisal.
                if price.is_error {
                    continue;
                }

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

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    fn make_price(grade: &str, company: &str, is_perfect: bool) -> ScrydexGradedPrice {
        ScrydexGradedPrice {
            grade: grade.to_string(),
            company: company.to_string(),
            is_perfect,
            is_signed: false,
            is_error: false,
            r#type: "market".to_string(),
            low: 1.0,
            mid: 5.0,
            high: 10.0,
            market: 5.0,
            currency: "USD".to_string(),
            trends: None,
        }
    }

    fn make_card(variants: Vec<(&str, Vec<ScrydexGradedPrice>)>) -> ScrydexCard {
        ScrydexCard {
            id: "test".to_string(),
            name: "Test Card".to_string(),
            number: Some("1".to_string()),
            rarity: None,
            expansion: None,
            variants: variants
                .into_iter()
                .map(|(name, prices)| super::super::types::ScrydexCardVariant {
                    name: name.to_string(),
                    prices,
                })
                .collect(),
        }
    }

    #[test]
    fn test_single_variant_no_variant_specified() {
        let card = make_card(vec![("normal", vec![make_price("9", "PSA", false)])]);
        let result = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);
        assert!(result.is_some());
    }

    #[test]
    fn test_multiple_variants_no_variant_specified_returns_none() {
        let card = make_card(vec![
            ("normal", vec![make_price("9", "PSA", false)]),
            ("holofoil", vec![make_price("9", "PSA", false)]),
        ]);
        let result = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);
        assert!(result.is_none());
    }

    #[test]
    fn test_error_flagged_price_is_skipped() {
        let mut bad = make_price("9", "PSA", false);
        bad.is_error = true;
        let card = make_card(vec![("normal", vec![bad])]);
        let result = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);
        assert!(result.is_none(), "error-flagged price must not match");
    }

    #[test]
    fn test_error_flagged_price_falls_through_to_valid() {
        let mut bad = make_price("9", "PSA", false);
        bad.is_error = true;
        let good = make_price("9", "PSA", false);
        let card = make_card(vec![("normal", vec![bad, good])]);
        let result = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);
        assert!(
            result.is_some(),
            "valid price after an error-flagged one must still match"
        );
        assert!(!result.unwrap().is_error);
    }

    proptest! {
        #[test]
        fn fuzz_find_matching_price_never_panics(
            grade in "[0-9]{1,2}",
            company in "[A-Z]{2,5}",
            is_perfect in any::<bool>(),
            variant in proptest::option::of("[a-zA-Z]{1,20}"),
            num_variants in 0usize..5,
        ) {
            let variants: Vec<_> = (0..num_variants)
                .map(|i| {
                    let name = format!("variant_{}", i);
                    let prices = vec![make_price("9", "PSA", false)];
                    (name, prices)
                })
                .collect();
            let card = ScrydexCard {
                id: "test".to_string(),
                name: "Test Card".to_string(),
                number: None,
                rarity: None,
                expansion: None,
                variants: variants
                    .into_iter()
                    .map(|(name, prices)| super::super::types::ScrydexCardVariant { name, prices })
                    .collect(),
            };
            // Should never panic
            let _ = PriceMatcher::find_matching_price(&card, &grade, &company, is_perfect, &variant);
        }

        #[test]
        fn fuzz_variant_matching_case_insensitive(
            variant_name in "[a-zA-Z]{3,15}",
            grade in "[0-9]{1,2}",
        ) {
            let prices = vec![make_price(&grade, "PSA", false)];
            let card = make_card(vec![(&variant_name, prices)]);

            // Search with uppercase variant
            let upper = Some(variant_name.to_uppercase());
            let result_upper = PriceMatcher::find_matching_price(&card, &grade, "PSA", false, &upper);
            // Search with lowercase variant
            let lower = Some(variant_name.to_lowercase());
            let result_lower = PriceMatcher::find_matching_price(&card, &grade, "PSA", false, &lower);

            // Both should find the same result (or both None)
            prop_assert_eq!(result_upper.is_some(), result_lower.is_some(),
                "Case sensitivity mismatch for variant '{}'", variant_name);
        }

        #[test]
        fn fuzz_company_matching_case_insensitive(
            company in "[a-zA-Z]{2,5}",
        ) {
            let card = make_card(vec![("normal", vec![make_price("9", &company, false)])]);

            let result_upper = PriceMatcher::find_matching_price(
                &card, "9", &company.to_uppercase(), false, &None,
            );
            let result_lower = PriceMatcher::find_matching_price(
                &card, "9", &company.to_lowercase(), false, &None,
            );

            prop_assert_eq!(result_upper.is_some(), result_lower.is_some(),
                "Company matching should be case-insensitive");
        }

        #[test]
        fn fuzz_empty_card_always_returns_none(
            grade in ".*",
            company in ".*",
            is_perfect in any::<bool>(),
            variant in proptest::option::of(".*"),
        ) {
            let card = make_card(vec![]);
            let result = PriceMatcher::find_matching_price(&card, &grade, &company, is_perfect, &variant);
            prop_assert!(result.is_none(), "Empty card should always return None");
        }
    }
}
