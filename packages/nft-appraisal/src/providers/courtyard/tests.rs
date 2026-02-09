//! Tests for Courtyard provider

#![allow(unused_imports)]

use super::client::*;
use super::parser::*;
use super::provider::*;
use super::types::*;
use super::verifier::*;
use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use crate::traits::metadata::MetadataProvider;
use crate::types::*;
use alloy_primitives::keccak256;
use serde_json::json;

// Default implementations for test cases
impl Default for NFTMetadata {
    fn default() -> Self {
        Self {
            collection_name: None,
            name: "Test".to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: Vec::new(),
            product_type: None,
        }
    }
}

#[test]
fn test_courtyard_provider_creation() {
    let provider = CourtyardProvider::new();
    assert!(matches!(provider.provider_type(), ProviderType::Courtyard));
}

#[test]
fn test_uri_pattern_matching() {
    let provider = CourtyardProvider::new();

    assert!(provider.can_handle_uri("https://api.courtyard.io/token/123"));
    assert!(provider.can_handle_uri("https://courtyard.io/metadata/456"));
    assert!(provider.can_handle_uri("https://static.courtyard.io/token_uri/789"));

    assert!(!provider.can_handle_uri("https://opensea.io/token/123"));
    assert!(!provider.can_handle_uri("https://example.com/metadata"));
}

#[test]
fn test_categories_from_attributes() {
    let attributes = vec![
        NFTAttribute {
            trait_type: Some("Category".to_string()),
            value: json!("Pokémon"),
        },
        NFTAttribute {
            trait_type: Some("Other".to_string()),
            value: json!("Ignore me"),
        },
        NFTAttribute {
            trait_type: None,
            value: json!("Missing trait"),
        },
    ];

    let categories = AttributeParser::categories_from_attributes(&attributes);
    assert_eq!(categories, vec!["Pokémon".to_string()]);
}

#[test]
fn test_resolver_selection_for_pokemon_category() {
    let metadata = NFTMetadata {
        product_type: Some("GRADED_CARD".to_string()),
        name: "Pokémon Charizard".to_string(),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: json!("Pokémon Sv5a-Crimson Haze"),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: json!("070"),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: json!("PSA 10"),
            },
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: json!("PSA"),
            },
        ],
        ..Default::default()
    };
    let categories = vec!["Pokémon".to_string()];

    let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
    assert!(resolver.is_some());
    let route = resolver.unwrap();
    assert_eq!(route.kind, ResolverKind::PokemonGradedCard);
    match route.args {
        ResolverArgs::ScrydexCardInfo(info) => {
            assert_eq!(info.card_number, "70");
            assert_eq!(info.grade, "10");
            assert_eq!(info.company, "PSA");
            assert!(!info.is_perfect);
            assert_eq!(info.set_id, "sv5a");
        }
    }
}

#[test]
fn test_resolver_selection_without_match() {
    let metadata = NFTMetadata {
        product_type: Some("COLLECTIBLE".to_string()),
        ..Default::default()
    };
    let categories = vec!["Baseball".to_string()];

    let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
    assert!(resolver.is_none());
}

#[test]
fn test_into_card_info_from_attributes() {
    let _provider = CourtyardProvider::new();

    let metadata = NFTMetadata {
        name: "1999 Fossil #17 Articuno".to_string(),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: json!("070"),
            },
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: json!("PSA"),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: json!("PSA 8"),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: json!("Fossil"),
            },
            NFTAttribute {
                trait_type: Some("Year".to_string()),
                value: json!("1999"),
            },
        ],
        ..Default::default()
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().unwrap();
    assert_eq!(card_info.card_number, "70");
    assert_eq!(card_info.grade, "8");
    assert_eq!(card_info.company, "PSA");
    assert!(!card_info.is_perfect);
    assert_eq!(card_info.set_id, "fossil");
}

