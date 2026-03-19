//! Scrydex resolver implementation with PriceResolver trait

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use std::env;

use crate::traits::pricing::{AppraisalPrice, PriceResolver, ResolverQuote};
use crate::types::ResolverArgs;
use std::time::Duration;

use super::client::ScrydexClient;
use super::matcher::PriceMatcher;

/// Resolver that queries Scrydex for Pokemon card data
#[derive(Debug, Clone)]
pub struct ScrydexPokemonResolver {
    client: ScrydexClient,
}

impl ScrydexPokemonResolver {
    /// Create a new Scrydex resolver
    pub fn new<S: Into<String>>(api_key: S, team_id: Option<String>) -> Self {
        Self {
            client: ScrydexClient::new(api_key, team_id),
        }
    }

    /// Construct a resolver using environment configuration
    pub fn from_env() -> Result<Self> {
        let scrydex_api_key = env::var("WAVS_ENV_SCRYDEX_API_KEY").map_err(|_| {
            anyhow!(
                "Scrydex API key environment variable not set. Provide WAVS_ENV_SCRYDEX_API_KEY"
            )
        })?;

        let scrydex_team_id = env::var("WAVS_ENV_SCRYDEX_TEAM_ID")
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());

        let mut resolver = Self::new(scrydex_api_key, scrydex_team_id);

        if let Ok(endpoint) = env::var("WAVS_ENV_SCRYDEX_ENDPOINT") {
            let endpoint = endpoint.trim().to_string();
            if !endpoint.is_empty() {
                resolver.client = resolver.client.with_endpoint(endpoint);
            }
        }

        Ok(resolver)
    }
}

#[async_trait(?Send)]
impl PriceResolver for ScrydexPokemonResolver {
    fn name(&self) -> &str {
        "Scrydex"
    }

    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>> {
        let ResolverArgs::ScrydexCardInfo(info) = args;

        let card_identifier = info.card_identifier();

        let card_response = self.client.get_card(&card_identifier).await?;

        let matching_price = PriceMatcher::find_matching_price(
            &card_response.data,
            &info.grade,
            &info.company,
            info.is_perfect,
            &info.variant,
        );

        if let Some(price) = matching_price {
            // Validate that price is in USD
            if price.currency != "USD" {
                return Err(anyhow!(
                    "Price for card {} is in {} but only USD is supported. Grade: {}, Company: {}",
                    card_identifier,
                    price.currency,
                    info.grade,
                    info.company
                ));
            }

            let quote = ResolverQuote {
                price: AppraisalPrice {
                    value: price.market,
                    currency: price.currency.clone(),
                    source: "Scrydex".to_string(),
                    context: Some(serde_json::json!({
                        "card_id": card_response.data.id,
                        "card_name": card_response.data.name,
                        "card_number": card_response.data.number,
                        "rarity": card_response.data.rarity,
                        "expansion": card_response.data.expansion,
                        "grade": info.grade,
                        "company": info.company,
                        "is_perfect": info.is_perfect,
                        "variant": info.variant,
                        "pricing_metrics": {
                            "low": price.low,
                            "mid": price.mid,
                            "high": price.high,
                            "market": price.market,
                        },
                        "trends": price.trends,
                    })),
                },
                ttl: Duration::from_secs(86400), // 24 hours cache TTL
            };
            Ok(Some(quote))
        } else {
            Ok(None)
        }
    }
}
