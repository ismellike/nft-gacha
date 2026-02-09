//! HTTP client for Scrydex API

use anyhow::{anyhow, Result};
use http::Request;
use wstd::{
    http::{Client, IntoBody},
    io::AsyncRead,
};

use urlencoding::encode;

use super::types::ScrydexCardResponse;

const SCRYDEX_CARDS_ENDPOINT: &str = "https://api.scrydex.com/pokemon/v1/cards";

/// HTTP client for Scrydex API
#[derive(Debug, Clone)]
pub struct ScrydexClient {
    api_key: String,
    team_id: Option<String>,
}

impl ScrydexClient {
    pub fn new<S: Into<String>>(api_key: S, team_id: Option<String>) -> Self {
        Self {
            api_key: api_key.into(),
            team_id,
        }
    }

    /// Fetch card data from Scrydex API
    pub async fn get_card(&self, card_identifier: &str) -> Result<ScrydexCardResponse> {
        let url = format!(
            "{}/{}?include=prices",
            SCRYDEX_CARDS_ENDPOINT,
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

        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Scrydex card request failed: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            let mut err_body = Vec::new();
            let _ = response.body_mut().read_to_end(&mut err_body).await;
            let err_text = String::from_utf8_lossy(&err_body);
            let truncated: String = err_text.chars().take(500).collect();
            return Err(anyhow!(
                "Scrydex card request returned status {} for card {}: {}",
                status,
                card_identifier,
                truncated
            ));
        }

        let mut body = Vec::new();
        response
            .body_mut()
            .read_to_end(&mut body)
            .await
            .map_err(|e| anyhow!("Failed to read Scrydex card response: {}", e))?;

        let response_text = String::from_utf8(body)
            .map_err(|e| anyhow!("Scrydex card response was not valid UTF-8: {}", e))?;

        let parsed: ScrydexCardResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Scrydex card response: {}", e))?;

        Ok(parsed)
    }
}
