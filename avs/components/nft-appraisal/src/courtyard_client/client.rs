use super::{card_parser::{CardParser, GradedCardAttributes}, integrity::IntegrityVerifier, types::*};
use anyhow::{anyhow, Result};
use alloy_primitives::B256;
use sha3::{Digest, Keccak256};

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

    /// Parse graded card information from NFT metadata and generate card ID
    pub fn parse_graded_card_info(&self, metadata: &NFTMetadata) -> Result<(GradedCardAttributes, B256)> {
        // Parse the graded card attributes
        let attributes = CardParser::parse_graded_card_attributes(metadata)?;
        
        // Generate card ID from attributes
        let card_id = self.generate_card_id(&attributes)?;
        
        Ok((attributes, card_id))
    }

    /// Generate card ID hash from graded card attributes
    /// Format: keccak256(Grader, Grade, Set, Title/Subject, Language, Card Number)
    pub fn generate_card_id(&self, attributes: &GradedCardAttributes) -> Result<B256> {
        // Build the components for hashing
        let mut components = Vec::new();
        
        components.push(attributes.grader.as_bytes());
        components.push(attributes.grade.as_bytes());
        
        // Use set if available, otherwise empty string
        if let Some(set) = &attributes.set {
            components.push(set.as_bytes());
        } else {
            components.push(b"");
        }
        
        components.push(attributes.title.as_bytes());
        
        // Use language if available, otherwise default to "English"  
        if let Some(language) = &attributes.language {
            components.push(language.as_bytes());
        } else {
            components.push(b"English");
        }
        
        components.push(attributes.card_number.as_bytes());
        
        // Join components with separator
        let separator = b"|";
        let mut data = Vec::new();
        for (i, component) in components.iter().enumerate() {
            if i > 0 {
                data.extend_from_slice(separator);
            }
            data.extend_from_slice(component);
        }
        
        // Hash the combined data
        let mut hasher = Keccak256::new();
        hasher.update(&data);
        let hash = hasher.finalize();
        
        Ok(B256::from_slice(&hash))
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        IntegrityVerifier::verify_proof_of_integrity(metadata)
    }
}
