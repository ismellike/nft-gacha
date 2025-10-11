use crate::types::CardMetadata;
use anyhow::Result;
use async_trait::async_trait;
use serde::Serialize;
use std::time::Duration;

/// Aggregated price information returned by a resolver.
#[derive(Debug, Clone, Serialize)]
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

/// Trait for turning unified metadata into price quotes.
#[async_trait(?Send)]
pub trait PriceResolver {
    /// Human readable identifier for the resolver.
    fn name(&self) -> &str;

    /// Determine whether this resolver can handle the provided metadata.
    fn can_resolve(&self, metadata: &CardMetadata) -> bool;

    /// Resolve pricing information for the provided metadata.
    async fn get_price(&self, metadata: &CardMetadata) -> Result<Option<ResolverQuote>>;
}
