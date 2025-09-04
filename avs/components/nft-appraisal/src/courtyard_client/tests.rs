use super::{
    card_parser::CardParser, client::CourtyardClient, integrity::IntegrityVerifier, types::*,
};

#[cfg(test)]
mod card_parser_tests {
    use super::*;

    #[test]
    fn test_parse_graded_card_attributes_valid() {
        let metadata = NFTMetadata {
            collection_name: Some("Graded Cards".to_string()),
            name: "2024 Pokémon Sv5a-Crimson Haze #070 Infernape - Art Rare (PSA 10 GEM MINT)"
                .to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("10".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Title/Subject".to_string()),
                    value: serde_json::Value::String("Infernape".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: serde_json::Value::String("070".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Year".to_string()),
                    value: serde_json::Value::String("2024".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Sv5a-Crimson Haze".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Language".to_string()),
                    value: serde_json::Value::String("Japanese".to_string()),
                },
            ],
            product_type: Some("GRADED_CARD".to_string()),
        };

        let result = CardParser::parse_graded_card_attributes(&metadata);
        assert!(result.is_ok());

        let attributes = result.unwrap();
        assert_eq!(attributes.grader, "PSA");
        assert_eq!(attributes.grade, "10");
        assert_eq!(attributes.title, "Infernape");
        assert_eq!(attributes.card_number, "070");
        assert_eq!(attributes.year, "2024");
        assert_eq!(attributes.set, Some("Sv5a-Crimson Haze".to_string()));
        assert_eq!(attributes.language, Some("Japanese".to_string()));
    }

    #[test]
    fn test_parse_graded_card_attributes_not_graded_card() {
        let metadata = NFTMetadata {
            collection_name: Some("Regular NFTs".to_string()),
            name: "Regular NFT".to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: vec![],
            product_type: Some("NFT".to_string()),
        };

        let result = CardParser::parse_graded_card_attributes(&metadata);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("not a graded card"));
    }

    #[test]
    fn test_parse_graded_card_attributes_missing_required() {
        let metadata = NFTMetadata {
            collection_name: Some("Graded Cards".to_string()),
            name: "Incomplete Card".to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                // Missing other required attributes
            ],
            product_type: Some("GRADED_CARD".to_string()),
        };

        let result = CardParser::parse_graded_card_attributes(&metadata);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Missing required"));
    }
}

#[cfg(test)]
mod integrity_tests {
    use super::*;

    #[test]
    fn test_verify_proof_of_integrity() {
        // Test with valid proof of integrity from real Courtyard example
        let proof_info = ProofOfIntegrityInfo {
            fingerprint: "Pokémon | PSA 103343839 | 2024 Pokémon Sv5a-Crimson Haze 070 Infernape | 10 GEM MINT".to_string(),
            salt: 1022445175679711105,
            hex_proof: "0x31bfe554b2e64eb3adcf186fac610c54ffa25bdb89a4102414b50eeaf26b5458".to_string(),
        };

        let token_info = TokenInfo {
            token_id: Some(
                "22502380153341990415083953859047049663856062362909022938064244695923079992408"
                    .to_string(),
            ),
            contract_address: Some("0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD".to_string()),
            chain: Some("polygon".to_string()),
            proof_of_integrity: Some(proof_info),
        };

        let metadata = NFTMetadata {
            collection_name: Some("Graded Cards".to_string()),
            name: "2024 Pokémon Sv5a-Crimson Haze #070 Infernape - Art Rare (PSA 10 GEM MINT)"
                .to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: Some(token_info),
            reveal_state: None,
            item_info: None,
            attributes: vec![],
            product_type: Some("GRADED_CARD".to_string()),
        };

        let result = IntegrityVerifier::verify_proof_of_integrity(&metadata);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_verify_proof_of_integrity_no_token_info() {
        let metadata = NFTMetadata {
            collection_name: Some("Test Collection".to_string()),
            name: "Test NFT".to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: vec![],
            product_type: None,
        };

        let result = IntegrityVerifier::verify_proof_of_integrity(&metadata);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("No token_info"));
    }

    #[test]
    fn test_generate_proof_hash() {
        let fingerprint =
            "Pokémon | PSA 103343839 | 2024 Pokémon Sv5a-Crimson Haze 070 Infernape | 10 GEM MINT";
        let salt = 1022445175679711105;
        let expected = "0x31bfe554b2e64eb3adcf186fac610c54ffa25bdb89a4102414b50eeaf26b5458";

        let result = IntegrityVerifier::generate_proof_hash(fingerprint, salt);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), expected);
    }
}

#[cfg(test)]
mod client_tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let _client = CourtyardClient::new();
        // Just verify it can be created without panicking
    }

    #[test]
    fn test_parse_graded_card_info() {
        let client = CourtyardClient::new();

        let metadata = NFTMetadata {
            collection_name: Some("Graded Cards".to_string()),
            name: "2024 Pokémon Sv5a-Crimson Haze #070 Infernape - Art Rare (PSA 10 GEM MINT)"
                .to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: None,
            reveal_state: None,
            item_info: None,
            attributes: vec![
                NFTAttribute {
                    trait_type: Some("Grader".to_string()),
                    value: serde_json::Value::String("PSA".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("10".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Title/Subject".to_string()),
                    value: serde_json::Value::String("Infernape".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Card Number".to_string()),
                    value: serde_json::Value::String("070".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Year".to_string()),
                    value: serde_json::Value::String("2024".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Sv5a-Crimson Haze".to_string()),
                },
            ],
            product_type: Some("GRADED_CARD".to_string()),
        };

        let result = client.parse_graded_card_info(&metadata);
        assert!(result.is_ok());

        let card_info = result.unwrap();
        assert_eq!(card_info.grader, "PSA");
        assert_eq!(card_info.grade, "10");
        assert_eq!(card_info.title, "Infernape");
        assert_eq!(card_info.set, Some("Sv5a-Crimson Haze".to_string()));
        // Verify keccak hash generation
        let hash = card_info.to_keccak_hash();
        assert_eq!(hash.len(), 32); // Should be 32 bytes

        // Hash should be deterministic
        let hash2 = card_info.to_keccak_hash();
        assert_eq!(hash, hash2);

        // Different grader should produce different hash
        let mut different_info = card_info.clone();
        different_info.grader = "BGS".to_string();
        let different_hash = different_info.to_keccak_hash();
        assert_ne!(hash, different_hash);
    }

    #[test]
    fn test_verify_proof_of_integrity_delegation() {
        let client = CourtyardClient::new();

        let proof_info = ProofOfIntegrityInfo {
            fingerprint: "Pokémon | PSA 103343839 | 2024 Pokémon Sv5a-Crimson Haze 070 Infernape | 10 GEM MINT".to_string(),
            salt: 1022445175679711105,
            hex_proof: "0x31bfe554b2e64eb3adcf186fac610c54ffa25bdb89a4102414b50eeaf26b5458".to_string(),
        };

        let token_info = TokenInfo {
            token_id: None,
            contract_address: None,
            chain: None,
            proof_of_integrity: Some(proof_info),
        };

        let metadata = NFTMetadata {
            collection_name: Some("Test".to_string()),
            name: "Test NFT".to_string(),
            description: None,
            external_url: None,
            image: None,
            animation_url: None,
            video: None,
            token_info: Some(token_info),
            reveal_state: None,
            item_info: None,
            attributes: vec![],
            product_type: None,
        };

        let result = client.verify_proof_of_integrity(&metadata);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }
}
