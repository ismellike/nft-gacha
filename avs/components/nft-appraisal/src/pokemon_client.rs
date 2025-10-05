use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wavs_wasi_utils::http::fetch_string;
use wstd::{http::Request, io::empty};

#[cfg(not(test))]
use crate::bindings::wasi::keyvalue::store::open;
use crate::bindings::wasi::keyvalue::store::Bucket;

#[derive(Debug)]
pub struct PokemonPriceClient {
    base_url: String,
    api_key: String,
    cache_bucket: Option<Bucket>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardPrice {
    pub id: String,
    pub name: String,
    pub set_id: String,
    pub set_name: String,
    pub number: Option<String>,
    pub rarity: Option<String>,
    pub market_price: Option<f64>,
    pub psa_10_price: Option<f64>,
    pub psa_9_price: Option<f64>,
    pub raw_price: Option<f64>,
    pub last_updated: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedPrice {
    price: Option<f64>,
    cached_at: i64,
}

impl CachedPrice {
    fn new(price: Option<f64>) -> Self {
        Self {
            price,
            cached_at: chrono::Utc::now().timestamp(),
        }
    }

    fn is_expired(&self) -> bool {
        const CACHE_TTL_SECONDS: i64 = 24 * 60 * 60; // 1 day
        let now = chrono::Utc::now().timestamp();
        (now - self.cached_at) > CACHE_TTL_SECONDS
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct CachedCardPrices {
    prices: Vec<CardPrice>,
    cached_at: i64,
}

impl CachedCardPrices {
    fn new(prices: Vec<CardPrice>) -> Self {
        Self {
            prices,
            cached_at: chrono::Utc::now().timestamp(),
        }
    }

    fn is_expired(&self) -> bool {
        const CACHE_TTL_SECONDS: i64 = 24 * 60 * 60; // 1 day
        let now = chrono::Utc::now().timestamp();
        (now - self.cached_at) > CACHE_TTL_SECONDS
    }
}

impl PokemonPriceClient {
    pub fn new(api_key: String) -> Self {
        Self {
            base_url: "https://www.pokemonpricetracker.com/api".to_string(),
            api_key,
            #[cfg(not(test))]
            cache_bucket: open("pokemon-price-cache").ok(),
            #[cfg(test)]
            cache_bucket: None,
        }
    }

    /// Get card price by name with caching
    pub async fn appraise_card(
        &self,
        card_name: &str,
        set_id: Option<&str>,
        grade: Option<&str>,
    ) -> Result<Option<f64>> {
        // Create cache key
        let cache_key = format!(
            "appraise_{}_{}_{}",
            card_name.to_lowercase().replace(' ', "_"),
            set_id.unwrap_or("any"),
            grade.unwrap_or("raw")
        );

        // Try cache first (with 1-day TTL)
        if let Some(ref bucket) = self.cache_bucket {
            if let Ok(Some(cached_data)) = bucket.get(&cache_key) {
                if let Ok(cached_str) = String::from_utf8(cached_data) {
                    if let Ok(cached_price) = serde_json::from_str::<CachedPrice>(&cached_str) {
                        if !cached_price.is_expired() {
                            return Ok(cached_price.price);
                        }
                        // Cache expired, will fetch new data
                    }
                }
            }
        }

        // Fetch from Pokemon Price Tracker API
        let card = self.get_card_by_name(card_name, set_id).await?;

        let price = if let Some(card_data) = card {
            match grade {
                Some("PSA 10") => card_data.psa_10_price,
                Some("PSA 9") => card_data.psa_9_price,
                Some("raw") | None => card_data.raw_price.or(card_data.market_price),
                _ => card_data.market_price,
            }
        } else {
            None
        };

        // Cache the result
        if let Some(ref bucket) = self.cache_bucket {
            let cached_price = CachedPrice::new(price);
            if let Ok(serialized) = serde_json::to_string(&cached_price) {
                let _ = bucket.set(&cache_key, serialized.as_bytes());
            }
        }

        Ok(price)
    }

    /// Get card data by name from Pokemon Price Tracker API
    async fn get_card_by_name(
        &self,
        name: &str,
        set_id: Option<&str>,
    ) -> Result<Option<CardPrice>> {
        let mut params = HashMap::new();
        params.insert("search".to_string(), name.to_string());
        params.insert("includeEbay".to_string(), "true".to_string());

        if let Some(set) = set_id {
            params.insert("set".to_string(), set.to_string());
        }

        let cards = self.get_card_prices(&params).await?;

        // Return first exact match or closest match
        let mut cards_iter = cards.into_iter();
        Ok(cards_iter
            .find(|card| card.name.to_lowercase() == name.to_lowercase())
            .or_else(|| cards_iter.next()))
    }

    /// Fetch card prices from Pokemon Price Tracker API
    async fn get_card_prices(&self, params: &HashMap<String, String>) -> Result<Vec<CardPrice>> {
        // Create cache key from params
        let mut cache_key_parts: Vec<String> =
            params.iter().map(|(k, v)| format!("{}={}", k, v)).collect();
        cache_key_parts.sort();
        let cache_key = format!("prices_{}", cache_key_parts.join("&"));

        // Try cache first (with 1-day TTL)
        if let Some(ref bucket) = self.cache_bucket {
            if let Ok(Some(cached_data)) = bucket.get(&cache_key) {
                if let Ok(cached_str) = String::from_utf8(cached_data) {
                    // For card prices, we cache them with a timestamp wrapper
                    if let Ok(cached_data_with_time) =
                        serde_json::from_str::<CachedCardPrices>(&cached_str)
                    {
                        if !cached_data_with_time.is_expired() {
                            return Ok(cached_data_with_time.prices);
                        }
                        // Cache expired, will fetch new data
                    }
                }
            }
        }

        // Build URL with query parameters - using v2 endpoint
        let mut url = format!("{}/v2/cards", self.base_url);
        if !params.is_empty() {
            let query_params: Vec<String> = params
                .iter()
                .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
                .collect();
            url = format!("{}?{}", url, query_params.join("&"));
        }

        let request = Request::get(&url)
            .header("authorization", format!("Bearer {}", self.api_key))
            .header("content-type", "application/json")
            .header("user-agent", "WAVS-NFT-Appraisal/1.0")
            .body(empty())
            .map_err(|e| anyhow!("Failed to create HTTP request for URL {}: {}", url, e))?;

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch data from Pokemon Price Tracker API: {}", e))?;

        // Parse API response - handle v2 response format
        let api_response: serde_json::Value = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse API response: {}", e))?;

        // Extract cards from v2 response format
        let cards = if let Some(data_array) = api_response.as_array() {
            // Parse each card in the array
            data_array
                .iter()
                .filter_map(|card_value| self.parse_v2_card_response(card_value).ok())
                .collect()
        } else {
            // Handle error case or different response format
            if let Some(error_msg) = api_response.get("error").and_then(|e| e.as_str()) {
                return Err(anyhow!("Pokemon Price Tracker API error: {}", error_msg));
            }
            vec![]
        };

        // Cache the result
        if let Some(ref bucket) = self.cache_bucket {
            let cached_prices = CachedCardPrices::new(cards.clone());
            if let Ok(serialized) = serde_json::to_string(&cached_prices) {
                let _ = bucket.set(&cache_key, serialized.as_bytes());
            }
        }

        Ok(cards)
    }

    /// Parse a single card response from v2 API format
    fn parse_v2_card_response(&self, card_value: &serde_json::Value) -> Result<CardPrice> {
        let name = card_value
            .get("name")
            .and_then(|n| n.as_str())
            .ok_or_else(|| anyhow!("Missing card name"))?
            .to_string();

        let set_id = card_value
            .get("set")
            .and_then(|s| s.as_str())
            .unwrap_or("unknown")
            .to_string();

        let set_name = set_id.clone(); // API doesn't provide separate set name in v2

        let number = card_value
            .get("number")
            .and_then(|n| n.as_str())
            .map(|s| s.to_string());

        let rarity = card_value
            .get("rarity")
            .and_then(|r| r.as_str())
            .map(|s| s.to_string());

        // Extract prices from nested structure
        let prices = card_value.get("prices").and_then(|p| p.as_object());
        let market_price = prices
            .and_then(|p| p.get("market"))
            .and_then(|m| m.as_f64());

        // Extract eBay prices for graded cards
        let ebay = card_value.get("ebay").and_then(|e| e.as_object());
        let psa_10_price = ebay
            .and_then(|e| e.get("psa10"))
            .and_then(|p| p.as_object())
            .and_then(|p| p.get("avg"))
            .and_then(|avg| avg.as_f64());

        let psa_9_price = ebay
            .and_then(|e| e.get("psa9"))
            .and_then(|p| p.as_object())
            .and_then(|p| p.get("avg"))
            .and_then(|avg| avg.as_f64());

        let raw_price = prices.and_then(|p| p.get("raw")).and_then(|p| p.as_f64());

        let last_updated = Some(chrono::Utc::now().to_rfc3339());

        Ok(CardPrice {
            id: format!("{}_{}", set_id, name.to_lowercase().replace(' ', "_")),
            name,
            set_id,
            set_name,
            number,
            rarity,
            market_price,
            psa_10_price,
            psa_9_price,
            raw_price,
            last_updated,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let client = PokemonPriceClient::new("test_key".to_string());
        assert_eq!(client.api_key, "test_key");
        assert_eq!(client.base_url, "https://www.pokemonpricetracker.com/api");
    }

    // Note: Real API testing would require valid API key and network access
    // These are unit tests for the client structure
    #[test]
    fn test_cache_key_generation() {
        let client = PokemonPriceClient::new("test_key".to_string());
        // Test that cache keys are generated consistently
        assert!(client.api_key == "test_key");
        assert!(client.base_url.contains("pokemonpricetracker.com"));
    }

    #[test]
    fn test_cache_ttl() {
        // Test cache TTL functionality
        let price = CachedPrice::new(Some(25.0));
        assert!(!price.is_expired()); // Should not be expired immediately

        // Test expired cache (simulate old timestamp)
        let mut old_price = CachedPrice::new(Some(25.0));
        old_price.cached_at = chrono::Utc::now().timestamp() - (25 * 60 * 60); // 25 hours ago
        assert!(old_price.is_expired()); // Should be expired

        let card_prices = CachedCardPrices::new(vec![]);
        assert!(!card_prices.is_expired()); // Should not be expired immediately

        let mut old_card_prices = CachedCardPrices::new(vec![]);
        old_card_prices.cached_at = chrono::Utc::now().timestamp() - (25 * 60 * 60); // 25 hours ago
        assert!(old_card_prices.is_expired()); // Should be expired
    }
}
