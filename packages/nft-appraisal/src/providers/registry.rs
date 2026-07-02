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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::providers::courtyard::CourtyardProvider;
    use crate::providers::generic::GenericProvider;
    use crate::providers::pfp::PfpProvider;

    fn make_registry() -> ProviderRegistry {
        ProviderRegistry::new(vec![
            RegisteredProvider::Courtyard(CourtyardProvider::new()),
            RegisteredProvider::Pfp(PfpProvider::new()),
            RegisteredProvider::Generic(GenericProvider::new()),
        ])
    }

    fn make_pfp_data_uri(rarity: &str) -> String {
        // Inline base64 encode for test
        fn base64_encode(input: &[u8]) -> String {
            const CHARS: &[u8] =
                b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let mut out = String::with_capacity(input.len().div_ceil(3) * 4);
            for chunk in input.chunks(3) {
                let b0 = chunk[0] as u32;
                let b1 = *chunk.get(1).unwrap_or(&0) as u32;
                let b2 = *chunk.get(2).unwrap_or(&0) as u32;
                let triple = (b0 << 16) | (b1 << 8) | b2;
                out.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
                out.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
                if chunk.len() > 1 {
                    out.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
                } else {
                    out.push('=');
                }
                if chunk.len() > 2 {
                    out.push(CHARS[(triple & 0x3F) as usize] as char);
                } else {
                    out.push('=');
                }
            }
            out
        }

        let json = format!(
            r#"{{"name":"Gacha PFP #1","description":"test","attributes":[{{"trait_type":"Rarity","value":"{}"}}]}}"#,
            rarity
        );
        format!(
            "data:application/json;base64,{}",
            base64_encode(json.as_bytes())
        )
    }

    // -----------------------------------------------------------------------
    // Provider dispatch order tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_registry_routes_courtyard_uri() {
        let registry = make_registry();
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle("https://api.courtyard.io/token/123"))
            .unwrap();
        assert_eq!(provider.provider_type(), ProviderType::Courtyard);
    }

    #[test]
    fn test_registry_routes_pfp_uri() {
        let registry = make_registry();
        let uri = make_pfp_data_uri("Epic");
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle(&uri))
            .unwrap();
        assert_eq!(provider.provider_type(), ProviderType::Pfp);
    }

    #[test]
    fn test_registry_routes_generic_uri() {
        let registry = make_registry();
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle("testnet-gacha://1"))
            .unwrap();
        assert_eq!(provider.provider_type(), ProviderType::Generic);
    }

    #[test]
    fn test_registry_pfp_takes_priority_over_generic_for_data_uri() {
        let registry = make_registry();
        let uri = make_pfp_data_uri("Common");
        // First matching provider should be PFP, not Generic
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle(&uri))
            .unwrap();
        assert_eq!(
            provider.provider_type(),
            ProviderType::Pfp,
            "PFP should match before Generic for data URIs"
        );
    }

    #[test]
    fn test_registry_non_gacha_data_uri_falls_to_generic() {
        let registry = make_registry();
        // A data URI that isn't "Gacha PFP" should skip PFP and fall to Generic
        fn base64_encode_simple(input: &[u8]) -> String {
            const CHARS: &[u8] =
                b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let mut out = String::with_capacity(input.len().div_ceil(3) * 4);
            for chunk in input.chunks(3) {
                let b0 = chunk[0] as u32;
                let b1 = *chunk.get(1).unwrap_or(&0) as u32;
                let b2 = *chunk.get(2).unwrap_or(&0) as u32;
                let triple = (b0 << 16) | (b1 << 8) | b2;
                out.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
                out.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
                if chunk.len() > 1 {
                    out.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
                } else {
                    out.push('=');
                }
                if chunk.len() > 2 {
                    out.push(CHARS[(triple & 0x3F) as usize] as char);
                } else {
                    out.push('=');
                }
            }
            out
        }

        let json = r#"{"name":"Other NFT #1","attributes":[]}"#;
        let uri = format!(
            "data:application/json;base64,{}",
            base64_encode_simple(json.as_bytes())
        );
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle(&uri))
            .unwrap();
        assert_eq!(
            provider.provider_type(),
            ProviderType::Generic,
            "Non-PFP data URIs should fall to Generic"
        );
    }

    #[test]
    fn test_registry_generic_is_always_last_resort() {
        let registry = make_registry();
        // Any arbitrary string should be handled by Generic (it's the catch-all)
        let provider = registry
            .providers
            .iter()
            .find(|p| p.can_handle("literally-anything"))
            .unwrap();
        assert_eq!(provider.provider_type(), ProviderType::Generic);
    }

    #[test]
    fn test_registry_has_three_providers() {
        let registry = make_registry();
        assert_eq!(registry.providers.len(), 3);
    }

    #[test]
    fn test_registry_provider_order() {
        let registry = make_registry();
        assert_eq!(
            registry.providers[0].provider_type(),
            ProviderType::Courtyard
        );
        assert_eq!(registry.providers[1].provider_type(), ProviderType::Pfp);
        assert_eq!(registry.providers[2].provider_type(), ProviderType::Generic);
    }
}
