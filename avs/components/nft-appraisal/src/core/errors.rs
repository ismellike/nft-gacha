use crate::bindings::wavs::types::events::TriggerDataEvmContractEvent;
use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::sol;

sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

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
        let (contract_address, token_id, group_id) = Self::parse_basic_info(evm_event);

        let tx_hash = Self::extract_tx_hash(&evm_event.log.tx_hash);

        crate::core::appraisal::AppraisalResponse {
            chain: "unknown".to_string(),
            contract_address,
            token_id,
            group_id,
            price: None,
            tx_hash,
        }
    }

    fn parse_basic_info(evm_event: &TriggerDataEvmContractEvent) -> (Address, U256, [u8; 32]) {
        if let Ok(request) =
            crate::utils::event_parser::EventParser::parse_appraisal_request(evm_event)
        {
            let contract_addr = request
                .contract_address
                .parse::<Address>()
                .unwrap_or(Address::ZERO);
            let token_id_val = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
                .unwrap_or(U256::ZERO);
            (contract_addr, token_id_val, [0u8; 32])
        } else {
            (Address::ZERO, U256::ZERO, [0u8; 32])
        }
    }

    fn extract_tx_hash(tx_hash_bytes: &[u8]) -> B256 {
        let mut hash_bytes = [0u8; 32];
        let src = tx_hash_bytes;
        if src.len() == 32 {
            hash_bytes.copy_from_slice(src);
        } else {
            let copy_len = src.len().min(32);
            hash_bytes[32 - copy_len..].copy_from_slice(&src[src.len() - copy_len..]);
        }
        B256::from(hash_bytes)
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
