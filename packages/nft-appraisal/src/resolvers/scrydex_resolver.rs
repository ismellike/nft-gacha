//! Scrydex card info type for resolver arguments
//!
//! This file contains the shared ScrydexCardInfo type that is used
//! across the appraisal system.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ScrydexCardInfo {
    pub card_number: String,
    pub grade: String,
    pub company: String,
    pub is_perfect: bool,
    pub set_id: String,
    pub variant: Option<String>,
}

impl ScrydexCardInfo {
    /// Returns the card identifier in the format "{set_id}-{card_number}"
    pub fn card_identifier(&self) -> String {
        format!("{}-{}", self.set_id.trim(), self.card_number.trim())
    }
}