#[test]
fn test_into_card_info_perfect_grade() {
    let _provider = CourtyardProvider::new();

    let metadata = NFTMetadata {
        name: "2023 Shiny Treasure ex #349 Charizard ex - Special Art Rare".to_string(),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: json!("349"),
            },
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: json!("BGS"),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: json!("10 PRISTINE"),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: json!("Pokémon sv5a-Crimson Haze"),
            },
        ],
        ..Default::default()
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().unwrap();
    assert_eq!(card_info.card_number, "349");
    assert_eq!(card_info.grade, "10");
    assert_eq!(card_info.company, "BGS");
    assert!(card_info.is_perfect);
    assert_eq!(card_info.set_id, "sv5a");
}

#[test]
fn test_extract_set_id_from_attribute() {
    let value = "Pokémon Sv5a-Crimson Haze";
    assert_eq!(
        AttributeParser::extract_set_id(value),
        Some("sv5a".to_string())
    );

    let value_no_prefix = "SWSH08-Evolving Skies";
    assert_eq!(
        AttributeParser::extract_set_id(value_no_prefix),
        Some("swsh08".to_string())
    );

    let promo_value = "Pokémon Svp EN-SV Black Star Promo";
    assert_eq!(
        AttributeParser::extract_set_id(promo_value),
        Some("svp".to_string())
    );

    let simple_value = "Base Set";
    assert_eq!(
        AttributeParser::extract_set_id(simple_value),
        Some("base".to_string())
    );
}

#[test]
fn test_normalize_card_number() {
    assert_eq!(
        AttributeParser::normalize_card_number("070"),
        Some("70".to_string())
    );

    assert_eq!(
        AttributeParser::normalize_card_number("0070/100"),
        Some("70/100".to_string())
    );

    assert_eq!(
        AttributeParser::normalize_card_number("000"),
        Some("0".to_string())
    );

    assert_eq!(
        AttributeParser::normalize_card_number("TG23"),
        Some("TG23".to_string())
    );
}

#[test]
fn test_normalize_grade_value_and_perfect_detection() {
    assert_eq!(
        AttributeParser::normalize_grade_value("10 PRISTINE"),
        Some("10".to_string())
    );
    assert!(AttributeParser::detect_perfect_grade("10 PRISTINE"));

    assert_eq!(
        AttributeParser::normalize_grade_value("9.5 GEM MINT"),
        Some("9.5".to_string())
    );
    assert!(!AttributeParser::detect_perfect_grade("9.5 GEM MINT"));

    assert_eq!(
        AttributeParser::normalize_grade_value("RAW"),
        Some("RAW".to_string())
    );
    assert!(!AttributeParser::detect_perfect_grade("RAW"));
}

#[test]
fn test_resolver_selection_with_card_info() {
    let metadata = NFTMetadata {
        name: "1999 Fossil #17 Articuno".to_string(),
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: json!("17"),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: json!("CGC 8"),
            },
        ],
        ..Default::default()
    };
    let categories = vec!["Pokémon".to_string()];

    let resolver = CourtyardProvider::infer_resolver(&metadata, &categories);
    assert!(resolver.is_none());
}

#[test]
fn test_try_into_fails_with_missing_required_fields() {
    let metadata = NFTMetadata {
        name: "1999 Fossil #17 Articuno".to_string(),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: json!("17"),
            },
            // Missing required grade, company, and set attributes
        ],
        ..Default::default()
    };

    let result: std::result::Result<ScrydexCardInfo, _> = (&metadata).try_into();
    assert!(result.is_err());
    assert!(result.unwrap_err().to_string().contains("Missing required"));
}

