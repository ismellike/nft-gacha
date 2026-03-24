use std::sync::Arc;

use anyhow::{anyhow, Result};
use async_trait::async_trait;

use crate::providers::courtyard::CourtyardProvider;
use crate::providers::generic::GenericProvider;
use crate::providers::pfp::PfpProvider;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::types::ProviderType;

/// Adapter for metadata fetch so multiple providers can be plugged in.
#[async_trait(?Send)]
pub trait AppraisalProvider: Send + Sync {
    fn provider_type(&self) -> ProviderType;
    fn can_handle(&self, uri: &str) -> bool;
    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata>;
}

/// Registry of all providers the processor can use.
#[derive(Clone)]
pub struct ProviderRegistry {
    providers: Vec<Arc<dyn AppraisalProvider>>,
}

impl ProviderRegistry {
    pub fn new(providers: Vec<RegisteredProvider>) -> Self {
        let providers = providers
            .into_iter()
            .map(|p| p.into_arc())
            .collect::<Vec<_>>();
        Self { providers }
    }

    pub async fn fetch_metadata(&self, token_uri: &str) -> Result<ProviderMetadata> {
        let provider = self
            .providers
            .iter()
            .find(|p| p.can_handle(token_uri))
            .ok_or_else(|| {
                anyhow!(
                    "No metadata provider registered for token URI: {}",
                    token_uri
                )
            })?;

        let metadata = provider.fetch_metadata(token_uri).await?;
        let expected = provider.provider_type();
        if metadata.provider != expected {
            return Err(anyhow!(
                "Metadata provider mismatch: expected {:?}, got {:?}",
                expected,
                metadata.provider
            ));
        }

        Ok(metadata)
    }
}

/// Enum-backed registration so defaults stay declarative.
pub enum RegisteredProvider {
    Courtyard(CourtyardProvider),
    Pfp(PfpProvider),
    Generic(GenericProvider),
    #[allow(dead_code)]
    Custom(Arc<dyn AppraisalProvider>),
}

impl RegisteredProvider {
    fn into_arc(self) -> Arc<dyn AppraisalProvider> {
        match self {
            RegisteredProvider::Courtyard(provider) => {
                Arc::new(CourtyardAppraisalProvider::new(provider))
            }
            RegisteredProvider::Pfp(provider) => Arc::new(PfpAppraisalProvider::new(provider)),
            RegisteredProvider::Generic(provider) => {
                Arc::new(GenericAppraisalProvider::new(provider))
            }
            RegisteredProvider::Custom(provider) => provider,
        }
    }
}

/// Simple adapter around the existing Courtyard implementation.
pub struct CourtyardAppraisalProvider {
    inner: CourtyardProvider,
}

impl CourtyardAppraisalProvider {
    pub fn new(inner: CourtyardProvider) -> Self {
        Self { inner }
    }
}

#[async_trait(?Send)]
impl AppraisalProvider for CourtyardAppraisalProvider {
    fn provider_type(&self) -> ProviderType {
        self.inner.provider_type()
    }

    fn can_handle(&self, uri: &str) -> bool {
        self.inner.can_handle_uri(uri)
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        // Delegate to the existing MetadataProvider implementation.
        <CourtyardProvider as MetadataProvider>::fetch_metadata(&self.inner, uri).await
    }
}

/// Adapter around the generic fallback provider.
pub struct GenericAppraisalProvider {
    inner: GenericProvider,
}

impl GenericAppraisalProvider {
    pub fn new(inner: GenericProvider) -> Self {
        Self { inner }
    }
}

#[async_trait(?Send)]
impl AppraisalProvider for GenericAppraisalProvider {
    fn provider_type(&self) -> ProviderType {
        self.inner.provider_type()
    }

    fn can_handle(&self, uri: &str) -> bool {
        self.inner.can_handle_uri(uri)
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        <GenericProvider as MetadataProvider>::fetch_metadata(&self.inner, uri).await
    }
}

/// Adapter around the PFP provider.
pub struct PfpAppraisalProvider {
    inner: PfpProvider,
}

impl PfpAppraisalProvider {
    pub fn new(inner: PfpProvider) -> Self {
        Self { inner }
    }
}

#[async_trait(?Send)]
impl AppraisalProvider for PfpAppraisalProvider {
    fn provider_type(&self) -> ProviderType {
        self.inner.provider_type()
    }

    fn can_handle(&self, uri: &str) -> bool {
        self.inner.can_handle_uri(uri)
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        <PfpProvider as MetadataProvider>::fetch_metadata(&self.inner, uri).await
    }
}
