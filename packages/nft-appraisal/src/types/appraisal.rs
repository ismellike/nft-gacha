use crate::resolvers::scrydex_resolver::ScrydexCardInfo;
use serde::{Deserialize, Serialize};

/// Provider types supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProviderType {
    Courtyard,
    Pfp,
    Generic,
}

/// Resolver families supported by the appraisal engine.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResolverKind {
    PokemonGradedCard,
}

/// Resolver-specific arguments produced by providers.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResolverArgs {
    ScrydexCardInfo(ScrydexCardInfo),
}

impl ResolverArgs {
    pub fn cache_fragment(&self) -> String {
        match self {
            ResolverArgs::ScrydexCardInfo(info) => {
                let variant_fragment = info
                    .variant
                    .as_ref()
                    .map(|v| v.trim().to_ascii_lowercase())
                    .filter(|v| !v.is_empty())
                    .unwrap_or_else(|| "novariant".to_string());
                format!(
                    "{}-{}-{}-{}-{}-{}",
                    info.card_number.trim().to_ascii_lowercase(),
                    info.grade.trim().to_ascii_lowercase(),
                    info.company.trim().to_ascii_lowercase(),
                    info.is_perfect,
                    info.set_id.trim().to_ascii_lowercase(),
                    variant_fragment
                )
            }
        }
    }
}

/// Complete routing information from provider to resolver.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResolverRoute {
    pub kind: ResolverKind,
    pub args: ResolverArgs,
}

impl ResolverRoute {
    pub fn pokemon_card_info(
        card_number: String,
        grade: String,
        company: String,
        is_perfect: bool,
        set_id: String,
        variant: Option<String>,
    ) -> Self {
        Self {
            kind: ResolverKind::PokemonGradedCard,
            args: ResolverArgs::ScrydexCardInfo(ScrydexCardInfo {
                card_number,
                grade,
                company,
                is_perfect,
                set_id,
                variant,
            }),
        }
    }

    pub fn cache_key_fragment(&self) -> String {
        self.args.cache_fragment()
    }
}
