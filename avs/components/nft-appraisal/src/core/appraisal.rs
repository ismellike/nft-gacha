use crate::bindings::wavs::types::events::TriggerDataEvmContractEvent;
use crate::core::cache::AppraisalCache;
use crate::providers::CourtyardProvider;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::traits::pricing::ResolverQuote;
use crate::types::ResolverRoute;
use crate::utils::event_parser::AppraisalRequest;
use crate::utils::{Config, ERC721Client, EventParser};
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use anyhow::{anyhow, Result};
use sha3::{Digest, Keccak256};
use std::fmt;

sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

pub struct AppraisalProcessor {
    #[allow(dead_code)]
    config: Config,
    erc721_client: ERC721Client,
    cache: AppraisalCache,
}

impl fmt::Debug for AppraisalProcessor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AppraisalProcessor")
            .field("has_config", &true)
            .finish()
    }
}

impl AppraisalProcessor {
    pub fn new() -> Result<Self> {
        let config = Config::new()?;

        Ok(Self {
            erc721_client: ERC721Client::new(),
            cache: AppraisalCache::default(),
            config,
        })
    }

    pub async fn process_appraisal_request(
        &self,
        evm_event: &TriggerDataEvmContractEvent,
    ) -> Result<AppraisalResponse> {
        // Parse the appraisal request from event data
        let request = EventParser::parse_appraisal_request(evm_event)
            .map_err(|e| anyhow!("Invalid appraisal event: {}", e))?;

        let token = self.describe_token(&request)?;
        let token_uri = self.fetch_token_uri(&token).await?;
        let (metadata, price_quote) = self.fetch_metadata_and_price(&token_uri).await?;

        // Extract price value if available
        let price = price_quote.as_ref().map(|quote| quote.price.value);

        // Extract tx hash
        let tx_hash = self.extract_tx_hash(&evm_event.log.tx_hash);

        // Generate group_id from title hash
        let group_id = self.generate_group_id(&metadata.title);

        Ok(AppraisalResponse {
            chain: token.chain.clone(),
            contract_address: token.contract_address,
            token_id: token.token_id,
            group_id,
            price,
            tx_hash,
        })
    }

    fn describe_token(&self, request: &AppraisalRequest) -> Result<TokenDescriptor> {
        let contract_address = request
            .contract_address
            .parse::<Address>()
            .map_err(|e| anyhow!("Failed to parse contract address: {}", e))?;
        let token_id = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
            .map_err(|e| anyhow!("Failed to parse token ID: {}", e))?;

        Ok(TokenDescriptor {
            chain: request.chain.clone(),
            contract_address,
            token_id,
        })
    }

    async fn fetch_token_uri(&self, token: &TokenDescriptor) -> Result<String> {
        let contract_hex = format!("{:#x}", token.contract_address);
        let token_id_hex = format!("{:#x}", token.token_id);
        self.erc721_client
            .get_token_uri(&token.chain, &contract_hex, &token_id_hex)
            .await
    }

    async fn fetch_metadata_and_price(
        &self,
        token_uri: &str,
    ) -> Result<(ProviderMetadata, Option<ResolverQuote>)> {
        let provider = CourtyardProvider::new();
        if provider.can_handle_uri(token_uri) {
            return self.fetch_from_courtyard(provider, token_uri).await;
        }

        Err(anyhow!(
            "No metadata provider registered for token URI: {}",
            token_uri
        ))
    }

    async fn fetch_from_courtyard(
        &self,
        provider: CourtyardProvider,
        token_uri: &str,
    ) -> Result<(ProviderMetadata, Option<ResolverQuote>)> {
        let metadata = self.fetch_courtyard_metadata(&provider, token_uri).await?;

        let route = match metadata.resolver.clone() {
            Some(route) => route,
            None => return Ok((metadata, None)),
        };

        let cache_key = self.cache.generate_cache_key(&Self::cache_seed(&route));

        if let Some(cached) = self.cache.get(&cache_key)? {
            return Ok((metadata, cached));
        }

        let fresh_quote = provider
            .resolve_price(&route, &self.config.pokemon_api_key)
            .await?;

        let _ = self.cache.set(&cache_key, fresh_quote.as_ref());

        Ok((metadata, fresh_quote))
    }

    async fn fetch_courtyard_metadata(
        &self,
        provider: &CourtyardProvider,
        token_uri: &str,
    ) -> Result<ProviderMetadata> {
        if !provider.can_handle_uri(token_uri) {
            return Err(anyhow!(
                "Unsupported metadata URI {}, only Courtyard NFTs are currently supported",
                token_uri
            ));
        }

        let expected_provider = provider.provider_type();

        let metadata = provider
            .fetch_metadata(token_uri)
            .await
            .map_err(|e| anyhow!("Courtyard metadata fetch failed: {}", e))?;

        if metadata.provider != expected_provider {
            return Err(anyhow!(
                "Expected {:?} metadata provider, got {:?}",
                expected_provider,
                metadata.provider
            ));
        }

        Ok(metadata)
    }

    fn cache_seed(route: &ResolverRoute) -> String {
        format!("{:?}::{}", route.kind, route.cache_key_fragment())
    }

    /// Generate group ID from title using keccak256 hash
    fn generate_group_id(&self, title: &str) -> [u8; 32] {
        let mut hasher = Keccak256::new();
        hasher.update(title.as_bytes());
        hasher.finalize().into()
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
struct TokenDescriptor {
    chain: String,
    contract_address: Address,
    token_id: U256,
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

    #[test]
    fn test_cache_seed_is_case_insensitive() {
        let route = ResolverRoute::pokemon_title("Pokémon Charizard PSA 10");
        let seed = AppraisalProcessor::cache_seed(&route);
        let expected_suffix = route.cache_key_fragment();
        assert!(seed.ends_with(&expected_suffix));
    }
}
