//! Scrydex-based resolver for Pokémon trading card data.
//!
//! This resolver provides direct card lookup and price discovery from the
//! Scrydex API. It queries individual cards using the {set}-{card_number}
//! identifier format and returns pricing information.

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use http::Request;
use serde::{Deserialize, Serialize};
use std::env;
use wstd::{
    http::{Client, IntoBody},
    io::AsyncRead,
};

use crate::traits::pricing::{AppraisalPrice, PriceResolver, ResolverQuote};
use crate::types::ResolverArgs;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ScrydexCardInfo {
    pub card_number: String,
    pub grade: String,
    pub company: String,
    pub is_perfect: bool,
    pub set_id: String,
    pub variant: Option<String>,
}

impl ScrydexCardInfo {
    /// Returns the card identifier in the format "{set_id}-{card_number}"
    pub fn card_identifier(&self) -> String {
        format!("{}-{}", self.set_id.trim(), self.card_number.trim())
    }

    /// Extract variant information from Courtyard metadata attributes
    pub fn from_courtyard_metadata(
        card_number: String,
        grade: String,
        company: String,
        is_perfect: bool,
        set_id: String,
        attributes: &[serde_json::Value],
    ) -> Self {
        let variant = Self::extract_variant_from_attributes(attributes);
        Self {
            card_number,
            grade,
            company,
            is_perfect,
            set_id,
            variant,
        }
    }

    /// Construct variant string in the format expected by Scrydex
    /// e.g., ["1st Edition", "Shadowless"] → "firstEditionShadowless"
    /// e.g., ["1st Edition", "Shadowless", "Holo"] → "firstEditionShadowlessHolofoil"
    pub fn construct_variant_string(variant_parts: &[String]) -> String {
        let mut result = String::new();

        for part in variant_parts {
            let part_lower = part.to_lowercase();
            let mapped = match part_lower.as_str() {
                "1st edition" => "firstEdition",
                "shadowless" => "Shadowless",
                "unlimited" => "unlimited",
                "holo" | "holofoil" => "Holofoil",
                "reverse holo" | "reverse holofoil" => "ReverseHolofoil",
                _ => part, // Keep original if no mapping
            };
            result.push_str(mapped);
        }

        result
    }

    /// Extract variant information from Courtyard attributes array
    /// Combines variant attributes like "1st Edition" and "Shadowless" into "firstEditionShadowless"
    pub fn extract_variant_from_attributes(attributes: &[serde_json::Value]) -> Option<String> {
        let mut variant_parts = Vec::new();

        for attr in attributes {
            if let Some(obj) = attr.as_object() {
                // Check for variant attributes that don't have a trait_type
                if !obj.contains_key("trait_type") {
                    if let Some(value) = obj.get("value").and_then(|v| v.as_str()) {
                        // Common variant indicators that we want to include
                        if matches!(
                            value.to_lowercase().as_str(),
                            "1st edition"
                                | "shadowless"
                                | "unlimited"
                                | "holo"
                                | "holofoil"
                                | "reverse holofoil"
                                | "reverse holo"
                        ) {
                            variant_parts.push(value.trim().to_string());
                        }
                    }
                }
            }
        }

        if variant_parts.is_empty() {
            None
        } else {
            Some(Self::construct_variant_string(&variant_parts))
        }
    }
}

const SCRYDEX_CARDS_ENDPOINT: &str = "https://api.scrydex.com/pokemon/v1/cards";

