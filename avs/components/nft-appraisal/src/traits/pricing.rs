use crate::types::ResolverArgs;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::time::Duration;

/// Aggregated price information returned by a resolver.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppraisalPrice {
    pub value: f64,
    pub currency: String,
    pub source: String,
    pub context: Option<serde_json::Value>,
}

/// Resolver output including cache instructions.
#[derive(Debug, Clone)]
pub struct ResolverQuote {
    pub price: AppraisalPrice,
    pub ttl: Duration,
}

/// Trait for turning provider titles into price quotes.
#[async_trait(?Send)]
pub trait PriceResolver {
    /// Human readable identifier for the resolver.
    fn name(&self) -> &str;

    /// Resolve pricing information using provider-supplied arguments.
    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>>;

    /// Ensure a resolver quote is ready for downstream consumers.
    fn normalize_quote(&self, mut quote: ResolverQuote) -> ResolverQuote {
        if quote.price.source.is_empty() {
            quote.price.source = self.name().to_string();
        }
        quote
    }
}
