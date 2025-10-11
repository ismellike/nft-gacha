//! Pokemon price resolver using PokemonPriceTracker API
//!
//! This resolver provides pricing information for Pokemon cards using the
//! parse-title endpoint from PokemonPriceTracker API.

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use http::Request;
use serde::{Deserialize, Serialize};
use serde_json;
use std::time::Duration;
use wstd::{
    http::{body::BoundedBody, Client, IntoBody},
    io::AsyncRead,
};

use crate::traits::pricing::{AppraisalPrice, PriceResolver, ResolverQuote};

// ============================================================================
// Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonPriceResponse {
    pub success: bool,
    pub data: Option<PokemonCardData>,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonCardData {
    pub id: String,
    pub name: String,
    pub set: PokemonSet,
    pub number: Option<String>,
    pub rarity: Option<String>,
    pub prices: Option<CardPrices>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonSet {
    pub id: String,
    pub name: String,
    pub series: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CardPrices {
    pub market: Option<MarketPrice>,
    pub raw: Option<RawPrice>,
    pub graded: Option<GradedPrices>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarketPrice {
    pub average: Option<f64>,
    pub low: Option<f64>,
    pub high: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RawPrice {
    pub average: Option<f64>,
    pub low: Option<f64>,
    pub high: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GradedPrices {
    pub psa10: Option<GradePrice>,
    pub psa9: Option<GradePrice>,
    pub bgs10: Option<GradePrice>,
    pub bgs95: Option<GradePrice>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GradePrice {
    pub average: Option<f64>,
    pub low: Option<f64>,
    pub high: Option<f64>,
}

// ============================================================================
// Pokemon Price Resolver
// ============================================================================

/// Price resolver for Pokemon cards using PokemonPriceTracker API
pub struct PokemonPriceResolver {
    api_key: String,
}

const POKEMON_PRICE_TRACKER_BASE_URL: &str = "https://www.pokemonpricetracker.com/api/v2";

impl PokemonPriceResolver {
    /// Create a new Pokemon price resolver
    pub fn new(api_key: String) -> Self {
        Self { api_key }
    }

    /// Query the parse-title endpoint to get card information using POST
    async fn query_parse_title(&self, title: &str) -> Result<PokemonPriceResponse> {
        let url = format!("{}/parse-title", POKEMON_PRICE_TRACKER_BASE_URL);

        // Create JSON body for POST request
        let body_str = serde_json::json!({
            "title": title
        })
        .to_string();

        // Helper to create POST request with JSON body and auth header
        let post_request = |url: &str, json_body: &str| -> Result<Request<BoundedBody<Vec<u8>>>> {
            let body_bytes = json_body.as_bytes().to_vec();

            Request::post(url)
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", self.api_key))
                .body(body_bytes.into_body())
                .map_err(|e| anyhow!("Failed to create HTTP request: {}", e))
        };

        // Create the request
        let request = post_request(&url, &body_str)?;

        // Send the request and get response
        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Failed to send HTTP request: {}", e))?;

        // Check status code
        let status = response.status();
        if status != 200 {
            return Err(anyhow!("HTTP request failed with status: {}", status));
        }

        // Read the response body
        let response_body = response.body_mut();
        let mut body_buf = Vec::new();
        response_body
            .read_to_end(&mut body_buf)
            .await
            .map_err(|e| anyhow!("Failed to read response body: {}", e))?;

        let response_text = String::from_utf8(body_buf)
            .map_err(|e| anyhow!("Failed to decode response body: {}", e))?;

        // Parse JSON response
        let response: PokemonPriceResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Pokemon API response: {}", e))?;

        Ok(response)
    }

    /// Extract grade information from title string
    fn extract_grade_from_title(&self, title: &str) -> Option<(String, String)> {
        // Look for patterns like "PSA 10", "BGS 9.5", etc.
        let title_upper = title.to_ascii_uppercase();

        fn extract(title: &str, grader: &str) -> Option<String> {
            let idx = title.find(grader)?;
            let mut remainder = &title[idx + grader.len()..];
            remainder = remainder.trim_start_matches(|c: char| {
                c.is_whitespace() || matches!(c, ':' | '-' | '(' | '[')
            });

            let grade: String = remainder
                .chars()
                .take_while(|c| c.is_ascii_digit() || *c == '.' || *c == '/')
                .collect();

            if grade.is_empty() {
                None
            } else {
                Some(normalize_grade_value(&grade))
            }
        }

        if let Some(grade) = extract(&title_upper, "PSA") {
            return Some(("PSA".to_string(), grade));
        }

        if let Some(grade) = extract(&title_upper, "BGS") {
            return Some(("BGS".to_string(), grade));
        }

        None
    }

    /// Extract the best price from card data based on grade info in title
    fn extract_best_price(&self, data: &PokemonCardData, title: &str) -> Option<f64> {
        let market_price = data
            .prices
            .as_ref()
            .and_then(|p| p.market.as_ref())
            .and_then(|m| m.average);

        // Try to extract grade from title
        if let Some((grader, grade)) = self.extract_grade_from_title(title) {
            // For graded cards, try to get the specific grade price
            if let Some(graded_prices) = data.prices.as_ref().and_then(|p| p.graded.as_ref()) {
                let price = match grader.as_str() {
                    "PSA" => match grade.as_str() {
                        "10" => graded_prices.psa10.as_ref().and_then(|p| p.average),
                        "9" => graded_prices.psa9.as_ref().and_then(|p| p.average),
                        _ => None,
                    },
                    "BGS" => match grade.as_str() {
                        "10" => graded_prices.bgs10.as_ref().and_then(|p| p.average),
                        "9.5" => graded_prices.bgs95.as_ref().and_then(|p| p.average),
                        _ => None,
                    },
                    _ => None,
                };

                if let Some(value) = price {
                    return Some(value);
                }
            }
        }

        // Fallback to market price (average) when a matching grade price isn't available
        market_price
    }
}

#[async_trait(?Send)]
impl PriceResolver for PokemonPriceResolver {
    fn name(&self) -> &str {
        "PokemonPriceTracker"
    }

    async fn get_price(&self, title: &str) -> Result<Option<ResolverQuote>> {
        // Query the API
        let response = self.query_parse_title(title).await?;

        if !response.success {
            return Ok(None);
        }

        let card_data = response
            .data
            .ok_or_else(|| anyhow!("No card data in response"))?;

        // Extract the best price using the original title
        let price = self.extract_best_price(&card_data, title);

        if let Some(price_value) = price {
            return Ok(Some(ResolverQuote {
                price: AppraisalPrice {
                    value: price_value,
                    currency: "USD".to_string(),
                    source: self.name().to_string(),
                    context: Some(serde_json::to_value(card_data)?),
                },
                ttl: Duration::from_secs(86_400),
            }));
        }

        Ok(None)
    }
}

fn normalize_grade_value(value: &str) -> String {
    let trimmed = value.trim();
    if let Some(stripped) = trimmed.strip_suffix(".0") {
        stripped.to_string()
    } else {
        trimmed.to_string()
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pokemon_price_resolver_creation() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());
        assert_eq!(resolver.name(), "PokemonPriceTracker");
        assert_eq!(resolver.api_key, "test_key");
    }

    #[test]
    fn test_extract_grade_from_title() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // PSA grades
        assert_eq!(
            resolver.extract_grade_from_title("2024 Pokémon Charizard (PSA 10)"),
            Some(("PSA".to_string(), "10".to_string()))
        );
        assert_eq!(
            resolver.extract_grade_from_title("Charizard PSA 9 Mint"),
            Some(("PSA".to_string(), "9".to_string()))
        );
        assert_eq!(
            resolver.extract_grade_from_title("Graded Pokémon | PSA 10 GEM MINT Charizard"),
            Some(("PSA".to_string(), "10".to_string()))
        );
        assert_eq!(
            resolver.extract_grade_from_title("Charizard PSA-8 NM-MT"),
            Some(("PSA".to_string(), "8".to_string()))
        );

        // BGS grades
        assert_eq!(
            resolver.extract_grade_from_title("2024 Pokémon Charizard (BGS 9.5)"),
            Some(("BGS".to_string(), "9.5".to_string()))
        );
        assert_eq!(
            resolver.extract_grade_from_title("Charizard BGS 10"),
            Some(("BGS".to_string(), "10".to_string()))
        );
        assert_eq!(
            resolver.extract_grade_from_title("BGS-9.5 Charizard (Black Label)"),
            Some(("BGS".to_string(), "9.5".to_string()))
        );

        // No grade
        assert_eq!(
            resolver.extract_grade_from_title("2024 Pokémon Charizard"),
            None
        );
        assert_eq!(resolver.extract_grade_from_title("Random Card Title"), None);
    }

    #[test]
    fn test_extract_best_price() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test PSA 10 extraction
        let card_data = PokemonCardData {
            id: "test".to_string(),
            name: "Charizard".to_string(),
            set: PokemonSet {
                id: "base1".to_string(),
                name: "Base Set".to_string(),
                series: Some("Base".to_string()),
            },
            number: Some("4".to_string()),
            rarity: Some("Rare Holo".to_string()),
            prices: Some(CardPrices {
                market: Some(MarketPrice {
                    average: Some(100.0),
                    low: Some(80.0),
                    high: Some(120.0),
                }),
                raw: None,
                graded: Some(GradedPrices {
                    psa10: Some(GradePrice {
                        average: Some(5000.0),
                        low: Some(4000.0),
                        high: Some(6000.0),
                    }),
                    psa9: Some(GradePrice {
                        average: Some(1000.0),
                        low: Some(800.0),
                        high: Some(1200.0),
                    }),
                    bgs10: None,
                    bgs95: None,
                }),
            }),
        };

        let price = resolver.extract_best_price(&card_data, "2024 Pokémon Charizard (PSA 10)");
        assert_eq!(price, Some(5000.0));

        // Test PSA 9 extraction
        let price = resolver.extract_best_price(&card_data, "2024 Pokémon Charizard (PSA 9)");
        assert_eq!(price, Some(1000.0));

        // Test fallback to market price when no grade matches
        let price = resolver.extract_best_price(&card_data, "2024 Pokémon Charizard (BGS 10)");
        assert_eq!(price, Some(100.0)); // Market price fallback
    }

    #[test]
    fn test_normalize_grade_value() {
        assert_eq!(normalize_grade_value("9.0"), "9");
        assert_eq!(normalize_grade_value("10"), "10");
        assert_eq!(normalize_grade_value(" 9.5 "), "9.5");
    }
}
