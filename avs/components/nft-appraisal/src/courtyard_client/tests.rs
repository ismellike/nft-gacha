use super::{
    card_parser::CardParser, client::CourtyardClient, integrity::IntegrityVerifier, types::*,
};

#[cfg(test)]
mod card_parser_tests {
    use super::*;

    #[test]
    fn test_extract_card_name() {
        // Test various card name formats
        assert_eq!(
            CardParser::extract_card_name("Charizard #004/102 - Base Set").unwrap(),
            "Charizard"
        );
        assert_eq!(
            CardParser::extract_card_name("Pikachu (PSA 10)").unwrap(),
            "Pikachu"
        );
        assert_eq!(
            CardParser::extract_card_name("Charizard VMAX - Champion's Path #020/073").unwrap(),
            "Charizard VMAX"
        );
        assert_eq!(CardParser::extract_card_name("Mew").unwrap(), "Mew");
        assert_eq!(
            CardParser::extract_card_name("Dark Charizard #4/82").unwrap(),
            "Dark Charizard"
        );

        // Test error cases
        assert!(CardParser::extract_card_name("").is_err());
        assert!(CardParser::extract_card_name("   ").is_err());
    }

    #[test]
    fn test_extract_grade_from_attributes() {
        let attributes = vec![NFTAttribute {
            trait_type: Some("Grade".to_string()),
            value: serde_json::Value::String("PSA 10".to_string()),
        }];
        assert_eq!(
            CardParser::extract_grade_from_attributes(&attributes),
            Some("PSA 10".to_string())
        );

        let attributes = vec![NFTAttribute {
            trait_type: Some("condition".to_string()),
            value: serde_json::Value::String("10".to_string()),
        }];
        assert_eq!(
            CardParser::extract_grade_from_attributes(&attributes),
            Some("PSA 10".to_string())
        );

        let attributes = vec![NFTAttribute {
            trait_type: Some("Grade".to_string()),
            value: serde_json::Value::String("raw".to_string()),
        }];
        assert_eq!(
            CardParser::extract_grade_from_attributes(&attributes),
            Some("raw".to_string())
        );
    }

    #[test]
    fn test_extract_set_from_attributes() {
        let attributes = vec![NFTAttribute {
            trait_type: Some("Set".to_string()),
            value: serde_json::Value::String("Base Set".to_string()),
        }];
        assert_eq!(
            CardParser::extract_set_from_attributes(&attributes),
            Some("Base Set".to_string())
        );

        let attributes = vec![NFTAttribute {
            trait_type: Some("expansion".to_string()),
            value: serde_json::Value::String("Jungle".to_string()),
        }];
        assert_eq!(
            CardParser::extract_set_from_attributes(&attributes),
            Some("Jungle".to_string())
        );
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
    fn test_parse_pokemon_card_info() {
        let client = CourtyardClient::new();

        let metadata = NFTMetadata {
            collection_name: Some("Pokemon Cards".to_string()),
            name: "Charizard #004/102 - Base Set".to_string(),
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
                    trait_type: Some("Set".to_string()),
                    value: serde_json::Value::String("Base Set".to_string()),
                },
                NFTAttribute {
                    trait_type: Some("Grade".to_string()),
                    value: serde_json::Value::String("PSA 10".to_string()),
                },
            ],
            product_type: None,
        };

        let result = client.parse_pokemon_card_info(&metadata);
        assert!(result.is_ok());

        let card_info = result.unwrap();
        assert_eq!(card_info.name, "Charizard");
        assert_eq!(card_info.set, Some("Base Set".to_string()));
        assert_eq!(card_info.grade, Some("PSA 10".to_string()));
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
