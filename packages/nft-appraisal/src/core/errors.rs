use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;

use crate::core::payload::AppraisalIdentity;
use crate::wavs::types::events::TriggerDataEvmContractEvent;

sol!("../../contracts/src/interfaces/NFTAppraisalTypes.sol");

/// Unified error handling for the appraisal component
#[derive(Debug)]
pub enum AppraisalErrorCode {
    InvalidEvent(String),
    ParsingError(String),
    NetworkError(String),
    UnsupportedProvider(String),
    IntegrityVerificationFailed(String),
    PricingError(String),
    CacheError(String),
}

impl std::fmt::Display for AppraisalErrorCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppraisalErrorCode::InvalidEvent(msg) => write!(f, "Invalid event: {}", msg),
            AppraisalErrorCode::ParsingError(msg) => write!(f, "Parsing error: {}", msg),
            AppraisalErrorCode::NetworkError(msg) => write!(f, "Network error: {}", msg),
            AppraisalErrorCode::UnsupportedProvider(msg) => {
                write!(f, "Unsupported provider: {}", msg)
            }
            AppraisalErrorCode::IntegrityVerificationFailed(msg) => {
                write!(f, "Integrity verification failed: {}", msg)
            }
            AppraisalErrorCode::PricingError(msg) => write!(f, "Pricing error: {}", msg),
            AppraisalErrorCode::CacheError(msg) => write!(f, "Cache error: {}", msg),
        }
    }
}

impl std::error::Error for AppraisalErrorCode {}

impl AppraisalErrorCode {
    pub fn create_error_response(
        evm_event: &TriggerDataEvmContractEvent,
        _error: String,
    ) -> crate::core::appraisal::AppraisalResponse {
        let (chain, contract_address, token_id) = Self::parse_basic_info(evm_event);
        let identity = AppraisalIdentity::new(
            chain,
            contract_address,
            token_id,
            None,
            &evm_event.log.tx_hash,
        );

        crate::core::appraisal::AppraisalResponse {
            identity,
            price: None,
        }
    }

    fn parse_basic_info(evm_event: &TriggerDataEvmContractEvent) -> (String, Address, U256) {
        if let Ok(request) =
            crate::utils::event_parser::EventParser::parse_appraisal_request(evm_event)
        {
            let contract_addr = request
                .contract_address
                .parse::<Address>()
                .unwrap_or(Address::ZERO);
            let token_id_val = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
                .unwrap_or(U256::ZERO);
            (request.chain, contract_addr, token_id_val)
        } else {
            ("unknown".to_string(), Address::ZERO, U256::ZERO)
        }
    }
}

impl From<anyhow::Error> for AppraisalErrorCode {
    fn from(err: anyhow::Error) -> Self {
        match err.to_string().as_str() {
            s if s.contains("Invalid appraisal event") => {
                AppraisalErrorCode::InvalidEvent(err.to_string())
            }
            s if s.contains("Failed to parse") => AppraisalErrorCode::ParsingError(err.to_string()),
            s if s.contains("Failed to fetch") => AppraisalErrorCode::NetworkError(err.to_string()),
            s if s.contains("Unsupported") => {
                AppraisalErrorCode::UnsupportedProvider(err.to_string())
            }
            s if s.contains("integrity") => {
                AppraisalErrorCode::IntegrityVerificationFailed(err.to_string())
            }
            s if s.contains("price") => AppraisalErrorCode::PricingError(err.to_string()),
            s if s.contains("cache") => AppraisalErrorCode::CacheError(err.to_string()),
            _ => AppraisalErrorCode::NetworkError(err.to_string()),
        }
    }
}
