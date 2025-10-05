use super::{
    card_parser::{CardParser, GradedCardAttributes},
    integrity::IntegrityVerifier,
    types::*,
};
use anyhow::{anyhow, Result};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

#[derive(Debug)]
pub struct CourtyardClient;

impl CourtyardClient {
    pub fn new() -> Self {
        Self
    }

    /// Fetch NFT metadata directly from a URI (for Courtyard URIs)
    pub async fn get_nft_metadata_from_uri(&self, uri: &str) -> Result<NFTMetadata> {
        let request = http_request_get(uri)
            .map_err(|e| anyhow!("Failed to create HTTP request for URI {}: {}", uri, e))?;

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch NFT metadata from URI {}: {}", uri, e))?;

        let metadata: NFTMetadata = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse metadata JSON from URI {}: {}", uri, e))?;

        Ok(metadata)
    }

    /// Parse graded card information from NFT metadata
    pub fn parse_graded_card_info(&self, metadata: &NFTMetadata) -> Result<GradedCardAttributes> {
        // Parse and return the graded card attributes directly
        CardParser::parse_graded_card_attributes(metadata)
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        IntegrityVerifier::verify_proof_of_integrity(metadata)
    }
}
