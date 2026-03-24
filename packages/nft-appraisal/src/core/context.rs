use std::sync::Arc;

use anyhow::Result;
use async_trait::async_trait;

use crate::core::cache::AppraisalCache;
use crate::providers::courtyard::CourtyardProvider;
use crate::providers::generic::GenericProvider;
use crate::providers::{ProviderRegistry, RegisteredProvider};
use crate::resolvers::scrydex::ScrydexPokemonResolver;
use crate::resolvers::{RegisteredResolver, ResolverRegistry};
use crate::utils::ERC721Client;

/// Boundary trait so the processor can fetch token URIs without depending on a concrete client.
#[async_trait(?Send)]
pub trait TokenUriFetcher: Send + Sync {
    async fn token_uri(
        &self,
        chain: &str,
        contract_address: &str,
        token_id: &str,
    ) -> Result<String>;
}

#[async_trait(?Send)]
impl TokenUriFetcher for ERC721Client {
    async fn token_uri(
        &self,
        chain: &str,
        contract_address: &str,
        token_id: &str,
    ) -> Result<String> {
        self.get_token_uri(chain, contract_address, token_id).await
    }
}

/// Bundles all dependencies the appraisal processor needs. This makes the flow testable and extensible.
#[derive(Clone)]
pub struct AppraisalContext {
    pub token_uri_fetcher: Arc<dyn TokenUriFetcher>,
    pub cache: Arc<AppraisalCache>,
    pub providers: ProviderRegistry,
    pub resolvers: ResolverRegistry,
}

impl AppraisalContext {
    pub fn new(
        token_uri_fetcher: Arc<dyn TokenUriFetcher>,
        cache: Arc<AppraisalCache>,
        providers: ProviderRegistry,
        resolvers: ResolverRegistry,
    ) -> Self {
        Self {
            token_uri_fetcher,
            cache,
            providers,
            resolvers,
        }
    }

    /// Construct context from environment configuration. Fails fast if required config is missing.
    pub fn from_env() -> Result<Self> {
        let cache = Arc::new(AppraisalCache::default());
        let providers =
            ProviderRegistry::new(vec![
                RegisteredProvider::Courtyard(CourtyardProvider::new()),
                // Generic fallback must be last — it accepts any URI
                RegisteredProvider::Generic(GenericProvider::new()),
            ]);
        // Scrydex resolver is optional — generic testnet NFTs don't need it
        let mut registered_resolvers = Vec::new();
        match ScrydexPokemonResolver::from_env() {
            Ok(scrydex) => registered_resolvers.push(RegisteredResolver::Scrydex(scrydex)),
            Err(_) => {
                // No Scrydex API key configured; Courtyard NFTs won't get prices
                // but generic NFTs will still work via the fallback provider
            }
        }
        let resolvers = ResolverRegistry::new(registered_resolvers);
        Ok(Self::new(
            Arc::new(ERC721Client::new()),
            cache,
            providers,
            resolvers,
        ))
    }
}
