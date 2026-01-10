//! Courtyard provider implementation for graded trading card metadata
//!
//! This module handles all Courtyard-specific logic including:
//! - Metadata fetching from Courtyard APIs
//! - Card parsing and attribute extraction
//! - Integrity verification for graded cards
//! - Conversion to unified metadata format

mod client;
mod parser;
mod provider;
mod tests;
mod types;
mod verifier;

pub use provider::CourtyardProvider;
