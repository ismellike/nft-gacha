use crate::core::payload::{self, AppraisalIdentity};
use crate::utils::EventParser;
use crate::wavs::types::events::TriggerDataEvmContractEvent;
use alloy_primitives::{Address, U256};

/// Build a fallback error identity from an EVM event.
///
/// Attempts to parse the event; if that fails, returns zero-valued fields
/// so the on-chain handler can still match the response to a request.
pub fn error_identity_from_event(evm_event: &TriggerDataEvmContractEvent) -> AppraisalIdentity {
    let (chain, contract_address, token_id) =
        if let Ok(request) = EventParser::parse_appraisal_request(evm_event) {
            let contract_addr = request
                .contract_address
                .parse::<Address>()
                .unwrap_or(Address::ZERO);
            let token_id_val =
                U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
                    .unwrap_or(U256::ZERO);
            (request.chain, contract_addr, token_id_val)
        } else {
            ("unknown".to_string(), Address::ZERO, U256::ZERO)
        };

    AppraisalIdentity::new(
        chain,
        contract_address,
        token_id,
        None,
        &evm_event.log.tx_hash,
    )
}

/// Encode an error payload from an EVM event and an error message.
pub fn encode_error_from_event(
    evm_event: &TriggerDataEvmContractEvent,
    error: String,
) -> Vec<u8> {
    let identity = error_identity_from_event(evm_event);
    payload::encode_error(&identity, error)
}
