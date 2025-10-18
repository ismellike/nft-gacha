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
}

impl ScrydexCardInfo {
    /// Returns the card identifier in the format "{set_id}-{card_number}"
    pub fn card_identifier(&self) -> String {
        format!("{}-{}", self.set_id.trim(), self.card_number.trim())
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
    ) -> Option<&'a ScrydexGradedPrice> {
        for variant in &card.variants {
            for price in &variant.prices {
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
        let info = match args {
            ResolverArgs::ScrydexCardInfo(info) => info,
        };

        let card_identifier = info.card_identifier();

        let card_response = self.get_card(&card_identifier).await?;

        let matching_price = Self::find_matching_price(
            &card_response.data,
            &info.grade,
            &info.company,
            info.is_perfect,
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
        };
        assert_eq!(info.card_identifier(), "sv5a-1");

        let info_with_spaces = ScrydexCardInfo {
            card_number: " 1 ".to_string(),
            grade: "10".to_string(),
            company: "PSA".to_string(),
            is_perfect: false,
            set_id: " sv5a ".to_string(),
        };
        assert_eq!(info_with_spaces.card_identifier(), "sv5a-1");
    }
}
