use super::{
    card_parser::{CardParser, GradedCardAttributes},
    integrity::IntegrityVerifier,
    types::*,
};
use anyhow::{anyhow, Result};

#[derive(Debug)]
pub struct CourtyardClient {
    client: reqwest::Client,
}

impl CourtyardClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
        }
    }

    /// Fetch NFT metadata directly from a URI (for Courtyard URIs)
    pub async fn get_nft_metadata_from_uri(&self, uri: &str) -> Result<NFTMetadata> {
        let response = self
            .client
            .get(uri)
            .header("Content-Type", "application/json")
            .header("User-Agent", "WAVS-NFT-Appraisal/1.0")
            .send()
            .await
            .map_err(|e| anyhow!("Failed to fetch NFT metadata from URI: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            return match status.as_u16() {
                404 => Err(anyhow!("NFT metadata not found at URI: {}", uri)),
                429 => Err(anyhow!("Rate limit exceeded")),
                _ => Err(anyhow!("HTTP error {}: {}", status, uri)),
            };
        }

        let metadata: NFTMetadata = response
            .json()
            .await
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
