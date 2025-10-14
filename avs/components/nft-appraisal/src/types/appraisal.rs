use serde::{Deserialize, Serialize};

/// Provider types supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProviderType {
    Courtyard,
}

/// Resolver families supported by the appraisal engine.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResolverKind {
    PokemonTradingCard,
}

/// Resolver-specific arguments produced by providers.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ResolverArgs {
    PokemonCardInfo {
        card_number: String,
        grade: String,
        company: String,
        is_perfect: bool,
        set_id: String,
    },
}

impl ResolverArgs {
    pub fn cache_fragment(&self) -> String {
        match self {
            ResolverArgs::PokemonCardInfo {
                card_number,
                grade,
                company,
                is_perfect,
                set_id,
                ..
            } => {
                format!(
                    "{}-{}-{}-{}-{}",
                    card_number.trim().to_ascii_lowercase(),
                    grade.trim().to_ascii_lowercase(),
                    company.trim().to_ascii_lowercase(),
                    is_perfect,
                    set_id.trim().to_ascii_lowercase()
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
    ) -> Self {
        Self {
            kind: ResolverKind::PokemonTradingCard,
            args: ResolverArgs::PokemonCardInfo {
                card_number,
                grade,
                company,
                is_perfect,
                set_id,
            },
        }
    }

    pub fn cache_key_fragment(&self) -> String {
        self.args.cache_fragment()
    }
}
