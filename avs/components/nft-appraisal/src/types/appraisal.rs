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
        title: String,
        card_number: Option<String>,
        grade: Option<String>,
        set_name: Option<String>,
        year: Option<String>,
    },
}

impl ResolverArgs {
    pub fn cache_fragment(&self) -> String {
        match self {
            ResolverArgs::PokemonCardInfo {
                title,
                card_number,
                grade,
                ..
            } => {
                format!(
                    "{}-{}-{}",
                    title.trim().to_ascii_lowercase(),
                    card_number.as_deref().unwrap_or(""),
                    grade.as_deref().unwrap_or("")
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
    pub fn pokemon_card_info<T: Into<String>>(
        title: T,
        card_number: Option<String>,
        grade: Option<String>,
        set_name: Option<String>,
        year: Option<String>,
    ) -> Self {
        let title = normalize_pokemon_title(title.into());
        Self {
            kind: ResolverKind::PokemonTradingCard,
            args: ResolverArgs::PokemonCardInfo {
                title,
                card_number,
                grade,
                set_name,
                year,
            },
        }
    }

    pub fn cache_key_fragment(&self) -> String {
        self.args.cache_fragment()
    }
}

fn normalize_pokemon_title(mut title: String) -> String {
    title = title.replace('É', "E");
    title.replace('é', "e")
}
