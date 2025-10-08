use anyhow::Result;
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub pokemon_api_key: String,
}

impl Config {
    pub fn new() -> Result<Self> {
        // Secret values still come from environment variables
        let pokemon_api_key = env::var("WAVS_ENV_POKEMON_PRICE_API_KEY").map_err(|_| {
            anyhow::anyhow!("WAVS_ENV_POKEMON_PRICE_API_KEY environment variable not set")
        })?;

        Ok(Self { pokemon_api_key })
    }
}
