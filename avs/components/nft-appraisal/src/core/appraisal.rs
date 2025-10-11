use crate::bindings::wavs::types::events::TriggerDataEvmContractEvent;
use crate::core::cache::AppraisalCache;
use crate::engine::AppraisalEngine;
use crate::types::CardMetadata;
use crate::utils::event_parser::AppraisalRequest;
use crate::utils::{Config, ERC721Client, EventParser};
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use anyhow::{anyhow, Result};

sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

#[derive(Debug)]
pub struct AppraisalProcessor {
    #[allow(dead_code)]
    config: Config,
    erc721_client: ERC721Client,
    cache: AppraisalCache,
    engine: AppraisalEngine,
}

impl AppraisalProcessor {
    pub fn new() -> Result<Self> {
        let config = Config::new()?;
        let engine = AppraisalEngine::with_defaults(config.pokemon_api_key.clone());

        Ok(Self {
            erc721_client: ERC721Client::new(),
            cache: AppraisalCache::default(),
            config,
            engine,
        })
    }

    pub async fn process_appraisal_request(
        &self,
        evm_event: &TriggerDataEvmContractEvent,
    ) -> Result<AppraisalResponse> {
        // Parse the appraisal request from event data
        let request = EventParser::parse_appraisal_request(evm_event)
            .map_err(|e| anyhow!("Invalid appraisal event: {}", e))?;

        // Parse contract address and token ID for response
        let contract_address = request
            .contract_address
            .parse::<Address>()
            .map_err(|e| anyhow!("Failed to parse contract address: {}", e))?;
        let token_id = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
            .map_err(|e| anyhow!("Failed to parse token ID: {}", e))?;

        // Get token metadata
        let metadata = self.fetch_token_metadata(&request).await?;

        // Get appraisal price
        let price = self.get_appraised_price(&metadata).await?;

        // Extract tx hash
        let tx_hash = self.extract_tx_hash(&evm_event.log.tx_hash);

        Ok(AppraisalResponse {
            chain: request.chain,
            contract_address,
            token_id,
            group_id: metadata.to_keccak_hash(),
            price,
            tx_hash,
        })
    }

    async fn fetch_token_metadata(&self, request: &AppraisalRequest) -> Result<CardMetadata> {
        // Query tokenURI from ERC721 contract
        let token_uri = self
            .erc721_client
            .get_token_uri(&request.chain, &request.contract_address, &request.token_id)
            .await?;

        self.engine
            .fetch_metadata(&token_uri)
            .await
            .map_err(|e| anyhow!("Failed to fetch NFT metadata: {}", e))
    }

    async fn get_appraised_price(&self, metadata: &CardMetadata) -> Result<Option<f64>> {
        let cache_key = self.cache.generate_cache_key(metadata);

        // Try cache first
        if let Ok(cached_price) = self.cache.get_price(&cache_key) {
            return Ok(cached_price);
        }

        // Fetch fresh price using provider registry
        let price_quote = self.engine.resolve_price(metadata).await?;
        let price = price_quote.as_ref().map(|quote| quote.price.value);

        // Cache the result
        match price_quote {
            Some(quote) => {
                let _ = self
                    .cache
                    .set_price(&cache_key, Some(quote.price.value), Some(quote.ttl));
            }
            None => {
                let _ = self.cache.set_price(&cache_key, None, None);
            }
        }

        Ok(price)
    }

    fn extract_tx_hash(&self, tx_hash_bytes: &[u8]) -> B256 {
        let mut hash_bytes = [0u8; 32];
        let src = tx_hash_bytes;
        if src.len() == 32 {
            hash_bytes.copy_from_slice(src);
        } else {
            let copy_len = src.len().min(32);
            hash_bytes[32 - copy_len..].copy_from_slice(&src[src.len() - copy_len..]);
        }
        B256::from(hash_bytes)
    }
}

#[derive(Debug)]
pub struct AppraisalResponse {
    pub chain: String,
    pub contract_address: Address,
    pub token_id: U256,
    pub group_id: [u8; 32],
    pub price: Option<f64>,
    pub tx_hash: B256,
}

impl AppraisalResponse {
    pub fn to_success_payload(&self) -> Option<Vec<u8>> {
        if let Some(price) = self.price {
            if price > 0.0 {
                let scaled_price = scale_to_usdc6(price)?;
                let payload = AppraisalSuccess {
                    chain: self.chain.clone(),
                    contractAddress: self.contract_address,
                    tokenId: self.token_id,
                    groupId: self.group_id.into(),
                    price: scaled_price,
                    txHash: self.tx_hash,
                }
                .abi_encode();
                return Some(payload);
            }
        }
        None
    }

    pub fn to_error_payload(&self, error: String) -> Vec<u8> {
        AppraisalError {
            contractAddress: self.contract_address,
            tokenId: self.token_id,
            groupId: self.group_id.into(),
            error,
            txHash: self.tx_hash,
        }
        .abi_encode()
    }
}

fn scale_to_usdc6(p: f64) -> Option<U256> {
    if !p.is_finite() || p <= 0.0 {
        return None;
    }
    Some(U256::from((p * 1_000_000.0).round() as u128))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scale_to_usdc6() {
        assert_eq!(scale_to_usdc6(100.50), Some(U256::from(100_500_000u32)));
        assert_eq!(scale_to_usdc6(1.0), Some(U256::from(1_000_000u32)));
        assert_eq!(scale_to_usdc6(0.01), Some(U256::from(10_000u32)));
        assert_eq!(scale_to_usdc6(0.0), None);
        assert_eq!(scale_to_usdc6(-1.0), None);
        assert_eq!(scale_to_usdc6(f64::NAN), None);
        assert_eq!(scale_to_usdc6(f64::INFINITY), None);
    }

    #[test]
    fn test_appraisal_response_success_payload() {
        let response = AppraisalResponse {
            chain: "polygon".to_string(),
            contract_address: "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            token_id: U256::from(0x123u32),
            group_id: [1u8; 32],
            price: Some(100.50),
            tx_hash: B256::ZERO,
        };

        let payload = response.to_success_payload();
        assert!(payload.is_some());
        assert!(!payload.unwrap().is_empty());
    }

    #[test]
    fn test_appraisal_response_error_payload() {
        let response = AppraisalResponse {
            chain: "polygon".to_string(),
            contract_address: "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            token_id: U256::from(0x123u32),
            group_id: [1u8; 32],
            price: None,
            tx_hash: B256::ZERO,
        };

        let payload = response.to_error_payload("Test error".to_string());
        assert!(!payload.is_empty());
    }
}
