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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resolvers::scrydex::client::DEFAULT_SCRYDEX_CARDS_ENDPOINT;

    // -----------------------------------------------------------------------
    // ScrydexPokemonResolver::new
    // -----------------------------------------------------------------------

    #[test]
    fn new_stores_api_key_in_client() {
        let resolver = ScrydexPokemonResolver::new("resolver-key-xyz", None);
        assert_eq!(resolver.client.api_key, "resolver-key-xyz");
    }

    #[test]
    fn new_with_team_id_stores_team_id() {
        let resolver = ScrydexPokemonResolver::new("key", Some("team-id-99".to_string()));
        assert_eq!(resolver.client.team_id, Some("team-id-99".to_string()));
    }

    #[test]
    fn new_uses_default_endpoint() {
        let resolver = ScrydexPokemonResolver::new("key", None);
        assert_eq!(resolver.client.cards_endpoint, DEFAULT_SCRYDEX_CARDS_ENDPOINT);
    }

    #[test]
    fn name_returns_scrydex() {
        let resolver = ScrydexPokemonResolver::new("key", None);
        assert_eq!(resolver.name(), "Scrydex");
    }

    // -----------------------------------------------------------------------
    // from_env — missing env var
    // -----------------------------------------------------------------------

    #[test]
    fn from_env_errors_when_api_key_missing() {
        // Remove the env var to ensure it is not set during this test.
        // We use std::env::remove_var cautiously; tests are single-threaded by
        // default for the native test harness.
        let key = "WAVS_ENV_SCRYDEX_API_KEY";
        let original = std::env::var(key).ok();
        std::env::remove_var(key);

        let result = ScrydexPokemonResolver::from_env();

        // Restore original value if it existed.
        if let Some(val) = original {
            std::env::set_var(key, val);
        }

        assert!(result.is_err(), "from_env must fail when WAVS_ENV_SCRYDEX_API_KEY is not set");
        let msg = result.unwrap_err().to_string();
        assert!(
            msg.contains("WAVS_ENV_SCRYDEX_API_KEY"),
            "error message must mention the missing env var; got: {msg}"
        );
    }

    #[test]
    fn from_env_succeeds_when_api_key_present() {
        let key = "WAVS_ENV_SCRYDEX_API_KEY";
        let team_key = "WAVS_ENV_SCRYDEX_TEAM_ID";
        let original_key = std::env::var(key).ok();
        let original_team = std::env::var(team_key).ok();

        std::env::set_var(key, "test-key-from-env");
        std::env::remove_var(team_key);

        let result = ScrydexPokemonResolver::from_env();

        // Restore
        if let Some(val) = original_key {
            std::env::set_var(key, val);
        } else {
            std::env::remove_var(key);
        }
        if let Some(val) = original_team {
            std::env::set_var(team_key, val);
        }

        assert!(result.is_ok(), "from_env must succeed when WAVS_ENV_SCRYDEX_API_KEY is set");
        let resolver = result.unwrap();
        assert_eq!(resolver.client.api_key, "test-key-from-env");
        assert!(resolver.client.team_id.is_none());
    }

    #[test]
    fn from_env_reads_custom_endpoint() {
        let api_key = "WAVS_ENV_SCRYDEX_API_KEY";
        let endpoint_key = "WAVS_ENV_SCRYDEX_ENDPOINT";
        let original_api = std::env::var(api_key).ok();
        let original_endpoint = std::env::var(endpoint_key).ok();

        std::env::set_var(api_key, "any-key");
        std::env::set_var(endpoint_key, "https://custom.endpoint.example.com");

        let result = ScrydexPokemonResolver::from_env();

        // Restore
        if let Some(val) = original_api {
            std::env::set_var(api_key, val);
        } else {
            std::env::remove_var(api_key);
        }
        if let Some(val) = original_endpoint {
            std::env::set_var(endpoint_key, val);
        } else {
            std::env::remove_var(endpoint_key);
        }

        assert!(result.is_ok());
        let resolver = result.unwrap();
        assert_eq!(
            resolver.client.cards_endpoint,
            "https://custom.endpoint.example.com"
        );
    }
}
