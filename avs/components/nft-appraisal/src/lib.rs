#[rustfmt::skip]
#[allow(clippy::all)]
mod bindings;

use crate::bindings::{
    export, host,
    wavs::types::{core::LogLevel, events::TriggerDataEvmContractEvent},
    Guest, TriggerAction, WasmResponse,
};
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use anyhow::{anyhow, Result};
use wstd::runtime::block_on;

mod config;
mod courtyard_client;
mod erc721_client;
mod event_parser;
mod pokemon_client;

use config::Config;
use courtyard_client::CourtyardClient;
use erc721_client::ERC721Client;
use event_parser::{AppraisalRequest, EventParser};
use pokemon_client::PokemonPriceClient;

sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

use crate::bindings::wasi::keyvalue::store::open;
use serde::{Deserialize, Serialize};

struct Component;

#[derive(Debug, Serialize, Deserialize)]
struct CachedCardPrice {
    price: Option<f64>,
    timestamp: u64,
}

impl CachedCardPrice {
    fn new(price: Option<f64>) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        Self { price, timestamp }
    }

    fn is_expired(&self) -> bool {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        // 1 hour TTL
        now - self.timestamp > 3600
    }
}

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<WasmResponse>, String> {
        block_on(async move {
            let evm_event = match action.data {
                crate::bindings::wavs::operator::input::TriggerData::EvmContractEvent(event) => {
                    event
                }
                _ => return Ok(None),
            };
            match process_appraisal_evm(evm_event.clone()).await {
                Ok(response) => {
                    host::log(LogLevel::Info, &format!("{response:?}"));
                    Ok(Some(response))
                }
                Err(e) => {
                    // Never bubble errors for paid EVM triggers; emit on-chain AppraisalError
                    let resp = create_error_response(&evm_event, e.to_string());
                    host::log(LogLevel::Error, &format!("{resp:?}"));
                    Ok(Some(resp))
                }
            }
        })
    }
}

fn scale_to_usdc6(p: f64) -> Option<U256> {
    if !p.is_finite() || p <= 0.0 {
        return None;
    }
    Some(U256::from((p * 1_000_000.0).round() as u128))
}

