//! HTTP client for fetching Courtyard NFT metadata

use anyhow::{anyhow, Result};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

use super::types::NFTMetadata;

/// HTTP client for Courtyard API
#[derive(Debug)]
pub struct CourtyardClient;

impl CourtyardClient {
    pub fn new() -> Self {
        Self
    }

    /// Fetch NFT metadata directly from a URI (for Courtyard URIs).
    /// Only HTTPS URIs are accepted to prevent MITM attacks on metadata.
    pub async fn get_nft_metadata_from_uri(&self, uri: &str) -> Result<NFTMetadata> {
        if !uri.starts_with("https://") {
            return Err(anyhow!(
                "Refusing to fetch metadata over insecure transport: {}. Only HTTPS is allowed.",
                uri
            ));
        }

        let request = http_request_get(uri)
            .map_err(|e| anyhow!("Failed to create HTTP request for URI {}: {}", uri, e))?;

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch NFT metadata from URI {}: {}", uri, e))?;

        let metadata: NFTMetadata = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse metadata JSON from URI {}: {}", uri, e))?;

        Ok(metadata)
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        // Extract proof information
        let proof_info = metadata
            .token_info
            .as_ref()
            .and_then(|ti| ti.proof_of_integrity.as_ref())
            .ok_or_else(|| {
                anyhow!("No proof of integrity found in metadata - this card may not be authentic")
            })?;

        super::verifier::IntegrityVerifier::verify_proof_of_integrity(proof_info)
    }
}
