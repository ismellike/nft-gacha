#[rustfmt::skip]
#[allow(clippy::all)]
mod bindings;

use crate::bindings::wavs::operator::input::TriggerDataEvmContractEvent;
use crate::bindings::{export, Guest, TriggerAction, WasmResponse};
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use anyhow::Result;
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

struct Component;

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
                Ok(response) => Ok(Some(response)),
                Err(e) => {
                    // Never bubble errors for paid EVM triggers; emit on-chain AppraisalError
                    let resp = create_error_response(&evm_event, e.to_string());
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

    // Helper to create error response
    let create_error = |error_msg: String| -> WasmResponse {
        let payload = AppraisalError {
            chain: request.chain.clone(),
            contractAddress: contract_address,
            tokenId: token_id,
            error: error_msg,
            txHash: tx_hash,
        }
        .abi_encode();

        WasmResponse {
            payload,
            ordering: None,
        }
    };

    // Load and validate configuration
    let config = match Config::from_env().and_then(|c| c.validate().map(|_| c)) {
        Ok(config) => config,
        Err(e) => return Ok(create_error(format!("Configuration error: {}", e))),
    };

    // Query tokenURI from ERC721 contract
    let erc721_client = ERC721Client::new();
    let token_uri = match erc721_client
        .get_token_uri(&request.chain, &request.contract_address, &request.token_id)
        .await
    {
        Ok(uri) => uri,
        Err(e) => return Ok(create_error(format!("Failed to fetch tokenURI: {}", e))),
    };

    // Check if this is a Courtyard NFT based on URI pattern
    if !token_uri.contains(&config.courtyard_base_url) {
        return Ok(create_error(
            "NFT appraisal only supports Courtyard NFTs".to_string(),
        ));
    }

    // Create Courtyard client and fetch metadata
    let courtyard_client = CourtyardClient::new();
    let nft_metadata = match courtyard_client.get_nft_metadata_from_uri(&token_uri).await {
        Ok(metadata) => metadata,
        Err(e) => {
            return Ok(create_error(format!(
                "Failed to fetch Courtyard metadata: {}",
                e
            )))
        }
    };

    // Parse Pokemon card information from metadata
    let card_info = match courtyard_client.parse_pokemon_card_info(&nft_metadata) {
        Ok(info) => info,
        Err(e) => {
            return Ok(create_error(format!(
                "Failed to parse Pokemon card info: {}",
                e
            )))
        }
    };

    // Verify proof of integrity
    match courtyard_client.verify_proof_of_integrity(&nft_metadata) {
        Ok(true) => {} // Continue processing
        Ok(false) => {
            return Ok(create_error(
                "Proof of integrity verification failed - NFT authenticity cannot be verified"
                    .to_string(),
            ));
        }
        Err(e) => {
            return Ok(create_error(format!(
                "Proof of integrity verification error: {}",
                e
            )));
        }
    }

    // Create Pokemon Price Tracker client and perform appraisal
    let pokemon_client = PokemonPriceClient::new(config.pokemon_api_key);

    match pokemon_client
        .appraise_card(
            &card_info.name,
            card_info.set.as_deref(),
            card_info.grade.as_deref(),
        )
        .await
    {
        Ok(Some(price)) if price > 0.0 => {
            // Success case - create AppraisalSuccess
            let scaled_price = scale_to_usdc6(price).unwrap_or(U256::ZERO);
            let payload = AppraisalSuccess {
                chain: request.chain,
                contractAddress: contract_address,
                tokenId: token_id,
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
            Ok(create_error("Price unavailable or zero".to_string()))
        }
        Ok(None) => {
            // Card not found
            Ok(create_error("Card not found in price database".to_string()))
        }
        Err(e) => {
            // API error
            Ok(create_error(format!(
                "Pokemon Price Tracker API error: {}",
                e
            )))
        }
    }
}

// Unified error response creator for early errors (before request parsing)
fn create_error_response(evm_event: &TriggerDataEvmContractEvent, error: String) -> WasmResponse {
    // Use defaults when we can't parse the request
    let contract_address = Address::ZERO;
    let token_id = U256::ZERO;

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
        chain: evm_event.chain_name.clone(),
        contractAddress: contract_address,
        tokenId: token_id,
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
            chain: "polygon".to_string(),
            contractAddress: "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            tokenId: U256::from(0x123u32),
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
}
