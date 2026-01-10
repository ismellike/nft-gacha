//! Courtyard provider implementation with MetadataProvider trait

use anyhow::{anyhow, Result};
use async_trait::async_trait;

use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::types::{ProviderType, ResolverRoute};

use super::client::CourtyardClient;
use super::parser::AttributeParser;
use super::types::NFTMetadata;

/// Provider for Courtyard NFT metadata
pub struct CourtyardProvider {
    client: CourtyardClient,
}

impl CourtyardProvider {
    /// Create a new Courtyard provider
    pub fn new() -> Self {
        Self {
            client: CourtyardClient::new(),
        }
    }

    /// Infer resolver route from metadata and categories
    pub fn infer_resolver(metadata: &NFTMetadata, categories: &[String]) -> Option<ResolverRoute> {
        let is_graded_card = metadata
            .product_type
            .as_deref()
            .map(|value| value.eq_ignore_ascii_case("GRADED_CARD"))
            .unwrap_or(false);

        let has_pokemon_category = categories.iter().any(|category| {
            let upper = category.to_uppercase();
            if upper.contains("POKÉMON") {
                true
            } else {
                upper.replace('É', "E").contains("POKEMON")
            }
        });

        if is_graded_card && has_pokemon_category {
            // Try to convert metadata to ScrydexCardInfo, returning None if conversion fails
            let card_info: ScrydexCardInfo = match metadata.try_into() {
                Ok(info) => info,
                Err(_) => return None, // Silently fail if required attributes are missing
            };

            let set_id = AttributeParser::extract_set_id(&card_info.set_id)
                .unwrap_or_else(|| card_info.set_id.clone());

            if !card_info.card_number.is_empty()
                && !card_info.grade.is_empty()
                && !card_info.company.is_empty()
                && !set_id.is_empty()
            {
                return Some(ResolverRoute::pokemon_card_info(
                    card_info.card_number,
                    card_info.grade,
                    card_info.company,
                    card_info.is_perfect,
                    set_id,
                    card_info.variant,
                ));
            }
        }

        None
    }
}

#[async_trait(?Send)]
impl MetadataProvider for CourtyardProvider {
    fn provider_type(&self) -> ProviderType {
        ProviderType::Courtyard
    }

    fn can_handle_uri(&self, uri: &str) -> bool {
        // Check if URI matches Courtyard patterns
        uri.contains("courtyard.io")
            || uri.contains("api.courtyard.io")
            || (uri.contains("static.courtyard.io") && uri.contains("token_uri"))
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        // Fetch Courtyard metadata document
        let courtyard_metadata = self.client.get_nft_metadata_from_uri(uri).await?;

        // Verify integrity before proceeding (fail fast)
        if let Err(e) = self.client.verify_proof_of_integrity(&courtyard_metadata) {
            return Err(anyhow!("Integrity verification failed for {}: {}", uri, e));
        }

        let categories =
            AttributeParser::categories_from_attributes(&courtyard_metadata.attributes);
        let resolver = Self::infer_resolver(&courtyard_metadata, &categories);
        Ok(ProviderMetadata {
            provider: ProviderType::Courtyard,
            title: courtyard_metadata.name.clone(),
            product_type: courtyard_metadata.product_type.clone(),
            categories,
            resolver,
        })
    }
}
