//! Tests for Scrydex resolver

#![allow(unused_imports)]

use super::matcher::*;
use super::types::*;
use crate::resolvers::scrydex_resolver::ScrydexCardInfo;

#[test]
fn card_identifier_formats_correctly() {
    let info = ScrydexCardInfo {
        card_number: "1".to_string(),
        grade: "10".to_string(),
        company: "PSA".to_string(),
        is_perfect: false,
        set_id: "sv5a".to_string(),
        variant: None,
    };
    assert_eq!(info.card_identifier(), "sv5a-1");

    let info_with_spaces = ScrydexCardInfo {
        card_number: " 1 ".to_string(),
        grade: "10".to_string(),
        company: "PSA".to_string(),
        is_perfect: false,
        set_id: " sv5a ".to_string(),
        variant: Some("firstEditionShadowless".to_string()),
    };
    assert_eq!(info_with_spaces.card_identifier(), "sv5a-1");
}

#[test]
fn test_find_matching_price_no_variant_single_variant_allowed() {
    use super::types::*;
    let card = ScrydexCard {
        id: "test".to_string(),
        name: "Test Card".to_string(),
        number: Some("1".to_string()),
        rarity: Some("Rare".to_string()),
        expansion: Some(ScrydexCardExpansion {
            id: "test-set".to_string(),
            name: "Test Set".to_string(),
            code: Some("TST".to_string()),
        }),
        variants: vec![ScrydexCardVariant {
            name: "Normal".to_string(),
            prices: vec![ScrydexGradedPrice {
                grade: "9".to_string(),
                company: "PSA".to_string(),
                is_perfect: false,
                is_signed: false,
                is_error: false,
                r#type: "graded".to_string(),
                low: 100.0,
                mid: 120.0,
                high: 150.0,
                market: 110.0,
                currency: "USD".to_string(),
                trends: None,
            }],
        }],
    };

    let price = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);

    assert!(price.is_some());
    assert_eq!(price.unwrap().market, 110.0);
}

#[test]
fn test_find_matching_price_no_variant_multiple_variants_rejected() {
    use super::types::*;
    let card = ScrydexCard {
        id: "test".to_string(),
        name: "Test Card".to_string(),
        number: Some("1".to_string()),
        rarity: Some("Rare".to_string()),
        expansion: Some(ScrydexCardExpansion {
            id: "test-set".to_string(),
            name: "Test Set".to_string(),
            code: Some("TST".to_string()),
        }),
        variants: vec![
            ScrydexCardVariant {
                name: "Normal".to_string(),
                prices: vec![ScrydexGradedPrice {
                    grade: "9".to_string(),
                    company: "PSA".to_string(),
                    is_perfect: false,
                    is_signed: false,
                    is_error: false,
                    r#type: "graded".to_string(),
                    low: 100.0,
                    mid: 120.0,
                    high: 150.0,
                    market: 110.0,
                    currency: "USD".to_string(),
                    trends: None,
                }],
            },
            ScrydexCardVariant {
                name: "Holofoil".to_string(),
                prices: vec![ScrydexGradedPrice {
                    grade: "9".to_string(),
                    company: "PSA".to_string(),
                    is_perfect: false,
                    is_signed: false,
                    is_error: false,
                    r#type: "graded".to_string(),
                    low: 200.0,
                    mid: 220.0,
                    high: 250.0,
                    market: 210.0,
                    currency: "USD".to_string(),
                    trends: None,
                }],
            },
        ],
    };

    let price = PriceMatcher::find_matching_price(&card, "9", "PSA", false, &None);

    assert!(price.is_none()); // Should return None because multiple variants exist but no variant specified
}

#[test]
fn test_find_matching_price_with_specific_variant() {
    use super::types::*;
    let card = ScrydexCard {
        id: "test".to_string(),
        name: "Test Card".to_string(),
        number: Some("1".to_string()),
        rarity: Some("Rare".to_string()),
        expansion: Some(ScrydexCardExpansion {
            id: "test-set".to_string(),
            name: "Test Set".to_string(),
            code: Some("TST".to_string()),
        }),
        variants: vec![
            ScrydexCardVariant {
                name: "Normal".to_string(),
                prices: vec![ScrydexGradedPrice {
                    grade: "9".to_string(),
                    company: "PSA".to_string(),
                    is_perfect: false,
                    is_signed: false,
                    is_error: false,
                    r#type: "graded".to_string(),
                    low: 100.0,
                    mid: 120.0,
                    high: 150.0,
                    market: 110.0,
                    currency: "USD".to_string(),
                    trends: None,
                }],
            },
            ScrydexCardVariant {
                name: "Holofoil".to_string(),
                prices: vec![ScrydexGradedPrice {
                    grade: "9".to_string(),
                    company: "PSA".to_string(),
                    is_perfect: false,
                    is_signed: false,
                    is_error: false,
                    r#type: "graded".to_string(),
                    low: 200.0,
                    mid: 220.0,
                    high: 250.0,
                    market: 210.0,
                    currency: "USD".to_string(),
                    trends: None,
                }],
            },
        ],
    };

    use super::matcher::PriceMatcher;
    let price =
        PriceMatcher::find_matching_price(&card, "9", "PSA", false, &Some("Holofoil".to_string()));

    assert!(price.is_some());
    assert_eq!(price.unwrap().market, 210.0); // Should get the Holofoil price
}
