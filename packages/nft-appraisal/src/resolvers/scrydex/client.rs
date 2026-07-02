//! HTTP client for Scrydex API

use anyhow::{anyhow, Result};
use http::Request;
use wavs_wasi_utils::http::fetch_string;
use wstd::http::IntoBody;

use urlencoding::encode;

use super::types::ScrydexCardResponse;

pub(crate) const DEFAULT_SCRYDEX_CARDS_ENDPOINT: &str = "https://api.scrydex.com/pokemon/v1/cards";

/// Total attempts for a Scrydex request (1 initial + retries).
const MAX_ATTEMPTS: u32 = 3;
/// Fixed backoff schedule between attempts. Deterministic (no jitter) so behavior is reproducible
/// across operators; a transient network blip on one operator shouldn't desync it from peers that
/// happened to succeed, which would otherwise break AVS quorum on the appraisal.
const BACKOFF_MS: [u64; 2] = [200, 500];

/// HTTP client for Scrydex API
#[derive(Debug, Clone)]
pub struct ScrydexClient {
    pub(crate) api_key: String,
    pub(crate) team_id: Option<String>,
    pub(crate) cards_endpoint: String,
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

    /// Fetch card data from Scrydex API, retrying transient request failures with a fixed backoff.
    pub async fn get_card(&self, card_identifier: &str) -> Result<ScrydexCardResponse> {
        let url = format!(
            "{}/{}?include=prices",
            self.cards_endpoint,
            encode(card_identifier)
        );

        // The request body is consumed per send, so rebuild the request on each attempt.
        let build_request = || {
            let mut builder = Request::get(&url);
            builder = builder.header("X-Api-Key", self.api_key.as_str());
            if let Some(team_id) = &self.team_id {
                builder = builder.header("X-Team-ID", team_id.as_str());
            }
            builder
                .body(Vec::new().into_body())
                .map_err(|e| anyhow!("Failed to construct Scrydex card request: {}", e))
        };

        let mut attempt: u32 = 0;
        let response_text = loop {
            let request = build_request()?;
            match fetch_string(request).await {
                Ok(text) => break text,
                Err(e) => {
                    attempt += 1;
                    if attempt >= MAX_ATTEMPTS {
                        return Err(anyhow!(
                            "Scrydex card request failed for {} after {} attempts: {}",
                            card_identifier,
                            attempt,
                            e
                        ));
                    }
                    let backoff_ms = BACKOFF_MS[(attempt as usize - 1).min(BACKOFF_MS.len() - 1)];
                    wstd::task::sleep(wstd::time::Duration::from_millis(backoff_ms)).await;
                }
            }
        };

        let parsed: ScrydexCardResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Scrydex card response: {}", e))?;

        Ok(parsed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // -----------------------------------------------------------------------
    // ScrydexClient::new
    // -----------------------------------------------------------------------

    #[test]
    fn new_stores_api_key_correctly() {
        let client = ScrydexClient::new("test-api-key-123", None);
        assert_eq!(client.api_key, "test-api-key-123");
    }

    #[test]
    fn new_stores_team_id_correctly() {
        let client = ScrydexClient::new("key", Some("team-abc".to_string()));
        assert_eq!(client.team_id, Some("team-abc".to_string()));
    }

    #[test]
    fn new_with_no_team_id_stores_none() {
        let client = ScrydexClient::new("key", None);
        assert!(client.team_id.is_none());
    }

    #[test]
    fn new_uses_default_endpoint() {
        let client = ScrydexClient::new("key", None);
        assert_eq!(client.cards_endpoint, DEFAULT_SCRYDEX_CARDS_ENDPOINT);
    }

    // -----------------------------------------------------------------------
    // with_endpoint
    // -----------------------------------------------------------------------

    #[test]
    fn with_endpoint_overrides_default() {
        let client =
            ScrydexClient::new("key", None).with_endpoint("https://staging.scrydex.com/v1/cards");
        assert_eq!(
            client.cards_endpoint,
            "https://staging.scrydex.com/v1/cards"
        );
    }

    #[test]
    fn with_endpoint_preserves_api_key() {
        let client = ScrydexClient::new("my-key", None).with_endpoint("https://custom.example.com");
        assert_eq!(client.api_key, "my-key");
    }

    #[test]
    fn with_endpoint_preserves_team_id() {
        let client = ScrydexClient::new("key", Some("team-42".to_string()))
            .with_endpoint("https://custom.example.com");
        assert_eq!(client.team_id, Some("team-42".to_string()));
    }

    // -----------------------------------------------------------------------
    // URL construction (via encode)
    // -----------------------------------------------------------------------

    #[test]
    fn card_identifier_with_slash_is_url_encoded() {
        // The client uses urlencoding::encode on the identifier before appending
        // it to the endpoint. Verify that a slash in the identifier is percent-encoded.
        let identifier = "base1-58/102";
        let encoded = encode(identifier);
        assert_eq!(encoded, "base1-58%2F102");

        // Verify the constructed URL format matches expectations.
        let client = ScrydexClient::new("key", None);
        let expected_url = format!(
            "{}/{}?include=prices",
            client.cards_endpoint,
            encode(identifier)
        );
        assert!(expected_url.contains("base1-58%2F102"));
        assert!(expected_url.ends_with("?include=prices"));
    }

    #[test]
    fn url_construction_appends_include_prices() {
        let client = ScrydexClient::new("key", None);
        let id = "sv5a-1";
        let url = format!("{}/{}?include=prices", client.cards_endpoint, encode(id));
        assert!(url.ends_with("?include=prices"));
        assert!(url.contains(id));
    }
}
