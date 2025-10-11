use crate::bindings::wavs::types::events::TriggerDataEvmContractEvent;
use crate::core::cache::AppraisalCache;
use crate::providers::CourtyardProvider;
use crate::resolvers::PokemonPriceResolver;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::traits::pricing::{PriceResolver, ResolverQuote};
use crate::types::ResolverKind;
use crate::utils::event_parser::AppraisalRequest;
use crate::utils::{Config, ERC721Client, EventParser};
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use anyhow::{anyhow, Result};
use sha3::{Digest, Keccak256};
use std::collections::HashMap;
use std::fmt;

sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

pub struct AppraisalProcessor {
    #[allow(dead_code)]
    config: Config,
    erc721_client: ERC721Client,
    cache: AppraisalCache,
    metadata_providers: Vec<Box<dyn MetadataProvider>>,
    resolvers: HashMap<ResolverKind, Box<dyn PriceResolver>>,
}

impl fmt::Debug for AppraisalProcessor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AppraisalProcessor")
            .field("metadata_providers", &self.metadata_providers.len())
            .field("resolvers", &self.resolvers.len())
            .finish()
    }
}

impl AppraisalProcessor {
    pub fn new() -> Result<Self> {
        let config = Config::new()?;
        let metadata_providers: Vec<Box<dyn MetadataProvider>> =
            vec![Box::new(CourtyardProvider::new())];

        let mut resolvers: HashMap<ResolverKind, Box<dyn PriceResolver>> = HashMap::new();
        resolvers.insert(
            ResolverKind::PokemonTradingCard,
            Box::new(PokemonPriceResolver::new(config.pokemon_api_key.clone())),
        );

        Ok(Self {
            erc721_client: ERC721Client::new(),
            cache: AppraisalCache::default(),
            config,
            metadata_providers,
            resolvers,
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

        // Get normalized metadata from providers
        let metadata = self.fetch_token_metadata(&request).await?;
        let title = metadata.title.clone();

        // Get appraisal price
        let price = self.get_appraised_price(&metadata).await?;

        // Extract tx hash
        let tx_hash = self.extract_tx_hash(&evm_event.log.tx_hash);

        // Generate group_id from title hash
        let group_id = self.generate_group_id(&title);

        Ok(AppraisalResponse {
            chain: request.chain,
            contract_address,
            token_id,
            group_id,
            price,
            tx_hash,
        })
    }

    async fn fetch_token_metadata(&self, request: &AppraisalRequest) -> Result<ProviderMetadata> {
        // Query tokenURI from ERC721 contract
        let token_uri = self
            .erc721_client
            .get_token_uri(&request.chain, &request.contract_address, &request.token_id)
            .await?;

        for provider in &self.metadata_providers {
            if provider.can_handle_uri(&token_uri) {
                let provider_type = provider.provider_type();
                let provider_label = format!("{:?}", provider_type);

                return provider
                    .fetch_metadata(&token_uri)
                    .await
                    .map_err(|e| anyhow!("{} metadata fetch failed: {}", provider_label, e));
            }
        }

        Err(anyhow!(
            "No metadata provider registered for token URI: {}",
            token_uri
        ))
    }

    async fn get_appraised_price(&self, metadata: &ProviderMetadata) -> Result<Option<f64>> {
        let cache_key = self.cache.generate_cache_key(&metadata.title);

        // Try cache first
        if let Ok(cached_price) = self.cache.get_price(&cache_key) {
            return Ok(cached_price);
        }

        // Fetch fresh price using provider-driven resolver routing
        let price_quote = self.resolve_price(metadata).await?;
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

    async fn resolve_price(&self, metadata: &ProviderMetadata) -> Result<Option<ResolverQuote>> {
        let resolver = self.select_resolver(metadata)?;

        if let Some(mut quote) = resolver.get_price(&metadata.title).await? {
            if quote.price.source.is_empty() {
                quote.price.source = resolver.name().to_string();
            }
            return Ok(Some(quote));
        }

        Ok(None)
    }

    fn select_resolver(&self, metadata: &ProviderMetadata) -> Result<&dyn PriceResolver> {
        let resolver_kind = Self::infer_resolver_kind(metadata).ok_or_else(|| {
            anyhow!(
                "No resolver could be inferred for provider {:?} title: {}",
                metadata.provider,
                metadata.title
            )
        })?;

        self.resolvers
            .get(&resolver_kind)
            .map(|resolver| resolver.as_ref())
            .ok_or_else(|| anyhow!("Resolver {:?} is not registered", resolver_kind))
    }

    fn infer_resolver_kind(metadata: &ProviderMetadata) -> Option<ResolverKind> {
        if let Some(kind) = &metadata.resolver {
            return Some(kind.clone());
        }

        if Self::metadata_matches_pokemon(metadata) || Self::title_matches_pokemon(&metadata.title)
        {
            return Some(ResolverKind::PokemonTradingCard);
        }

        None
    }

    fn metadata_matches_pokemon(metadata: &ProviderMetadata) -> bool {
        let is_graded_card = metadata
            .product_type
            .as_deref()
            .map(|value| value.eq_ignore_ascii_case("GRADED_CARD"))
            .unwrap_or(false);

        let has_pokemon_category = metadata.categories.iter().any(|category| {
            let upper = category.to_uppercase();
            if upper.contains("POKÉMON") {
                true
            } else {
                upper.replace('É', "E").contains("POKEMON")
            }
        });

        is_graded_card && has_pokemon_category
    }

    fn title_matches_pokemon(title: &str) -> bool {
        let upper = title.to_uppercase();
        upper.contains("POKEMON") || upper.contains("POKÉMON")
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
    use crate::types::ProviderType;

    fn sample_metadata(
        resolver: Option<ResolverKind>,
        product_type: Option<&str>,
        categories: &[&str],
        title: &str,
    ) -> ProviderMetadata {
        ProviderMetadata {
            provider: ProviderType::Courtyard,
            title: title.to_string(),
            product_type: product_type.map(|value| value.to_string()),
            categories: categories.iter().map(|value| value.to_string()).collect(),
            resolver,
        }
    }

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
    fn test_metadata_matches_pokemon() {
        let metadata = sample_metadata(
            None,
            Some("GRADED_CARD"),
            &["Pokémon"],
            "2024 Pokémon Charizard",
        );
        assert!(AppraisalProcessor::metadata_matches_pokemon(&metadata));

        let non_match = sample_metadata(None, Some("COLLECTIBLE"), &["Baseball"], "Baseball Card");
        assert!(!AppraisalProcessor::metadata_matches_pokemon(&non_match));
    }

    #[test]
    fn test_title_matches_pokemon() {
        assert!(AppraisalProcessor::title_matches_pokemon("pokemon card"));
        assert!(AppraisalProcessor::title_matches_pokemon("Pokémon Sv5a"));
        assert!(!AppraisalProcessor::title_matches_pokemon("Magic Card"));
    }

    #[test]
    fn test_infer_resolver_kind_priority() {
        let metadata = sample_metadata(
            Some(ResolverKind::PokemonTradingCard),
            None,
            &[],
            "Random Title",
        );
        assert_eq!(
            AppraisalProcessor::infer_resolver_kind(&metadata),
            Some(ResolverKind::PokemonTradingCard)
        );

        let metadata_from_categories =
            sample_metadata(None, Some("GRADED_CARD"), &["Pokémon"], "Unknown Title");
        assert_eq!(
            AppraisalProcessor::infer_resolver_kind(&metadata_from_categories),
            Some(ResolverKind::PokemonTradingCard)
        );

        let metadata_from_title =
            sample_metadata(None, Some("COLLECTIBLE"), &["Art"], "Pokemon Artwork");
        assert_eq!(
            AppraisalProcessor::infer_resolver_kind(&metadata_from_title),
            Some(ResolverKind::PokemonTradingCard)
        );

        let metadata_none = sample_metadata(None, Some("COLLECTIBLE"), &["Art"], "Random Title");
        assert!(AppraisalProcessor::infer_resolver_kind(&metadata_none).is_none());
    }
}
