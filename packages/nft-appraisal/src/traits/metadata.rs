use crate::types::{ProviderType, ResolverRoute};
use anyhow::Result;
use async_trait::async_trait;

/// Normalized metadata returned by providers for appraisal.
#[derive(Debug, Clone)]
pub struct ProviderMetadata {
    pub provider: ProviderType,
    pub title: String,
    pub resolver: Option<ResolverRoute>,
}

/// Trait for fetching card titles from NFT token URIs.
#[async_trait(?Send)]
pub trait MetadataProvider {
    /// The provider type represented by this implementation.
    fn provider_type(&self) -> ProviderType;

    /// Determine whether this provider can fetch metadata for the given URI.
    fn can_handle_uri(&self, uri: &str) -> bool;

    /// Fetch metadata from the given URI.
    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata>;
}
