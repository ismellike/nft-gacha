//! Scrydex-based resolver for Pokémon trading card data
//!
//! This resolver provides direct card lookup and price discovery from the
//! Scrydex API. It queries individual cards using the {set}-{card_number}
//! identifier format and returns pricing information.

mod client;
mod matcher;
mod resolver;
mod tests;
mod types;

pub use resolver::ScrydexPokemonResolver;
