use crate::bindings;
use anyhow::Result;
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub pokemon_api_key: String,
    pub cache_ttl_seconds: u64,
    pub courtyard_base_url: String,
}

impl Config {
    pub fn new() -> Result<Self> {
        // Secret values still come from environment variables
        let pokemon_api_key = env::var("WAVS_ENV_POKEMON_PRICE_API_KEY").map_err(|_| {
            anyhow::anyhow!("WAVS_ENV_POKEMON_PRICE_API_KEY environment variable not set")
        })?;

        // Non-secret values come from host::config_var with sensible defaults
        let cache_ttl_seconds = bindings::host::config_var("CACHE_TTL_SECONDS")
            .and_then(|s| s.parse().ok())
            .unwrap_or(86400); // Default to 24 hours (86400 seconds)

        let courtyard_base_url = bindings::host::config_var("COURTYARD_BASE_URL")
            .unwrap_or_else(|| "https://api.courtyard.io".to_string());

        Ok(Self {
            pokemon_api_key,
            cache_ttl_seconds,
            courtyard_base_url,
        })
    }

    pub fn validate(&self) -> Result<()> {
        if self.pokemon_api_key.is_empty() {
            return Err(anyhow::anyhow!("Pokemon API key cannot be empty"));
        }

        if self.cache_ttl_seconds == 0 {
            return Err(anyhow::anyhow!("Cache TTL must be greater than 0"));
        }

        Ok(())
    }
}
