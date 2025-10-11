use anyhow::{anyhow, Result};
use std::fmt;

use crate::providers::CourtyardProvider;
use crate::resolvers::PokemonPriceResolver;
use crate::traits::metadata::MetadataProvider;
use crate::traits::pricing::{PriceResolver, ResolverQuote};
use crate::types::CardMetadata;

/// Coordinates metadata providers and price resolvers for NFT appraisals.
#[derive(Default)]
pub struct AppraisalEngine {
    metadata_providers: Vec<Box<dyn MetadataProvider>>,
    price_resolvers: Vec<Box<dyn PriceResolver>>,
}

impl AppraisalEngine {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn register_metadata_provider(&mut self, provider: Box<dyn MetadataProvider>) {
        self.metadata_providers.push(provider);
    }

    pub fn register_price_resolver(&mut self, resolver: Box<dyn PriceResolver>) {
        self.price_resolvers.push(resolver);
    }

    pub fn with_defaults(pokemon_api_key: String) -> Self {
        let mut engine = Self::new();
        engine.register_metadata_provider(Box::new(CourtyardProvider::new()));
        engine.register_price_resolver(Box::new(PokemonPriceResolver::new(pokemon_api_key)));
        engine
    }

    pub async fn fetch_metadata(&self, uri: &str) -> Result<CardMetadata> {
        for provider in &self.metadata_providers {
            if provider.can_handle_uri(uri) {
                let provider_type = provider.provider_type();
                let provider_label = format!("{:?}", provider_type);

                let metadata = provider
                    .fetch_metadata(uri)
                    .await
                    .map_err(|e| anyhow!("{} metadata fetch failed: {}", provider_label, e))?;

                provider.verify(&metadata).map_err(|e| {
                    anyhow!("{} metadata verification failed: {}", provider_label, e)
                })?;
                return Ok(metadata);
            }
        }

        Err(anyhow!("No metadata provider registered for URI: {}", uri))
    }

    pub async fn resolve_price(&self, metadata: &CardMetadata) -> Result<Option<ResolverQuote>> {
        for resolver in &self.price_resolvers {
            if resolver.can_resolve(metadata) {
                if let Some(mut quote) = resolver.get_price(metadata).await? {
                    if quote.price.source.is_empty() {
                        quote.price.source = resolver.name().to_string();
                    }
                    return Ok(Some(quote));
                }
                return Ok(None);
            }
        }

        Ok(None)
    }
}

impl fmt::Debug for AppraisalEngine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AppraisalEngine")
            .field("metadata_providers", &self.metadata_providers.len())
            .field("price_resolvers", &self.price_resolvers.len())
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{CardGrade, CardInfo, ProviderType};
    use std::collections::HashMap;

    #[test]
    fn test_appraisal_engine_with_defaults() {
        let engine = AppraisalEngine::with_defaults("test_api_key".to_string());

        // Should have 1 metadata provider (Courtyard)
        assert_eq!(engine.metadata_providers.len(), 1);

        // Should have 1 price resolver (PokemonPriceResolver)
        assert_eq!(engine.price_resolvers.len(), 1);

        // Check that the Pokemon resolver is properly registered
        assert!(engine.price_resolvers[0].name().contains("Pokemon"));
    }

    #[test]
    fn test_pokemon_resolver_integration() {
        let mut engine = AppraisalEngine::new();
        engine.register_price_resolver(Box::new(PokemonPriceResolver::new("test_key".to_string())));

        let pokemon_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Charizard".to_string(),
                category: Some("Pokemon".to_string()),
                card_number: Some("4".to_string()),
                set_name: Some("Base Set".to_string()),
                ..Default::default()
            },
            grade_info: Some(CardGrade {
                grader: "PSA".to_string(),
                numeric_grade: "10".to_string(),
                grade_qualifier: None,
                serial: None,
                integrity_proof: None,
            }),
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        // Verify the resolver can handle Pokemon cards (no network calls)
        assert!(engine.price_resolvers[0].can_resolve(&pokemon_metadata));

        // Test that we can build the search title without making network calls
        if let Some(resolver) = engine.price_resolvers.first() {
            // Just verify it can resolve Pokemon cards, don't try to get prices
            assert_eq!(resolver.name(), "PokemonPriceTracker");
        }
    }
}
