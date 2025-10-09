//! Pokemon price resolver using PokemonPriceTracker API
//!
//! This resolver provides pricing information for Pokemon cards using the
//! parse-title endpoint from PokemonPriceTracker API.

use anyhow::{anyhow, Result};
use http::{header::AUTHORIZATION, HeaderValue};
use serde::{Deserialize, Serialize};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

use crate::traits::pricing::{AppraisalPrice, PriceResolver};
use crate::types::CardMetadata;

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
    base_url: String,
}

impl PokemonPriceResolver {
    /// Create a new Pokemon price resolver
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://www.pokemonpricetracker.com/api".to_string(),
        }
    }

    /// Query the parse-title endpoint to get card information
    async fn query_parse_title(&self, title: &str) -> Result<PokemonPriceResponse> {
        let url = format!(
            "{}/parse-title?title={}",
            self.base_url,
            urlencoding::encode(title)
        );

        let mut request = http_request_get(&url)
            .map_err(|e| anyhow!("Failed to create HTTP request for Pokemon API: {}", e))?;

        let auth_header = format!("Bearer {}", self.api_key);
        let header_value = HeaderValue::from_str(&auth_header)
            .map_err(|e| anyhow!("Invalid Pokemon API key format: {}", e))?;
        request.headers_mut().insert(AUTHORIZATION, header_value);

        let response_text = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch Pokemon price data: {}", e))?;

        let response: PokemonPriceResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Pokemon API response: {}", e))?;

        Ok(response)
    }

    /// Build a search title from card metadata
    fn build_search_title(&self, metadata: &CardMetadata) -> String {
        let mut title_parts = Vec::new();

        // Card name (primary)
        title_parts.push(metadata.card_info.name.clone());

        // Card number
        if let Some(ref number) = metadata.card_info.card_number {
            title_parts.push(format!("#{}", number));
        }

        // Set name
        if let Some(ref set_name) = metadata.card_info.set_name {
            title_parts.push(set_name.clone());
        }

        // Grade info
        if let Some(ref grade_info) = metadata.grade_info {
            title_parts.push(format!(
                "{} {}",
                grade_info.grader, grade_info.numeric_grade
            ));
        }

        // Category/Pokemon
        if let Some(ref category) = metadata.card_info.category {
            if category.to_lowercase() == "pokemon" {
                title_parts.push("Pokemon".to_string());
            }
        }

        title_parts.join(" ")
    }

    /// Extract the best price from card data based on grade
    fn extract_best_price(&self, data: &PokemonCardData, metadata: &CardMetadata) -> Option<f64> {
        let market_price = data
            .prices
            .as_ref()
            .and_then(|p| p.market.as_ref())
            .and_then(|m| m.average);

        if let Some(ref grade_info) = metadata.grade_info {
            // For graded cards, try to get the specific grade price
            if let Some(graded_prices) = data.prices.as_ref().and_then(|p| p.graded.as_ref()) {
                let normalized_grade = normalize_grade_value(&grade_info.numeric_grade);
                let price = match grade_info.grader.to_uppercase().as_str() {
                    "PSA" => match normalized_grade.as_str() {
                        "10" => graded_prices.psa10.as_ref().and_then(|p| p.average),
                        "9" => graded_prices.psa9.as_ref().and_then(|p| p.average),
                        _ => None,
                    },
                    "BGS" => match normalized_grade.as_str() {
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

impl PriceResolver for PokemonPriceResolver {
    fn name(&self) -> &str {
        "PokemonPriceTracker"
    }

    fn can_resolve(&self, metadata: &CardMetadata) -> bool {
        // Can resolve if it's a Pokemon card
        metadata
            .card_info
            .category
            .as_ref()
            .is_some_and(|cat| normalize_category(cat) == "pokemon")
    }

    fn get_price(&self, metadata: &CardMetadata) -> Result<Option<AppraisalPrice>> {
        // Build search title from card metadata
        let search_title = self.build_search_title(metadata);

        // Query the API
        let response = wstd::runtime::block_on(self.query_parse_title(&search_title))?;

        if !response.success {
            return Ok(None);
        }

        let card_data = response
            .data
            .ok_or_else(|| anyhow!("No card data in response"))?;

        // Extract the best price
        let price = self.extract_best_price(&card_data, metadata);

        if let Some(price_value) = price {
            return Ok(Some(AppraisalPrice {
                value: price_value,
                currency: "USD".to_string(),
                source: self.name().to_string(),
                context: Some(serde_json::to_value(card_data)?),
            }));
        }

        Ok(None)
    }
}

fn normalize_category(value: &str) -> String {
    value.to_lowercase().replace('é', "e")
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
    use std::collections::HashMap;

    use super::*;
    use crate::types::{CardGrade, CardInfo, ProviderType};

    // Default implementation for test cases
    impl Default for CardInfo {
        fn default() -> Self {
            Self {
                name: "Test Card".to_string(),
                card_number: None,
                set_name: None,
                year: None,
                category: None,
                language: None,
                images: Vec::new(),
                external_urls: Vec::new(),
            }
        }
    }

    #[test]
    fn test_pokemon_price_resolver_creation() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());
        assert_eq!(resolver.name(), "PokemonPriceTracker");
        assert_eq!(resolver.api_key, "test_key");
    }

    #[test]
    fn test_can_resolve_pokemon_cards() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        let pokemon_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Charizard".to_string(),
                category: Some("Pokemon".to_string()),
                ..Default::default()
            },
            grade_info: None,
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        assert!(resolver.can_resolve(&pokemon_metadata));

        let non_pokemon_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Magic Card".to_string(),
                category: Some("Magic".to_string()),
                ..Default::default()
            },
            grade_info: None,
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        assert!(!resolver.can_resolve(&non_pokemon_metadata));
    }

    #[test]
    fn test_can_resolve_pokemon_cards_with_accent() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        let pokemon_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Mew".to_string(),
                category: Some("Pokémon".to_string()),
                ..Default::default()
            },
            grade_info: None,
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        assert!(resolver.can_resolve(&pokemon_metadata));
    }

    #[test]
    fn test_build_search_title() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        let metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo {
                name: "Charizard".to_string(),
                card_number: Some("4".to_string()),
                set_name: Some("Base Set".to_string()),
                category: Some("Pokemon".to_string()),
                ..Default::default()
            },
            grade_info: Some(CardGrade {
                grader: "PSA".to_string(),
                numeric_grade: "10".to_string(),
                grade_qualifier: Some("GEM MINT".to_string()),
                serial: None,
                integrity_proof: None,
            }),
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        let title = resolver.build_search_title(&metadata);
        assert!(title.contains("Charizard"));
        assert!(title.contains("#4"));
        assert!(title.contains("Base Set"));
        assert!(title.contains("PSA 10"));
        assert!(title.contains("Pokemon"));
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

        let psa10_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo::default(),
            grade_info: Some(CardGrade {
                grader: "PSA".to_string(),
                numeric_grade: "10".to_string(),
                grade_qualifier: None,
                serial: None,
                integrity_proof: None,
            }),
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        let price = resolver.extract_best_price(&card_data, &psa10_metadata);
        assert_eq!(price, Some(5000.0));

        // Test PSA 9 extraction
        let psa9_metadata = CardMetadata {
            provider: ProviderType::Courtyard,
            card_info: CardInfo::default(),
            grade_info: Some(CardGrade {
                grader: "PSA".to_string(),
                numeric_grade: "9".to_string(),
                grade_qualifier: None,
                serial: None,
                integrity_proof: None,
            }),
            attributes: HashMap::new(),
            provider_data: serde_json::json!({}),
        };

        let price = resolver.extract_best_price(&card_data, &psa9_metadata);
        assert_eq!(price, Some(1000.0));
    }

    #[test]
    fn test_normalize_grade_value() {
        assert_eq!(normalize_grade_value("9.0"), "9");
        assert_eq!(normalize_grade_value("10"), "10");
        assert_eq!(normalize_grade_value(" 9.5 "), "9.5");
    }
}
