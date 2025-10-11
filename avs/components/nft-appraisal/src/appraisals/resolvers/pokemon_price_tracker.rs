use crate::appraisals::client::PokemonPriceClient;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Pricing query parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricingQuery {
    pub card_name: String,
    pub set_id: Option<String>,
    pub grade_category: String,
    pub card_number: Option<String>,
    pub search_query: String,
}

/// Pricing result from a resolver
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricingResult {
    pub price: f64,
    pub currency: String,
    pub source: String,
    pub last_updated: Option<String>,
}

/// Trait for pricing resolvers
#[async_trait(?Send)]
pub trait PricingResolver {
    /// Get the name of this resolver
    fn name(&self) -> &str;

    /// Get the supported card categories for this resolver
    #[allow(dead_code)]
    fn supported_categories(&self) -> Vec<String>;

    /// Check if this resolver can handle the given query
    fn can_handle(&self, query: &PricingQuery) -> bool;

    /// Get pricing for the given query
    async fn get_price(&self, query: &PricingQuery) -> Result<Option<PricingResult>>;
}

/// Resolver for Pokemon Price Tracker API
pub struct PokemonPriceTrackerResolver {
    client: PokemonPriceClient,
}

impl PokemonPriceTrackerResolver {
    /// Create a new Pokemon Price Tracker resolver
    pub fn new(api_key: String) -> Self {
        Self {
            client: PokemonPriceClient::new(api_key),
        }
    }
}

#[async_trait(?Send)]
impl PricingResolver for PokemonPriceTrackerResolver {
    fn name(&self) -> &str {
        "Pokemon Price Tracker"
    }

    fn supported_categories(&self) -> Vec<String> {
        vec!["Pokemon".to_string()]
    }

    fn can_handle(&self, query: &PricingQuery) -> bool {
        // Only handle Pokemon cards
        // Only support PSA 9 and PSA 10 grades for now
        matches!(query.grade_category.as_str(), "PSA 9" | "PSA 10")
    }

    async fn get_price(&self, query: &PricingQuery) -> Result<Option<PricingResult>> {
        // Use the existing Pokemon client
        let price = self.client.appraise_card(
            &query.card_name,
            query.set_id.as_deref(),
            Some(&query.grade_category),
        ).await?;

        match price {
            Some(actual_price) if actual_price > 0.0 => Ok(Some(PricingResult {
                price: actual_price,
                currency: "USD".to_string(),
                source: self.name().to_string(),
                last_updated: Some(chrono::Utc::now().to_rfc3339()),
            })),
            Some(_) => Ok(None), // Zero or negative price
            None => Ok(None),    // Card not found
        }
    }
}

impl PricingQuery {
    /// Get the grade parameter for Pokemon API
    #[allow(dead_code)]
    pub fn get_grade_for_api(&self) -> Option<&str> {
        match self.grade_category.as_str() {
            "PSA 10" => Some("PSA 10"),
            "PSA 9" => Some("PSA 9"),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pokemon_resolver_creation() {
        let resolver = PokemonPriceTrackerResolver::new("test_key".to_string());
        assert_eq!(resolver.name(), "Pokemon Price Tracker");
        assert_eq!(resolver.supported_categories(), vec!["Pokemon"]);
    }

    #[test]
    fn test_can_handle_psa_cards() {
        let resolver = PokemonPriceTrackerResolver::new("test_key".to_string());

        let query_psa10 = PricingQuery {
            card_name: "Pikachu".to_string(),
            set_id: Some("base1".to_string()),
            grade_category: "PSA 10".to_string(),
            card_number: Some("25".to_string()),
            search_query: "Pikachu #25".to_string(),
        };

        let query_psa9 = PricingQuery {
            card_name: "Charizard".to_string(),
            set_id: Some("base1".to_string()),
            grade_category: "PSA 9".to_string(),
            card_number: Some("4".to_string()),
            search_query: "Charizard #4".to_string(),
        };

        let query_psa8 = PricingQuery {
            card_name: "Blastoise".to_string(),
            set_id: Some("base1".to_string()),
            grade_category: "PSA 8".to_string(),
            card_number: Some("2".to_string()),
            search_query: "Blastoise #2".to_string(),
        };

        assert!(resolver.can_handle(&query_psa10));
        assert!(resolver.can_handle(&query_psa9));
        assert!(!resolver.can_handle(&query_psa8)); // PSA 8 not supported
    }

    #[test]
    fn test_grade_for_api() {
        let query_psa10 = PricingQuery {
            card_name: "Pikachu".to_string(),
            set_id: None,
            grade_category: "PSA 10".to_string(),
            card_number: None,
            search_query: "Pikachu".to_string(),
        };

        let query_raw = PricingQuery {
            card_name: "Pikachu".to_string(),
            set_id: None,
            grade_category: "raw".to_string(),
            card_number: None,
            search_query: "Pikachu".to_string(),
        };

        assert_eq!(query_psa10.get_grade_for_api(), Some("PSA 10"));
        assert_eq!(query_raw.get_grade_for_api(), None);
    }
}
