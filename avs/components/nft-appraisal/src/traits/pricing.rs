use crate::types::CardMetadata;
use anyhow::Result;
use serde::Serialize;

/// Aggregated price information returned by a resolver.
#[derive(Debug, Clone, Serialize)]
pub struct AppraisalPrice {
    pub value: f64,
    pub currency: String,
    pub source: String,
    pub context: Option<serde_json::Value>,
}

/// Trait for turning unified metadata into price quotes.
pub trait PriceResolver: Send + Sync {
    /// Human readable identifier for the resolver.
    fn name(&self) -> &str;

    /// Determine whether this resolver can handle the provided metadata.
    fn can_resolve(&self, metadata: &CardMetadata) -> bool;

    /// Resolve pricing information for the provided metadata.
    fn get_price(&self, metadata: &CardMetadata) -> Result<Option<AppraisalPrice>>;
}
