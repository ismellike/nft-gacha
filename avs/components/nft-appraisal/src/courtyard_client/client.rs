use super::{card_parser::CardParser, integrity::IntegrityVerifier, types::*};
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

    /// Parse Pokemon card information from NFT metadata
    pub fn parse_pokemon_card_info(&self, metadata: &NFTMetadata) -> Result<PokemonCardInfo> {
        // Prefer explicit title/subject from attributes; fallback to parsing the name string
        let card_name = CardParser::extract_title_from_attributes(&metadata.attributes)
            .or_else(|| CardParser::extract_card_name(&metadata.name).ok())
            .ok_or_else(|| anyhow!("Unable to determine card name from metadata"))?;

        let set = CardParser::extract_set_from_attributes(&metadata.attributes);
        let grade = CardParser::extract_grade_from_attributes(&metadata.attributes);
        let card_number = CardParser::extract_card_number_from_attributes(&metadata.attributes);
        let rarity = CardParser::extract_rarity_from_attributes(&metadata.attributes)
            .or_else(|| CardParser::extract_rarity_from_name(&metadata.name));

        Ok(PokemonCardInfo {
            name: card_name,
            set,
            grade,
            card_number,
            rarity,
        })
    }

    /// Verify proof of integrity for a Courtyard NFT
    pub fn verify_proof_of_integrity(&self, metadata: &NFTMetadata) -> Result<bool> {
        IntegrityVerifier::verify_proof_of_integrity(metadata)
    }
}
