use serde::{Deserialize, Serialize};

/// Provider types supported by the system
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProviderType {
    Courtyard,
}

/// Resolver families supported by the appraisal engine.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ResolverKind {
    PokemonTradingCard,
}
