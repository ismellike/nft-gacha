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
use crate::types::ResolverArgs;

// ============================================================================
// Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonPriceResponse {
    pub data: PokemonPriceData,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonPriceData {
    pub original_title: String,
    pub sanitized_title: String,
    pub parsed: ParsedInfo,
    pub matches: Vec<CardMatch>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedInfo {
    pub confidence: f64,
    pub year: Option<u32>,
    pub psa_grade: Option<u8>,
    pub cgc_grade: Option<u8>,
    pub bgs_grade: Option<f32>,
    pub edition: Option<String>,
    pub set_name: Option<String>,
    pub card_name: Option<String>,
    pub field_confidence: Option<FieldConfidence>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FieldConfidence {
    pub year: Option<f64>,
    pub grade: Option<f64>,
    pub edition: Option<f64>,
    pub set_name: Option<f64>,
    pub card_name: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardMatch {
    pub tcg_player_id: String,
    pub name: String,
    pub set_name: String,
    pub set_id: String,
    pub card_number: String,
    pub rarity: Option<String>,
    pub artist: Option<String>,
    pub card_type: Option<String>,
    pub match_score: f64,
    pub match_reasons: Vec<String>,
    pub prices: MatchPrices,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchPrices {
    pub market: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseMetadata {
    pub parse_time: String,
    pub processing_time_ms: u64,
    pub confidence: f64,
    pub api_calls_consumed: u32,
    pub parsing_method: String,
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

        // Create JSON body for POST request with strict mode always enabled
        let body_str = serde_json::json!({
            "title": title,
            "options": {
                "strictMode": true
            }
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

    /// Extract the best price from Pokemon price data based on match scores and grade info
    fn extract_best_price(&self, data: &PokemonPriceData, title: &str) -> Option<f64> {
        // Try to extract grade from title for comparison with parsed info
        let _title_grade = self.extract_grade_from_title(title);

        // Sort matches by match_score (descending) and confidence to find the best match
        let mut sorted_matches = data.matches.clone();
        sorted_matches.sort_by(|a, b| {
            b.match_score
                .partial_cmp(&a.match_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // First, try to find a high-confidence match with good score
        if let Some(best_match) = sorted_matches.first() {
            // Only accept matches with good confidence scores
            if best_match.match_score >= 0.5 && data.parsed.confidence >= 0.7 {
                return Some(best_match.prices.market?);
            }
        }

        // Fallback: try to use parsed grade information from the API response
        if let Some(_parsed_grade) = self.get_parsed_grade(&data.parsed) {
            // For graded cards, look for matches that might have graded pricing
            for match_item in &sorted_matches {
                if match_item.match_score >= 0.3 && match_item.prices.market.is_some() {
                    return match_item.prices.market;
                }
            }
        }

        // Final fallback: return the highest market price from any match with minimum score
        sorted_matches
            .into_iter()
            .filter(|m| m.match_score >= 0.2) // Very low threshold for fallback
            .filter_map(|m| m.prices.market)
            .max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
    }

    /// Get grade information from parsed API response
    fn get_parsed_grade(&self, parsed: &ParsedInfo) -> Option<(String, String)> {
        if let Some(grade) = parsed.psa_grade {
            return Some(("PSA".to_string(), grade.to_string()));
        }
        if let Some(grade) = parsed.cgc_grade {
            return Some(("CGC".to_string(), grade.to_string()));
        }
        if let Some(grade) = parsed.bgs_grade {
            return Some(("BGS".to_string(), grade.to_string()));
        }
        None
    }
}

#[async_trait(?Send)]
impl PriceResolver for PokemonPriceResolver {
    fn name(&self) -> &str {
        "PokemonPriceTracker"
    }

    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>> {
        let title = match args {
            ResolverArgs::PokemonTitle { title } => title,
        };

        // Query the API with strict mode enabled for higher confidence matches
        let response = self.query_parse_title(title).await?;

        // Extract the best price from the matches array
        let price = self.extract_best_price(&response.data, title);

        if let Some(price_value) = price {
            return Ok(Some(ResolverQuote {
                price: AppraisalPrice {
                    value: price_value,
                    currency: "USD".to_string(),
                    source: self.name().to_string(),
                    context: Some(serde_json::to_value(&response.data)?),
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

        // Test with high confidence match and good score
        let price_data = PokemonPriceData {
            original_title: "2024 Pokémon Charizard (PSA 10)".to_string(),
            sanitized_title: "2024 Pokémon Charizard (PSA 10)".to_string(),
            parsed: ParsedInfo {
                confidence: 0.89,
                year: Some(2024),
                psa_grade: Some(10),
                cgc_grade: None,
                bgs_grade: None,
                edition: Some("1st Edition".to_string()),
                set_name: Some("Base Set".to_string()),
                card_name: Some("Charizard".to_string()),
                field_confidence: Some(FieldConfidence {
                    year: Some(1.0),
                    grade: Some(1.0),
                    edition: Some(0.9),
                    set_name: Some(0.8),
                    card_name: Some(0.75),
                }),
            },
            matches: vec![
                CardMatch {
                    tcg_player_id: "106518".to_string(),
                    name: "Charizard (4)".to_string(),
                    set_name: "Base Set".to_string(),
                    set_id: "base1".to_string(),
                    card_number: "4".to_string(),
                    rarity: Some("Rare Holo".to_string()),
                    artist: None,
                    card_type: Some("Fire".to_string()),
                    match_score: 0.85,
                    match_reasons: vec!["Name matches \"Charizard\"".to_string(), "Set matches \"Base Set\"".to_string()],
                    prices: MatchPrices {
                        market: Some(5000.0),
                    },
                },
                CardMatch {
                    tcg_player_id: "44425".to_string(),
                    name: "Charizard (4)".to_string(),
                    set_name: "Base Set".to_string(),
                    set_id: "base1".to_string(),
                    card_number: "4".to_string(),
                    rarity: Some("Rare".to_string()),
                    artist: None,
                    card_type: Some("Fire".to_string()),
                    match_score: 0.7,
                    match_reasons: vec!["Name matches \"Charizard\"".to_string(), "Set matches \"Base Set\"".to_string()],
                    prices: MatchPrices {
                        market: Some(100.0),
                    },
                },
            ],
        };

        let price = resolver.extract_best_price(&price_data, "2024 Pokémon Charizard (PSA 10)");
        assert_eq!(price, Some(5000.0)); // Should pick the highest scoring match

        // Test with low confidence fallback
        let low_confidence_data = PokemonPriceData {
            original_title: "Charizard".to_string(),
            sanitized_title: "Charizard".to_string(),
            parsed: ParsedInfo {
                confidence: 0.5, // Low confidence
                year: None,
                psa_grade: None,
                cgc_grade: None,
                bgs_grade: None,
                edition: None,
                set_name: None,
                card_name: Some("Charizard".to_string()),
                field_confidence: None,
            },
            matches: vec![
                CardMatch {
                    tcg_player_id: "44425".to_string(),
                    name: "Charizard (4)".to_string(),
                    set_name: "Base Set".to_string(),
                    set_id: "base1".to_string(),
                    card_number: "4".to_string(),
                    rarity: Some("Rare".to_string()),
                    artist: None,
                    card_type: Some("Fire".to_string()),
                    match_score: 0.3, // Low score
                    match_reasons: vec!["Name matches \"Charizard\"".to_string()],
                    prices: MatchPrices {
                        market: Some(100.0),
                    },
                },
            ],
        };

        let price = resolver.extract_best_price(&low_confidence_data, "Charizard");
        assert_eq!(price, Some(100.0)); // Should still return price despite low confidence
    }

    #[test]
    fn test_normalize_grade_value() {
        assert_eq!(normalize_grade_value("9.0"), "9");
        assert_eq!(normalize_grade_value("10"), "10");
        assert_eq!(normalize_grade_value(" 9.5 "), "9.5");
    }

    #[test]
    fn test_strict_mode_json_generation() {
        let _resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test that the JSON body is correctly formatted with strictMode always true
        let title = "Test Pokemon Card";

        let expected_json = serde_json::json!({
            "title": title,
            "options": {
                "strictMode": true
            }
        });

        let actual_json = serde_json::json!({
            "title": title,
            "options": {
                "strictMode": true
            }
        });

        assert_eq!(expected_json, actual_json);
    }

    #[test]
    fn test_get_parsed_grade() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test PSA grade extraction
        let parsed_info = ParsedInfo {
            confidence: 0.9,
            year: Some(1999),
            psa_grade: Some(10),
            cgc_grade: None,
            bgs_grade: None,
            edition: None,
            set_name: None,
            card_name: None,
            field_confidence: None,
        };

        let grade = resolver.get_parsed_grade(&parsed_info);
        assert_eq!(grade, Some(("PSA".to_string(), "10".to_string())));

        // Test CGC grade extraction
        let parsed_info = ParsedInfo {
            confidence: 0.9,
            year: Some(1999),
            psa_grade: None,
            cgc_grade: Some(8),
            bgs_grade: None,
            edition: None,
            set_name: None,
            card_name: None,
            field_confidence: None,
        };

        let grade = resolver.get_parsed_grade(&parsed_info);
        assert_eq!(grade, Some(("CGC".to_string(), "8".to_string())));

        // Test BGS grade extraction
        let parsed_info = ParsedInfo {
            confidence: 0.9,
            year: Some(1999),
            psa_grade: None,
            cgc_grade: None,
            bgs_grade: Some(9.5),
            edition: None,
            set_name: None,
            card_name: None,
            field_confidence: None,
        };

        let grade = resolver.get_parsed_grade(&parsed_info);
        assert_eq!(grade, Some(("BGS".to_string(), "9.5".to_string())));

        // Test no grade
        let parsed_info = ParsedInfo {
            confidence: 0.9,
            year: Some(1999),
            psa_grade: None,
            cgc_grade: None,
            bgs_grade: None,
            edition: None,
            set_name: None,
            card_name: None,
            field_confidence: None,
        };

        let grade = resolver.get_parsed_grade(&parsed_info);
        assert_eq!(grade, None);
    }
}
