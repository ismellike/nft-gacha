//! Generic fallback provider for non-Courtyard NFTs (e.g. testnet mints).
//!
//! When the token URI doesn't match any known provider, this generates a
//! deterministic pseudo-random price spread across all rarity tiers using
//! the token URI as entropy. No external API calls needed.

pub mod provider;

pub use provider::GenericProvider;