/// Resolver that queries Scrydex for Pokemon card data.
#[derive(Debug, Clone)]
pub struct ScrydexPokemonResolver {
    api_key: String,
    team_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexCard {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub number: Option<String>,
    #[serde(default)]
    pub rarity: Option<String>,
    #[serde(default)]
    pub expansion: Option<ScrydexCardExpansion>,
    #[serde(default)]
    pub variants: Vec<ScrydexCardVariant>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexCardExpansion {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexCardVariant {
    pub name: String,
    pub prices: Vec<ScrydexGradedPrice>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexGradedPrice {
    pub grade: String,
    pub company: String,
    pub is_perfect: bool,
    #[serde(default)]
    pub is_signed: bool,
    #[serde(default)]
    pub is_error: bool,
    pub r#type: String,
    pub low: f64,
    pub mid: f64,
    pub high: f64,
    pub market: f64,
    pub currency: String,
    #[serde(default)]
    pub trends: Option<ScrydexPriceTrends>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexPriceTrends {
    #[serde(rename = "days_1")]
    pub days_1: Option<ScrydexPriceChange>,
    #[serde(rename = "days_7")]
    pub days_7: Option<ScrydexPriceChange>,
    #[serde(rename = "days_14")]
    pub days_14: Option<ScrydexPriceChange>,
    #[serde(rename = "days_30")]
    pub days_30: Option<ScrydexPriceChange>,
    #[serde(rename = "days_90")]
    pub days_90: Option<ScrydexPriceChange>,
    #[serde(rename = "days_180")]
    pub days_180: Option<ScrydexPriceChange>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexPriceChange {
    pub price_change: f64,
    pub percent_change: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrydexCardResponse {
    pub data: ScrydexCard,
}

impl ScrydexPokemonResolver {
    /// Create a new Scrydex resolver.
    pub fn new<S: Into<String>>(api_key: S, team_id: Option<String>) -> Self {
        Self {
            api_key: api_key.into(),
            team_id,
        }
    }

    /// Construct a resolver using environment configuration.
    pub fn from_env() -> Result<Self> {
        let scrydex_api_key = env::var("WAVS_ENV_SCRYDEX_API_KEY").map_err(|_| {
            anyhow!(
                "Scrydex API key environment variable not set. Provide WAVS_ENV_SCRYDEX_API_KEY"
            )
        })?;

        let scrydex_team_id = env::var("WAVS_ENV_SCRYDEX_TEAM_ID")
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());

        Ok(Self::new(scrydex_api_key, scrydex_team_id))
    }

    fn find_matching_price<'a>(
        card: &'a ScrydexCard,
        grade: &str,
        company: &str,
        is_perfect: bool,
        variant: &Option<String>,
    ) -> Option<&'a ScrydexGradedPrice> {
        // If no variant specified, only proceed if there's exactly 1 variant
        let allowed_variants: Vec<&ScrydexCardVariant> = match variant {
            Some(requested_variant) => {
                // Find the specific variant that matches
                let requested_normalized = requested_variant.to_lowercase().replace(" ", "");
                card.variants
                    .iter()
                    .filter(|v| {
                        let card_variant_normalized = v.name.to_lowercase().replace(" ", "");
                        requested_normalized == card_variant_normalized
                    })
                    .collect()
            }
            None => {
                // Only allow if there's exactly 1 variant
                if card.variants.len() == 1 {
                    vec![&card.variants[0]]
                } else {
                    return None; // Multiple variants but none specified
                }
            }
        };

        // Search for matching price in allowed variants
        for card_variant in allowed_variants {
            for price in &card_variant.prices {
                let grade_matches = price.grade == grade;
                let company_matches = price.company.to_uppercase() == company.to_uppercase();
                let perfect_matches = price.is_perfect == is_perfect;

                if grade_matches && company_matches && perfect_matches {
                    return Some(price);
                }
            }
        }
        None
    }

    async fn get_card(&self, card_identifier: &str) -> Result<ScrydexCardResponse> {
        let url = format!(
            "{}/{}?include=prices",
            SCRYDEX_CARDS_ENDPOINT, card_identifier
        );

        let mut builder = Request::get(&url);
        builder = builder.header("X-Api-Key", self.api_key.as_str());
        if let Some(team_id) = &self.team_id {
            builder = builder.header("X-Team-ID", team_id.as_str());
        }

        let request = builder
            .body(Vec::new().into_body())
            .map_err(|e| anyhow!("Failed to construct Scrydex card request: {}", e))?;

        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Scrydex card request failed: {}", e))?;

        let status = response.status();
        if !status.is_success() {
            return Err(anyhow!(
                "Scrydex card request returned status {} for card {}",
                status,
                card_identifier
            ));
        }

        let mut body = Vec::new();
        response
            .body_mut()
            .read_to_end(&mut body)
            .await
            .map_err(|e| anyhow!("Failed to read Scrydex card response: {}", e))?;

        let response_text = String::from_utf8(body)
            .map_err(|e| anyhow!("Scrydex card response was not valid UTF-8: {}", e))?;

        let parsed: ScrydexCardResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Scrydex card response: {}", e))?;

        Ok(parsed)
    }
}

#[async_trait(?Send)]
impl PriceResolver for ScrydexPokemonResolver {
    fn name(&self) -> &str {
        "Scrydex"
    }

    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>> {
        let ResolverArgs::ScrydexCardInfo(info) = args;

        let card_identifier = info.card_identifier();

        let card_response = self.get_card(&card_identifier).await?;

        let matching_price = Self::find_matching_price(
            &card_response.data,
            &info.grade,
            &info.company,
            info.is_perfect,
            &info.variant,
        );

        if let Some(price) = matching_price {
            let quote = ResolverQuote {
                price: AppraisalPrice {
                    value: price.market,
                    currency: price.currency.clone(),
                    source: "Scrydex".to_string(),
                    context: Some(serde_json::json!({
                        "card_id": card_response.data.id,
                        "card_name": card_response.data.name,
                        "card_number": card_response.data.number,
                        "rarity": card_response.data.rarity,
                        "expansion": card_response.data.expansion,
                        "grade": info.grade,
                        "company": info.company,
                        "is_perfect": info.is_perfect,
                        "variant": info.variant,
                        "pricing_metrics": {
                            "low": price.low,
                            "mid": price.mid,
                            "high": price.high,
                            "market": price.market,
                        },
                        "trends": price.trends,
                    })),
                },
                ttl: Duration::from_secs(86400), // 24 hours cache TTL
            };
            Ok(Some(quote))
        } else {
            Err(anyhow!(
                "No price found for card {} with grade {} from company {} (perfect: {})",
                card_identifier,
                info.grade,
                info.company,
                info.is_perfect
            ))
        }
    }
}

// ==========================================================================================
// Tests
// ==========================================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn card_identifier_formats_correctly() {
        let info = ScrydexCardInfo {
            card_number: "1".to_string(),
            grade: "10".to_string(),
            company: "PSA".to_string(),
            is_perfect: false,
            set_id: "sv5a".to_string(),
            variant: None,
        };
        assert_eq!(info.card_identifier(), "sv5a-1");

        let info_with_spaces = ScrydexCardInfo {
            card_number: " 1 ".to_string(),
            grade: "10".to_string(),
            company: "PSA".to_string(),
            is_perfect: false,
            set_id: " sv5a ".to_string(),
            variant: Some("firstEditionShadowless".to_string()),
        };
        assert_eq!(info_with_spaces.card_identifier(), "sv5a-1");
    }

    #[test]
    fn variant_extraction_from_attributes() {
        // Test variant extraction from Courtyard metadata attributes
        let attributes = vec![
            serde_json::json!({"trait_type": "Grader", "value": "PSA"}),
            serde_json::json!({"trait_type": "Grade", "value": "9"}),
            serde_json::json!({"value": "1st Edition"}),
            serde_json::json!({"value": "Shadowless"}),
            serde_json::json!({"trait_type": "Set", "value": "Base Set"}),
        ];

        let info = ScrydexCardInfo::from_courtyard_metadata(
            "53".to_string(),
            "9".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            &attributes,
        );

        assert_eq!(info.variant, Some("firstEditionShadowless".to_string()));
    }

    #[test]
    fn no_variant_extraction_when_none_present() {
        // Test that no variant is extracted when no variant attributes exist
        let attributes = vec![
            serde_json::json!({"trait_type": "Grader", "value": "PSA"}),
            serde_json::json!({"trait_type": "Grade", "value": "9"}),
            serde_json::json!({"trait_type": "Set", "value": "Base Set"}),
        ];

        let info = ScrydexCardInfo::from_courtyard_metadata(
            "53".to_string(),
            "9".to_string(),
            "PSA".to_string(),
            false,
            "base1".to_string(),
            &attributes,
        );

        assert_eq!(info.variant, None);
    }

    #[test]
    fn test_find_matching_price_no_variant_single_variant_allowed() {
        let card = ScrydexCard {
            id: "test".to_string(),
            name: "Test Card".to_string(),
            number: Some("1".to_string()),
            rarity: Some("Rare".to_string()),
            expansion: Some(ScrydexCardExpansion {
                id: "test-set".to_string(),
                name: "Test Set".to_string(),
                code: Some("TST".to_string()),
            }),
            variants: vec![ScrydexCardVariant {
                name: "Normal".to_string(),
                prices: vec![ScrydexGradedPrice {
                    grade: "9".to_string(),
                    company: "PSA".to_string(),
                    is_perfect: false,
                    is_signed: false,
                    is_error: false,
                    r#type: "graded".to_string(),
                    low: 100.0,
                    mid: 120.0,
                    high: 150.0,
                    market: 110.0,
                    currency: "USD".to_string(),
                    trends: None,
                }],
            }],
        };

        let price = ScrydexPokemonResolver::find_matching_price(&card, "9", "PSA", false, &None);

        assert!(price.is_some());
        assert_eq!(price.unwrap().market, 110.0);
    }

    #[test]
    fn test_find_matching_price_no_variant_multiple_variants_rejected() {
        let card = ScrydexCard {
            id: "test".to_string(),
            name: "Test Card".to_string(),
            number: Some("1".to_string()),
            rarity: Some("Rare".to_string()),
            expansion: Some(ScrydexCardExpansion {
                id: "test-set".to_string(),
                name: "Test Set".to_string(),
                code: Some("TST".to_string()),
            }),
            variants: vec![
                ScrydexCardVariant {
                    name: "Normal".to_string(),
                    prices: vec![ScrydexGradedPrice {
                        grade: "9".to_string(),
                        company: "PSA".to_string(),
                        is_perfect: false,
                        is_signed: false,
                        is_error: false,
                        r#type: "graded".to_string(),
                        low: 100.0,
                        mid: 120.0,
                        high: 150.0,
                        market: 110.0,
                        currency: "USD".to_string(),
                        trends: None,
                    }],
                },
                ScrydexCardVariant {
                    name: "Holofoil".to_string(),
                    prices: vec![ScrydexGradedPrice {
                        grade: "9".to_string(),
                        company: "PSA".to_string(),
                        is_perfect: false,
                        is_signed: false,
                        is_error: false,
                        r#type: "graded".to_string(),
                        low: 200.0,
                        mid: 220.0,
                        high: 250.0,
                        market: 210.0,
                        currency: "USD".to_string(),
                        trends: None,
                    }],
                },
            ],
        };

        let price = ScrydexPokemonResolver::find_matching_price(&card, "9", "PSA", false, &None);

        assert!(price.is_none()); // Should return None because multiple variants exist but no variant specified
    }

    #[test]
    fn test_find_matching_price_with_specific_variant() {
        let card = ScrydexCard {
            id: "test".to_string(),
            name: "Test Card".to_string(),
            number: Some("1".to_string()),
            rarity: Some("Rare".to_string()),
            expansion: Some(ScrydexCardExpansion {
                id: "test-set".to_string(),
                name: "Test Set".to_string(),
                code: Some("TST".to_string()),
            }),
            variants: vec![
                ScrydexCardVariant {
                    name: "Normal".to_string(),
                    prices: vec![ScrydexGradedPrice {
                        grade: "9".to_string(),
                        company: "PSA".to_string(),
                        is_perfect: false,
                        is_signed: false,
                        is_error: false,
                        r#type: "graded".to_string(),
                        low: 100.0,
                        mid: 120.0,
                        high: 150.0,
                        market: 110.0,
                        currency: "USD".to_string(),
                        trends: None,
                    }],
                },
                ScrydexCardVariant {
                    name: "Holofoil".to_string(),
                    prices: vec![ScrydexGradedPrice {
                        grade: "9".to_string(),
                        company: "PSA".to_string(),
                        is_perfect: false,
                        is_signed: false,
                        is_error: false,
                        r#type: "graded".to_string(),
                        low: 200.0,
                        mid: 220.0,
                        high: 250.0,
                        market: 210.0,
                        currency: "USD".to_string(),
                        trends: None,
                    }],
                },
            ],
        };

        let price = ScrydexPokemonResolver::find_matching_price(
            &card,
            "9",
            "PSA",
            false,
            &Some("Holofoil".to_string()),
        );

        assert!(price.is_some());
        assert_eq!(price.unwrap().market, 210.0); // Should get the Holofoil price
    }
}
