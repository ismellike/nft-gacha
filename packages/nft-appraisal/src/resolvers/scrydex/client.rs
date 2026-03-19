//! HTTP client for Scrydex API

use anyhow::{anyhow, Result};
use http::Request;
use wavs_wasi_utils::http::fetch_string;
use wstd::http::IntoBody;

use urlencoding::encode;

use super::types::ScrydexCardResponse;

const DEFAULT_SCRYDEX_CARDS_ENDPOINT: &str = "https://api.scrydex.com/pokemon/v1/cards";

/// HTTP client for Scrydex API
#[derive(Debug, Clone)]
pub struct ScrydexClient {
    api_key: String,
    team_id: Option<String>,
    cards_endpoint: String,
}

impl ScrydexClient {
    pub fn new<S: Into<String>>(api_key: S, team_id: Option<String>) -> Self {
        Self {
            api_key: api_key.into(),
            team_id,
            cards_endpoint: DEFAULT_SCRYDEX_CARDS_ENDPOINT.to_string(),
        }
    }

    /// Override the default Scrydex cards endpoint (e.g. for staging/self-hosted).
    pub fn with_endpoint<S: Into<String>>(mut self, endpoint: S) -> Self {
        self.cards_endpoint = endpoint.into();
        self
    }

    /// Fetch card data from Scrydex API
    pub async fn get_card(&self, card_identifier: &str) -> Result<ScrydexCardResponse> {
        let url = format!(
            "{}/{}?include=prices",
            self.cards_endpoint,
            encode(card_identifier)
        );

        let mut builder = Request::get(&url);
        builder = builder.header("X-Api-Key", self.api_key.as_str());
        if let Some(team_id) = &self.team_id {
            builder = builder.header("X-Team-ID", team_id.as_str());
        }

        let request = builder
            .body(Vec::new().into_body())
            .map_err(|e| anyhow!("Failed to construct Scrydex card request: {}", e))?;

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Scrydex card request failed for {}: {}", card_identifier, e))?;

        let parsed: ScrydexCardResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Scrydex card response: {}", e))?;

        Ok(parsed)
    }
}
