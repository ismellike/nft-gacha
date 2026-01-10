//! Types for Scrydex API responses

use serde::{Deserialize, Serialize};

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