/// Process an appraisal request and return pricing data
async fn process_appraisal_evm(evm_event: TriggerDataEvmContractEvent) -> Result<WasmResponse> {
    // Parse the appraisal request from event data first so we can include it in any errors
    let request = EventParser::parse_appraisal_request(&evm_event).map_err(|e| {
        AppraisalFlowError::new(format!("Invalid appraisal event: {}", e), None, None)
    })?;

    // Parse contract address and token ID for the final payload
    let contract_address = request
        .contract_address
        .parse::<Address>()
        .map_err(|e| anyhow::anyhow!("Failed to parse contract address: {}", e))?;
    let token_id = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
        .map_err(|e| anyhow::anyhow!("Failed to parse token ID: {}", e))?;

    // Extract tx hash for the payload
    let mut tx_hash_bytes = [0u8; 32];
    let src = &evm_event.log.tx_hash;
    if src.len() == 32 {
        tx_hash_bytes.copy_from_slice(src);
    } else {
        let copy_len = src.len().min(32);
        tx_hash_bytes[32 - copy_len..].copy_from_slice(&src[src.len() - copy_len..]);
    }
    let tx_hash = B256::from(tx_hash_bytes);

    // Load and validate configuration
    let config = Config::new().and_then(|c| c.validate().map(|_| c))?;

    // Query tokenURI from ERC721 contract
    let erc721_client = ERC721Client::new();
    let token_uri = erc721_client
        .get_token_uri(&request.chain, &request.contract_address, &request.token_id)
        .await?;

    // Check if this is a Courtyard NFT based on URI pattern
    if !token_uri.contains(&config.courtyard_base_url) {
        return Err(anyhow!("NFT appraisal only supports Courtyard NFTs"));
    }

    // Create Courtyard client and fetch metadata
    let courtyard_client = CourtyardClient::new();
    let nft_metadata = courtyard_client
        .get_nft_metadata_from_uri(&token_uri)
        .await?;

    // Parse graded card information from metadata
    let card_attributes = courtyard_client.parse_graded_card_info(&nft_metadata)?;

    // Generate keccak hash for group ID
    let group_id_hash = card_attributes.to_keccak_hash();

    // Verify proof of integrity
    if !courtyard_client.verify_proof_of_integrity(&nft_metadata)? {
        return Err(anyhow!(
            "Proof of integrity verification failed - NFT authenticity cannot be verified"
        ));
    }

    // Try to get cached price using card attributes keccak hash as key
    let cache_bucket = open("nft-card-price-cache").ok();
    let cache_key = hex::encode(group_id_hash);

    let price_result = if let Some(ref bucket) = cache_bucket {
        // Check cache first
        if let Ok(Some(cached_data)) = bucket.get(&cache_key) {
            if let Ok(cached_str) = String::from_utf8(cached_data) {
                if let Ok(cached_price) = serde_json::from_str::<CachedCardPrice>(&cached_str) {
                    if !cached_price.is_expired() {
                        // Use cached result
                        Ok(cached_price.price)
                    } else {
                        // Cache expired, fetch new price
                        let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);
                        let result = pokemon_client
                            .appraise_card(
                                &card_attributes.title,
                                card_attributes.set.as_deref(),
                                Some(&card_attributes.grade),
                            )
                            .await;

                        // Cache the result
                        if let Ok(price) = &result {
                            let cached_price = CachedCardPrice::new(*price);
                            if let Ok(serialized) = serde_json::to_string(&cached_price) {
                                let _ = bucket.set(&cache_key, serialized.as_bytes());
                            }
                        }

                        result
                    }
                } else {
                    // Failed to parse cache, fetch new
                    let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);
                    pokemon_client
                        .appraise_card(
                            &card_attributes.title,
                            card_attributes.set.as_deref(),
                            Some(&card_attributes.grade),
                        )
                        .await
                }
            } else {
                // Failed to decode cache, fetch new
                let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);
                pokemon_client
                    .appraise_card(
                        &card_attributes.title,
                        card_attributes.set.as_deref(),
                        Some(&card_attributes.grade),
                    )
                    .await
            }
        } else {
            // No cache entry, fetch new price
            let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);
            let result = pokemon_client
                .appraise_card(
                    &card_attributes.title,
                    card_attributes.set.as_deref(),
                    Some(&card_attributes.grade),
                )
                .await;

            // Cache the result
            if let Ok(price) = &result {
                let cached_price = CachedCardPrice::new(*price);
                if let Ok(serialized) = serde_json::to_string(&cached_price) {
                    let _ = bucket.set(&cache_key, serialized.as_bytes());
                }
            }

            result
        }
    } else {
        // No cache bucket available, just fetch directly
        let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);
        pokemon_client
            .appraise_card(
                &card_attributes.title,
                card_attributes.set.as_deref(),
                Some(&card_attributes.grade),
            )
            .await
    };

    match price_result {
        Ok(Some(price)) if price > 0.0 => {
            // Success case - create AppraisalSuccess
            let scaled_price = scale_to_usdc6(price).unwrap_or(U256::ZERO);
            let payload = AppraisalSuccess {
                chain: request.chain,
                contractAddress: contract_address,
                tokenId: token_id,
                groupId: group_id_hash.into(),
                price: scaled_price,
                txHash: tx_hash,
            }
            .abi_encode();

            Ok(WasmResponse {
                payload,
                ordering: None,
            })
        }
        Ok(Some(_)) => {
            // Price is zero or negative
            Err(anyhow!("Price unavailable or zero"))
        }
        Ok(None) => {
            // Card not found
            Err(anyhow!("Card not found in price database"))
        }
        Err(e) => {
            // API error
            Err(anyhow!("Pokemon Price Tracker API error: {}", e))
        }
    }
}

// Unified error response creator for all errors
fn create_error_response(evm_event: &TriggerDataEvmContractEvent, error: String) -> WasmResponse {
    // Try to parse the request to get contract address and token ID
    let (contract_address, token_id, group_id) =
        if let Ok(request) = EventParser::parse_appraisal_request(evm_event) {
            let contract_addr = request
                .contract_address
                .parse::<Address>()
                .unwrap_or(Address::ZERO);
            let token_id_val = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
                .unwrap_or(U256::ZERO);
            let group_id_val = [0u8; 32]; // We can't compute group_id without full processing
            (contract_addr, token_id_val, group_id_val)
        } else {
            // Use defaults when we can't parse the request
            (Address::ZERO, U256::ZERO, [0u8; 32])
        };

    // Extract tx hash
    let mut tx_hash_bytes = [0u8; 32];
    let src = &evm_event.log.tx_hash;
    if src.len() == 32 {
        tx_hash_bytes.copy_from_slice(src);
    } else {
        let copy_len = src.len().min(32);
        tx_hash_bytes[32 - copy_len..].copy_from_slice(&src[src.len() - copy_len..]);
    }

    let payload = AppraisalError {
        contractAddress: contract_address,
        tokenId: token_id,
        groupId: group_id.into(),
        error,
        txHash: B256::from(tx_hash_bytes),
    }
    .abi_encode();

    WasmResponse {
        payload,
        ordering: None,
    }
}

