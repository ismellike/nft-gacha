//! Scrydex-based resolver for Pokémon trading card data.
//!
//! This resolver is the foundation for migrating price discovery away from the
//! legacy PokemonPriceTracker API. For the initial iteration we limit the scope
//! to expansion (set) discovery so downstream systems can start wiring in
//! Scrydex metadata. Price lookups will be added in a follow-up change.

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use http::Request;
use serde::{Deserialize, Serialize};
use std::env;
use wstd::{
    http::{Client, IntoBody},
    io::AsyncRead,
};

use crate::traits::pricing::{PriceResolver, ResolverQuote};
use crate::types::ResolverArgs;

const SCRYDEX_EXPANSIONS_ENDPOINT: &str = "https://api.scrydex.com/pokemon/v1/expansions";

/// Resolver that queries Scrydex for card expansion data.
#[derive(Debug, Clone)]
pub struct ScrydexPokemonResolver {
    api_key: String,
    team_id: Option<String>,
    default_page_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexExpansion {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub series: Option<String>,
    #[serde(default)]
    pub code: Option<String>,
    #[serde(default)]
    pub total: Option<u32>,
    #[serde(default)]
    pub printed_total: Option<u32>,
    #[serde(default)]
    pub language: Option<String>,
    #[serde(default)]
    pub language_code: Option<String>,
    #[serde(default)]
    pub release_date: Option<String>,
    #[serde(default)]
    pub is_online_only: Option<bool>,
    #[serde(default)]
    pub logo: Option<String>,
    #[serde(default)]
    pub symbol: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexExpansionSearchResponse {
    pub data: Vec<ScrydexExpansion>,
    #[serde(rename = "page", default)]
    pub page: Option<u32>,
    #[serde(rename = "pageSize", default)]
    pub page_size: Option<u32>,
    #[serde(rename = "totalCount", default)]
    pub total_count: Option<u32>,
}

impl ScrydexPokemonResolver {
    /// Create a new Scrydex resolver.
    pub fn new<S: Into<String>>(api_key: S, team_id: Option<String>) -> Self {
        Self {
            api_key: api_key.into(),
            team_id,
            default_page_size: 5,
        }
    }

    /// Construct a resolver using environment configuration.
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

        Ok(Self::new(scrydex_api_key, scrydex_team_id))
    }

    fn build_search_query(set_id: &str) -> String {
        let normalized = set_id.trim();
        format!("code:\"{}\"", Self::escape_query_value(normalized))
    }

    fn escape_query_value(value: &str) -> String {
        value.replace('"', "\\\"")
    }

    async fn search_expansions(&self, query: &str) -> Result<ScrydexExpansionSearchResponse> {
        let encoded_query = urlencoding::encode(query);
        let url = format!(
            "{}?pageSize={}&q={}",
            SCRYDEX_EXPANSIONS_ENDPOINT, self.default_page_size, encoded_query
        );

        let mut builder = Request::get(&url);
        builder = builder.header("X-Api-Key", self.api_key.as_str());
        if let Some(team_id) = &self.team_id {
            builder = builder.header("X-Team-ID", team_id.as_str());
        }

        let request = builder
            .body(Vec::new().into_body())
            .map_err(|e| anyhow!("Failed to construct Scrydex expansions request: {}", e))?;

        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Scrydex expansions request failed: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            return Err(anyhow!(
                "Scrydex expansions request returned status {}",
                status
            ));
        }

        let mut body = Vec::new();
        response
            .body_mut()
            .read_to_end(&mut body)
            .await
            .map_err(|e| anyhow!("Failed to read Scrydex expansions response: {}", e))?;

        let response_text = String::from_utf8(body)
            .map_err(|e| anyhow!("Scrydex expansions response was not valid UTF-8: {}", e))?;

        let parsed: ScrydexExpansionSearchResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Scrydex expansions response: {}", e))?;

        Ok(parsed)
    }

    fn pick_best_expansion(
        expansions: &[ScrydexExpansion],
        expected_set_code: &str,
    ) -> Option<ScrydexExpansion> {
        if expansions.is_empty() {
            return None;
        }

        if let Some(exact_match) = expansions.iter().find(|expansion| {
            expansion
                .code
                .as_deref()
                .map(|code| code.trim().eq_ignore_ascii_case(expected_set_code))
                .unwrap_or(false)
        }) {
            return Some(exact_match.clone());
        }

        expansions.first().cloned()
    }
}

#[async_trait(?Send)]
impl PriceResolver for ScrydexPokemonResolver {
    fn name(&self) -> &str {
        "Scrydex"
    }

    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>> {
        let set_id = match args {
            ResolverArgs::PokemonCardInfo { set_id, .. } => set_id,
        };

        let trimmed_set_id = set_id.trim();
        if trimmed_set_id.is_empty() {
            return Err(anyhow!("Scrydex resolver requires a set identifier"));
        }

        let query = Self::build_search_query(trimmed_set_id);

        let search_response = self.search_expansions(&query).await?;
        let expansion = Self::pick_best_expansion(&search_response.data, trimmed_set_id)
            .or_else(|| search_response.data.first().cloned());

        if expansion.is_none() {
            return Err(anyhow!(
                "Scrydex expansion not found for set identifier {}",
                trimmed_set_id
            ));
        }

        Err(anyhow!("Scrydex price lookup is not implemented yet"))
    }
}

// ==========================================================================================
// Tests
// ==========================================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_search_query_formats_code() {
        let query = ScrydexPokemonResolver::build_search_query(" Sv5a  ");
        assert_eq!(query, "code:\"Sv5a\"");
    }

    #[test]
    fn pick_best_expansion_prefers_code_match() {
        let expansions = vec![
            ScrydexExpansion {
                id: "1".to_string(),
                name: "Crimson Haze".to_string(),
                series: None,
                code: Some("sv5a".to_string()),
                total: None,
                printed_total: None,
                language: None,
                language_code: None,
                release_date: None,
                is_online_only: None,
                logo: None,
                symbol: None,
            },
            ScrydexExpansion {
                id: "2".to_string(),
                name: "Other".to_string(),
                series: None,
                code: Some("sv4".to_string()),
                total: None,
                printed_total: None,
                language: None,
                language_code: None,
                release_date: None,
                is_online_only: None,
                logo: None,
                symbol: None,
            },
        ];

        let picked = ScrydexPokemonResolver::pick_best_expansion(&expansions, "sv5a")
            .expect("expected match");
        assert_eq!(picked.code.as_deref(), Some("sv5a"));
    }
}
