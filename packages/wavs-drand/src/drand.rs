use alloy_primitives::{hex, B256};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

#[cfg(not(test))]
use crate::wasi::keyvalue::store::open;
use crate::wasi::keyvalue::store::Bucket;

/// Drand client for fetching randomness
#[derive(Debug)]
pub struct DrandClient {
    pub url: String,
    pub chain_hash: String,
    cache_bucket: Option<Bucket>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrandRound {
    pub round: u64,
    pub randomness: String,
    pub signature: String,
}

impl DrandClient {
    pub fn new(url: String, chain_hash: String) -> Self {
        Self {
            url,
            chain_hash,
            #[cfg(not(test))]
            cache_bucket: open("drand-cache").ok(),
            #[cfg(test)]
            cache_bucket: None,
        }
    }

    /// Get drand randomness for a specific round
    pub async fn get_round(&self, round: u64) -> Result<B256> {
        let cache_key = format!("round_{}", round);

        // Try to get from cache first
        if let Some(ref bucket) = self.cache_bucket {
            if let Ok(Some(cached_data)) = bucket.get(&cache_key) {
                if cached_data.len() == 32 {
                    let mut bytes = [0u8; 32];
                    bytes.copy_from_slice(&cached_data);
                    return Ok(B256::from(bytes));
                }
            }
        }

        // Fetch from drand API
        let url = format!("{}/{}/public/{}", self.url, self.chain_hash, round);

        let request =
            http_request_get(&url).map_err(|e| anyhow!("Failed to create HTTP request: {}", e))?;

        let response = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch drand round {}: {}", round, e))?;

        let drand_round: DrandRound = serde_json::from_str(&response)
            .map_err(|e| anyhow!("Failed to parse drand response: {}", e))?;

        // Convert hex randomness to B256
        let randomness_bytes = hex::decode(&drand_round.randomness)
            .map_err(|e| anyhow!("Failed to decode drand randomness hex: {}", e))?;

        if randomness_bytes.len() != 32 {
            return Err(anyhow!(
                "Drand randomness is not 32 bytes, got {} bytes",
                randomness_bytes.len()
            ));
        }

        let mut bytes = [0u8; 32];
        bytes.copy_from_slice(&randomness_bytes);
        let result = B256::from(bytes);

        // Cache the result
        if let Some(ref bucket) = self.cache_bucket {
            let _ = bucket.set(&cache_key, &randomness_bytes);
        }

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_drand_client_creation() {
        let client = DrandClient::new(
            "https://api.drand.sh".to_string(),
            "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce".to_string(),
        );

        assert_eq!(client.url, "https://api.drand.sh");
        assert_eq!(
            client.chain_hash,
            "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce"
        );
    }

    #[test]
    fn test_drand_round_deserialization() {
        let json_response = r#"{"round":1,"randomness":"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef","signature":"test_signature"}"#;

        let drand_round: DrandRound = serde_json::from_str(json_response).unwrap();
        assert_eq!(drand_round.round, 1);
        assert_eq!(
            drand_round.randomness,
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        assert_eq!(drand_round.signature, "test_signature");
    }
}