export!(Component with_types_in bindings);

// Flow error for early parsing errors
#[derive(Debug)]
struct AppraisalFlowError {
    msg: String,
}

impl AppraisalFlowError {
    fn new(msg: String, _request: Option<AppraisalRequest>, _token_uri: Option<String>) -> Self {
        Self { msg }
    }
}

impl core::fmt::Display for AppraisalFlowError {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "{}", self.msg)
    }
}

impl std::error::Error for AppraisalFlowError {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_appraisal_success_abi_encoding() {
        let success = AppraisalSuccess {
            chain: "polygon".to_string(),
            contractAddress: "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            tokenId: U256::from(0x123u32),
            groupId: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                24, 25, 26, 27, 28, 29, 30, 31, 32,
            ]
            .into(), // Sample keccak hash
            price: U256::from(100_500_000u32), // $100.50 in USDC 6 decimals
            txHash: B256::ZERO,
        };

        // Test ABI encoding
        let encoded_bytes = success.abi_encode();
        assert!(!encoded_bytes.is_empty());

        // ABI-encoded data should be longer than 32 bytes (just a basic sanity check)
        assert!(encoded_bytes.len() > 32);
    }

    #[test]
    fn test_appraisal_error_abi_encoding() {
        let error = AppraisalError {
            contractAddress: "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            tokenId: U256::from(0x123u32),
            groupId: [0u8; 32].into(), // Zero hash for error
            error: "Card not found in price database".to_string(),
            txHash: B256::ZERO,
        };

        // Test ABI encoding
        let encoded_bytes = error.abi_encode();
        assert!(!encoded_bytes.is_empty());

        // ABI-encoded data should be longer than 32 bytes (just a basic sanity check)
        assert!(encoded_bytes.len() > 32);
    }

    #[test]
    fn test_scale_to_usdc6() {
        // Test valid prices
        assert_eq!(scale_to_usdc6(100.50), Some(U256::from(100_500_000u32)));
        assert_eq!(scale_to_usdc6(1.0), Some(U256::from(1_000_000u32)));
        assert_eq!(scale_to_usdc6(0.01), Some(U256::from(10_000u32)));

        // Test invalid prices
        assert_eq!(scale_to_usdc6(0.0), None);
        assert_eq!(scale_to_usdc6(-1.0), None);
        assert_eq!(scale_to_usdc6(f64::NAN), None);
        assert_eq!(scale_to_usdc6(f64::INFINITY), None);
    }

    #[test]
    fn test_graded_card_attributes_serialization() {
        use courtyard_client::card_parser::GradedCardAttributes;
        use std::collections::HashMap;

        let mut other_attributes = HashMap::new();
        other_attributes.insert("Serial".to_string(), "61182446".to_string());

        let card_attributes = GradedCardAttributes {
            grader: "PSA".to_string(),
            grade: "10".to_string(),
            title: "Pikachu".to_string(),
            card_number: "25".to_string(),
            year: "1998".to_string(),
            set: Some("Base Set".to_string()),
            language: Some("English".to_string()),
            category: Some("Pokemon".to_string()),
            event: None,
            tags: vec!["electric".to_string(), "yellow".to_string()], // pre-sorted
            other_attributes,
        };

        // Test keccak hash generation
        let hash = card_attributes.to_keccak_hash();
        assert_eq!(hash.len(), 32); // Should be 32 bytes

        // Hash should be deterministic - same input should produce same hash
        let hash2 = card_attributes.to_keccak_hash();
        assert_eq!(hash, hash2);

        // Different attributes should produce different hashes
        let mut different_attributes = card_attributes.clone();
        different_attributes.grader = "BGS".to_string();
        let different_hash = different_attributes.to_keccak_hash();
        assert_ne!(hash, different_hash);
    }
}