#[test]
fn test_integrity_verification() {
    // Create a valid integrity proof by computing the expected hash using alloy
    let fingerprint = "test_fingerprint";
    let salt = 12345u64;

    // Compute the expected hash using Solidity's abi.encodePacked algorithm
    let mut encoded = Vec::new();
    encoded.extend_from_slice(fingerprint.as_bytes());

    // Salt as uint256 (32 bytes, big-endian)
    let salt_bytes = salt.to_be_bytes();
    let mut salt_256 = [0u8; 32];
    salt_256[32 - 8..].copy_from_slice(&salt_bytes);
    encoded.extend_from_slice(&salt_256);

    let expected_hash = keccak256(encoded);

    // Create a valid proof - the hex proof should be exactly 32 bytes (the hash)
    let hex_proof = hex::encode(expected_hash);

    let proof_info = ProofOfIntegrityInfo {
        fingerprint: fingerprint.to_string(),
        salt,
        hex_proof,
    };

    // This should now pass verification
    let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
    assert!(result.is_ok());
    assert!(result.unwrap());
}

#[test]
fn test_integrity_verification_failure() {
    // Create an invalid proof (wrong hash)
    let proof_info = ProofOfIntegrityInfo {
        fingerprint: "test_fingerprint".to_string(),
        salt: 12345,
        hex_proof: "0000000000000000000000000000000000000000000000000000000000000000".to_string(),
    };

    // This should fail verification
    let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("Integrity verification failed"));
}

#[test]
fn test_integrity_verification_missing_proof() {
    let metadata = NFTMetadata {
        token_info: Some(TokenInfo {
            proof_of_integrity: None,
            ..Default::default()
        }),
        ..Default::default()
    };

    // This test verifies the client-level error handling for missing proof
    let client = CourtyardClient::new();
    let result = client.verify_proof_of_integrity(&metadata);
    assert!(result.is_err());
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("No proof of integrity found"));
}

#[test]
fn test_integrity_verification_real_courtyard_data() {
    // Test with real Courtyard proof data
    let proof_info = ProofOfIntegrityInfo {
        fingerprint: "Graded Pokemon TCG | PSA 52435045 | 2000 Pokemon Base Set 2 Holo Charizard #4 | PSA 8 NM-MT".to_string(),
        salt: 265765525986,
        hex_proof: "217e91a9d710b92ebdaaee53d9b85dfff8b0010d85e01dc0c5d7e83a23552b4c".to_string(),
    };

    // This should pass verification with the correct Solidity encoding
    let result = IntegrityVerifier::verify_proof_of_integrity(&proof_info);
    assert!(result.is_ok(), "Verification failed: {:?}", result.err());
    assert!(
        result.unwrap(),
        "Verification returned false - integrity check failed"
    );
}

