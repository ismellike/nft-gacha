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
#[serde(rename_all = "camelCase")]
pub struct PokemonPriceData {
    pub original_title: String,
    pub sanitized_title: String,
    pub parsed: ParsedInfo,
    pub matches: Vec<CardMatch>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedInfo {
    pub confidence: f64,
    pub year: Option<u32>,
    pub psa_grade: Option<u8>,
    pub cgc_grade: Option<u8>,
    pub bgs_grade: Option<f32>,
    pub edition: Option<String>,
    pub set_name: Option<String>,
    pub card_name: Option<String>,
    pub card_number: Option<String>,
    pub variant: Option<String>,
    pub field_confidence: Option<FieldConfidence>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldConfidence {
    pub year: Option<f64>,
    pub grade: Option<f64>,
    pub edition: Option<f64>,
    pub set_name: Option<f64>,
    pub card_name: Option<f64>,
    pub card_number: Option<f64>,
    pub variant: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
pub struct MatchPrices {
    pub market: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseMetadata {
    pub parse_time: String,
    pub processing_time_ms: u64,
    pub confidence: f64,
    pub api_calls_consumed: u32,
    pub parsing_method: String,
}

#[derive(Debug, Clone)]
pub struct CardMatchInfo {
    pub card_number: Option<String>,
    pub grade: Option<String>,
    #[allow(dead_code)]
    pub set_name: Option<String>,
    #[allow(dead_code)]
    pub year: Option<String>,
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

    /// Extract the best price using provided card information instead of parsing from title
    fn extract_best_price_with_info(
        &self,
        data: &PokemonPriceData,
        card_info: Option<&CardMatchInfo>,
    ) -> Option<f64> {
        // Sort matches by multiple criteria:
        // 1. Match score (descending)
        // 2. Card number match (exact match gets priority)
        // 3. Grade match (if grade information is available)
        // 4. Rarity preference (Holo > Rare > Common)
        let mut sorted_matches = data.matches.clone();
        sorted_matches.sort_by(|a, b| {
            // Primary sort: match score (descending)
            match b.match_score.partial_cmp(&a.match_score) {
                Some(std::cmp::Ordering::Equal) => {
                    // Secondary sort: card number match
                    if let Some(info) = card_info {
                        if let (Some(title_num), a_num, b_num) =
                            (&info.card_number, &a.card_number, &b.card_number)
                        {
                            let a_matches = a_num == title_num;
                            let b_matches = b_num == title_num;
                            match (a_matches, b_matches) {
                                (true, false) => return std::cmp::Ordering::Less, // a comes first
                                (false, true) => return std::cmp::Ordering::Greater, // b comes first
                                _ => {} // Continue to next sort criteria
                            }
                        }

                        // Tertiary sort: grade match (if we have grade info)
                        if let Some(title_grade) = &info.grade {
                            let a_grade_matches = self.grade_matches_rarity(&a.rarity, title_grade);
                            let b_grade_matches = self.grade_matches_rarity(&b.rarity, title_grade);
                            match (a_grade_matches, b_grade_matches) {
                                (true, false) => return std::cmp::Ordering::Less, // a comes first
                                (false, true) => return std::cmp::Ordering::Greater, // b comes first
                                _ => {} // Continue to rarity comparison
                            }
                        }
                    }

                    // Final sort: rarity preference
                    self.compare_rarity(a, b)
                }
                Some(order) => order,
                None => std::cmp::Ordering::Equal,
            }
        });

        // First, try to find a high-confidence match with good score
        if let Some(best_match) = sorted_matches.first() {
            // Only accept matches with good confidence scores
            if best_match.match_score >= 0.5 && data.parsed.confidence >= 0.7 {
                return best_match.prices.market;
            }
        }

        // Smart fallback: prioritize exact card number matches even with lower scores
        if let Some(info) = card_info {
            if let Some(title_num) = &info.card_number {
                if let Some(exact_match) = sorted_matches.iter().find(|m| {
                    m.card_number == *title_num && m.match_score >= 0.3 && m.prices.market.is_some()
                }) {
                    return exact_match.prices.market;
                }
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

    /// Check if a card's rarity matches the expected grade
    fn grade_matches_rarity(&self, rarity: &Option<String>, grade: &str) -> bool {
        let grade_upper = grade.to_uppercase();
        let rarity_upper = rarity
            .as_ref()
            .map(|r| r.to_uppercase())
            .unwrap_or_default();

        // PSA/BGS graded cards typically match rare/holo variants
        if grade_upper.contains("PSA") || grade_upper.contains("BGS") || grade_upper.contains("CGC")
        {
            rarity_upper.contains("RARE")
                || rarity_upper.contains("HOLO")
                || rarity_upper.is_empty()
        } else {
            true // No specific grade, any rarity is acceptable
        }
    }

    /// Compare rarity between two matches (Holo > Rare > Common)
    fn compare_rarity(&self, a: &CardMatch, b: &CardMatch) -> std::cmp::Ordering {
        let a_score = self.rarity_score(&a.rarity);
        let b_score = self.rarity_score(&b.rarity);
        b_score.cmp(&a_score) // Higher score comes first
    }

    /// Assign numeric score to rarity for comparison
    fn rarity_score(&self, rarity: &Option<String>) -> u8 {
        match rarity.as_deref() {
            Some(r) if r.to_uppercase().contains("HOLO") => 3,
            Some(r) if r.to_uppercase().contains("RARE") => 2,
            Some(r) if r.to_uppercase().contains("UNCOMMON") => 1,
            Some(r) if r.to_uppercase().contains("COMMON") => 0,
            _ => 1, // Default to Rare-equivalent for unknown rarities
        }
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
        let (title, card_info) = match args {
            ResolverArgs::PokemonCardInfo {
                title,
                card_number,
                grade,
                set_name,
                year,
            } => {
                let card_info = CardMatchInfo {
                    card_number: card_number.clone(),
                    grade: grade.clone(),
                    set_name: set_name.clone(),
                    year: year.clone(),
                };
                (title, Some(card_info))
            }
        };

        // Query the API with strict mode enabled for higher confidence matches
        let response = self.query_parse_title(title).await?;

        // Extract the best price from the matches array using the provided card info
        let price = self.extract_best_price_with_info(&response.data, card_info.as_ref());

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
    fn test_extract_best_price_with_provided_card_info() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test case: Use provided card info instead of parsing from title
        let price_data = PokemonPriceData {
            original_title: "1999 Fossil Articuno".to_string(),
            sanitized_title: "1999 Fossil Articuno".to_string(),
            parsed: ParsedInfo {
                confidence: 0.89,
                year: Some(1999),
                psa_grade: None,
                cgc_grade: None,
                bgs_grade: None,
                edition: None,
                set_name: Some("Fossil".to_string()),
                card_name: Some("Articuno".to_string()),
                card_number: None,
                variant: None,
                field_confidence: None,
            },
            matches: vec![
                CardMatch {
                    tcg_player_id: "44425".to_string(),
                    name: "Articuno (17)".to_string(),
                    set_name: "Fossil".to_string(),
                    set_id: "fossil".to_string(),
                    card_number: "17".to_string(), // Correct card number!
                    rarity: Some("Rare".to_string()),
                    artist: None,
                    card_type: Some("Water".to_string()),
                    match_score: 0.7,
                    match_reasons: vec![
                        "Name matches \"Articuno\"".to_string(),
                        "Set matches \"Fossil\"".to_string(),
                    ],
                    prices: MatchPrices { market: Some(9.15) },
                },
                CardMatch {
                    tcg_player_id: "106518".to_string(),
                    name: "Articuno (2)".to_string(),
                    set_name: "Fossil".to_string(),
                    set_id: "fossil".to_string(),
                    card_number: "02".to_string(), // Wrong card number
                    rarity: Some("Holo Rare".to_string()),
                    artist: None,
                    card_type: Some("Water".to_string()),
                    match_score: 0.7, // Same score as above
                    match_reasons: vec![
                        "Name matches \"Articuno\"".to_string(),
                        "Set matches \"Fossil\"".to_string(),
                    ],
                    prices: MatchPrices {
                        market: Some(120.91),
                    },
                },
            ],
        };

        // Provide card info that specifies card #17 and PSA 8 grade
        let card_info = CardMatchInfo {
            card_number: Some("17".to_string()),
            grade: Some("PSA 8".to_string()),
            set_name: Some("Fossil".to_string()),
            year: Some("1999".to_string()),
        };

        let price = resolver.extract_best_price_with_info(&price_data, Some(&card_info));
        assert_eq!(price, Some(9.15)); // Should pick the correct card number match even though it's cheaper
    }

    #[test]
    fn test_grade_matches_rarity() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // PSA grade should match with rare/holo cards
        assert!(resolver.grade_matches_rarity(&Some("Rare".to_string()), "PSA 8"));
        assert!(resolver.grade_matches_rarity(&Some("Holo Rare".to_string()), "PSA 10"));
        assert!(resolver.grade_matches_rarity(&None, "PSA 8")); // No rarity, should still match

        // Non-graded should match anything
        assert!(resolver.grade_matches_rarity(&Some("Common".to_string()), "Base Set"));
        assert!(resolver.grade_matches_rarity(&Some("Rare".to_string()), ""));
    }
}
