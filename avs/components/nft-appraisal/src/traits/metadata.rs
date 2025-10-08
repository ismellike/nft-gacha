use crate::types::{CardMetadata, ProviderType};
use anyhow::Result;

/// Trait for fetching and validating NFT metadata from a token URI.
pub trait MetadataProvider: Send + Sync {
    /// The provider type represented by this implementation.
    fn provider_type(&self) -> ProviderType;

    /// Determine whether this provider can fetch metadata for the given URI.
    fn can_handle_uri(&self, uri: &str) -> bool;

    /// Fetch metadata from the given URI and convert it into the unified representation.
    fn fetch_metadata(&self, uri: &str) -> Result<CardMetadata>;

    /// Perform any integrity or authenticity verification for the fetched metadata.
    fn verify(&self, metadata: &CardMetadata) -> Result<()> {
        let _ = metadata;
        Ok(())
    }
}