#[test]
fn test_variant_extraction_from_courtyard_metadata() {
    let metadata = NFTMetadata {
        collection_name: None,
        name: "1999 Base Set #53 Magnemite - 1st Edition Shadowless (PSA 9 MINT)".to_string(),
        description: Some("A test card".to_string()),
        external_url: Some("https://example.com".to_string()),
        image: Some("https://example.com/image.jpg".to_string()),
        animation_url: None,
        video: None,
        token_info: None,
        reveal_state: None,
        item_info: None,
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("9 MINT".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: serde_json::Value::String("Base Set".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: serde_json::Value::String("53".to_string()),
            },
            NFTAttribute {
                trait_type: None, // Variant attribute
                value: serde_json::Value::String("1st Edition".to_string()),
            },
            NFTAttribute {
                trait_type: None, // Variant attribute
                value: serde_json::Value::String("Shadowless".to_string()),
            },
        ],
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().expect("Failed to convert metadata");

    assert_eq!(card_info.card_number, "53");
    assert_eq!(card_info.grade, "9");
    assert_eq!(card_info.company, "PSA");
    assert_eq!(card_info.set_id, "base");
    assert_eq!(
        card_info.variant,
        Some("firstEditionShadowless".to_string())
    );
    assert!(!card_info.is_perfect);
}

#[test]
fn test_variant_extraction_with_holo() {
    let metadata = NFTMetadata {
        collection_name: None,
        name: "1999 Base Set #4 Charizard - 1st Edition Shadowless Holo (PSA 10)".to_string(),
        description: Some("A test holo card".to_string()),
        external_url: Some("https://example.com".to_string()),
        image: Some("https://example.com/image.jpg".to_string()),
        animation_url: None,
        video: None,
        token_info: None,
        reveal_state: None,
        item_info: None,
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("10 PRISTINE".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: serde_json::Value::String("Base Set".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: serde_json::Value::String("4".to_string()),
            },
            NFTAttribute {
                trait_type: None, // Variant attribute
                value: serde_json::Value::String("1st Edition".to_string()),
            },
            NFTAttribute {
                trait_type: None, // Variant attribute
                value: serde_json::Value::String("Shadowless".to_string()),
            },
            NFTAttribute {
                trait_type: None, // Variant attribute
                value: serde_json::Value::String("Holo".to_string()),
            },
        ],
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().expect("Failed to convert metadata");

    assert_eq!(card_info.card_number, "4");
    assert_eq!(card_info.grade, "10");
    assert_eq!(card_info.company, "PSA");
    assert_eq!(card_info.set_id, "base");
    assert_eq!(
        card_info.variant,
        Some("firstEditionShadowlessHolofoil".to_string())
    );
    assert!(card_info.is_perfect);
}

#[test]
fn test_variant_extraction_no_variant_attributes() {
    let metadata = NFTMetadata {
        collection_name: None,
        name: "1999 Base Set #53 Magnemite (PSA 9 MINT)".to_string(),
        description: Some("A test card".to_string()),
        external_url: Some("https://example.com".to_string()),
        image: Some("https://example.com/image.jpg".to_string()),
        animation_url: None,
        video: None,
        token_info: None,
        reveal_state: None,
        item_info: None,
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("9 MINT".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: serde_json::Value::String("Base Set".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: serde_json::Value::String("53".to_string()),
            },
            // No variant attributes
        ],
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().expect("Failed to convert metadata");

    assert_eq!(card_info.card_number, "53");
    assert_eq!(card_info.grade, "9");
    assert_eq!(card_info.company, "PSA");
    assert_eq!(card_info.set_id, "base");
    assert_eq!(card_info.variant, None);
    assert!(!card_info.is_perfect);
}

// Edge case tests

#[test]
fn test_normalize_card_number_with_unicode() {
    // Test that Unicode characters are preserved
    assert_eq!(
        AttributeParser::normalize_card_number("TG23"),
        Some("TG23".to_string())
    );

    // Test leading zeros with Unicode suffix
    assert_eq!(
        AttributeParser::normalize_card_number("007/100"),
        Some("7/100".to_string())
    );
}

#[test]
fn test_normalize_grade_value_edge_cases() {
    // Test multiple decimal points (should be rejected)
    assert_eq!(
        AttributeParser::normalize_grade_value("9.5.5"),
        Some("9.5.5".to_string()) // Falls back to original since it's invalid
    );

    // Test grade out of range (should be rejected)
    assert_eq!(
        AttributeParser::normalize_grade_value("15"),
        Some("15".to_string()) // Falls back to original since it's out of range
    );

    // Test negative grade (should be rejected)
    assert_eq!(
        AttributeParser::normalize_grade_value("-5"),
        Some("-5".to_string()) // Falls back to original since it's negative
    );

    // Test valid half-grade
    assert_eq!(
        AttributeParser::normalize_grade_value("9.5"),
        Some("9.5".to_string())
    );

    // Test valid integer grade
    assert_eq!(
        AttributeParser::normalize_grade_value("10"),
        Some("10".to_string())
    );
}

#[test]
fn test_empty_and_whitespace_attributes() {
    // Test empty string
    assert_eq!(AttributeParser::normalize_card_number(""), None);

    // Test whitespace only
    assert_eq!(AttributeParser::normalize_card_number("   "), None);

    // Test grade with leading/trailing whitespace
    assert_eq!(
        AttributeParser::normalize_grade_value("  9  "),
        Some("9".to_string())
    );
}

#[test]
fn test_malformed_combined_format() {
    // Test attribute with mismatched parentheses (should not crash)
    let metadata = NFTMetadata {
        collection_name: None,
        name: "Test Card (Incomplete".to_string(),
        description: Some("A test card".to_string()),
        external_url: Some("https://example.com".to_string()),
        image: Some("https://example.com/image.jpg".to_string()),
        animation_url: None,
        video: None,
        token_info: None,
        reveal_state: None,
        item_info: None,
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("9".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: serde_json::Value::String("Base Set".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: serde_json::Value::String("53".to_string()),
            },
            NFTAttribute {
                trait_type: None,
                // Malformed - has opening paren but not closing
                value: serde_json::Value::String("1st Edition (Incomplete".to_string()),
            },
        ],
    };

    let result: std::result::Result<ScrydexCardInfo, _> = (&metadata).try_into();
    // Should succeed but not extract the malformed variant
    assert!(result.is_ok());
    let card_info = result.unwrap();
    // Variant should be None since the format was malformed
    assert_eq!(card_info.variant, None);
}

#[test]
fn test_perfect_grade_detection_edge_cases() {
    // Test "NOT PRISTINE" - should not detect as perfect
    assert!(!AttributeParser::detect_perfect_grade("NOT PRISTINE"));

    // Test "NO PRISTINE" - should not detect as perfect
    assert!(!AttributeParser::detect_perfect_grade("NO PRISTINE"));

    // Test "PRISTINE" - should detect as perfect
    assert!(AttributeParser::detect_perfect_grade("PRISTINE"));

    // Test "BLACK LABEL" - should detect as perfect
    assert!(AttributeParser::detect_perfect_grade("BLACK LABEL"));

    // Test "GEM MINT 10" - should detect as perfect
    assert!(AttributeParser::detect_perfect_grade("GEM MINT 10"));

    // Test "PERFECT 10" - should detect as perfect
    assert!(AttributeParser::detect_perfect_grade("PERFECT 10"));
}

#[test]
fn test_variant_validation_holiday_calendar() {
    // "Holiday Calendar" should NOT be recognized as a valid variant
    assert!(!AttributeParser::is_valid_variant("Holiday Calendar"));

    // "Snowflake Stamp" should be recognized as valid
    assert!(AttributeParser::is_valid_variant("Snowflake Stamp"));

    // Case insensitive matching
    assert!(AttributeParser::is_valid_variant("SNOWFLAKE STAMP"));
    assert!(AttributeParser::is_valid_variant("snowflake stamp"));
}

#[test]
fn test_variant_string_construction_empty() {
    // Test empty variant parts
    let result = AttributeParser::construct_variant_string(&[]);
    assert_eq!(result, "");
}

#[test]
fn test_card_number_all_zeros() {
    // Test "000" should become "0"
    assert_eq!(
        AttributeParser::normalize_card_number("000"),
        Some("0".to_string())
    );

    // Test "000/100" should become "0/100"
    assert_eq!(
        AttributeParser::normalize_card_number("000/100"),
        Some("0/100".to_string())
    );
}

#[test]
fn test_duplicate_variant_deduplication() {
    // "Holo (Holo)" should produce "Holofoil", not "HolofoilHolofoil"
    let metadata = NFTMetadata {
        product_type: Some("GRADED_CARD".to_string()),
        attributes: vec![
            NFTAttribute {
                trait_type: Some("Grader".to_string()),
                value: serde_json::Value::String("PSA".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Grade".to_string()),
                value: serde_json::Value::String("9".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Set".to_string()),
                value: serde_json::Value::String("Base Set".to_string()),
            },
            NFTAttribute {
                trait_type: Some("Card Number".to_string()),
                value: serde_json::Value::String("4".to_string()),
            },
            NFTAttribute {
                trait_type: None,
                value: serde_json::Value::String("Holo (Holo)".to_string()),
            },
        ],
        ..Default::default()
    };

    let card_info: ScrydexCardInfo = (&metadata).try_into().expect("Failed to convert metadata");
    assert_eq!(card_info.variant, Some("Holofoil".to_string()));
}
