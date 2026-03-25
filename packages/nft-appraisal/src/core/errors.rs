use crate::core::payload::{self, AppraisalIdentity};
use crate::utils::EventParser;
use crate::wavs::types::events::TriggerDataEvmContractEvent;
use alloy_primitives::{Address, U256};

/// Construct a minimal `TriggerDataEvmContractEvent` for tests.
/// The event log carries no meaningful data, so any attempt to parse it as an
/// `AppraisalRequested` event will fail, exercising the fallback path.
#[cfg(test)]
pub(crate) fn make_empty_evm_event(chain: &str) -> TriggerDataEvmContractEvent {
    use crate::wavs::types::chain::{EvmAddress, EvmEventLog, EvmEventLogData};
    TriggerDataEvmContractEvent {
        chain: chain.to_string(),
        log: EvmEventLog {
            address: EvmAddress { raw_bytes: vec![0u8; 20] },
            data: EvmEventLogData {
                topics: vec![],
                data: vec![],
            },
            tx_hash: vec![0u8; 32],
            block_number: 0,
            log_index: 0,
            block_hash: vec![0u8; 32],
            block_timestamp: None,
            tx_index: 0,
        },
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;
    use alloy_primitives::Address;

    // -----------------------------------------------------------------------
    // encode_error_from_event
    // -----------------------------------------------------------------------

    #[test]
    fn encode_error_from_event_produces_non_empty_bytes() {
        let event = make_empty_evm_event("eip155:1");
        let bytes = encode_error_from_event(&event, "something went wrong".to_string());
        assert!(!bytes.is_empty(), "encoded error payload must not be empty");
    }

    #[test]
    fn encode_error_from_event_is_valid_abi_encoded() {
        // ABI-encoded structs are always a multiple of 32 bytes.
        let event = make_empty_evm_event("eip155:137");
        let bytes = encode_error_from_event(&event, "test error".to_string());
        assert_eq!(
            bytes.len() % 32,
            0,
            "ABI-encoded bytes must be a multiple of 32; got {}",
            bytes.len()
        );
    }

    #[test]
    fn encode_error_from_event_varies_with_message() {
        let event = make_empty_evm_event("eip155:1");
        let bytes_a = encode_error_from_event(&event, "error A".to_string());
        let bytes_b = encode_error_from_event(&event, "error B".to_string());
        assert_ne!(bytes_a, bytes_b, "different error messages should produce different payloads");
    }

    // -----------------------------------------------------------------------
    // error_identity_from_event — fallback path
    // -----------------------------------------------------------------------

    // When the event data cannot be parsed as `AppraisalRequested`, the function
    // must fall back to "unknown" chain, Address::ZERO, and U256::ZERO.

    #[test]
    fn error_identity_from_event_fallback_chain_is_unknown() {
        let event = make_empty_evm_event("eip155:1");
        let identity = error_identity_from_event(&event);
        // The empty event data causes the parse to fail, triggering the fallback.
        assert_eq!(identity.chain, "unknown");
    }

    #[test]
    fn error_identity_from_event_fallback_contract_is_zero() {
        let event = make_empty_evm_event("eip155:1");
        let identity = error_identity_from_event(&event);
        assert_eq!(identity.contract_address, Address::ZERO);
    }

    #[test]
    fn error_identity_from_event_fallback_token_id_is_zero() {
        let event = make_empty_evm_event("eip155:1");
        let identity = error_identity_from_event(&event);
        assert_eq!(identity.token_id, U256::ZERO);
    }

    #[test]
    fn error_identity_from_event_tx_hash_from_log() {
        // The tx_hash in the identity must be derived from the event log tx_hash.
        let mut event = make_empty_evm_event("eip155:1");
        // Assign a recognisable tx hash to the event log.
        let expected_hash: Vec<u8> = (1u8..=32).collect();
        event.log.tx_hash = expected_hash.clone();

        let identity = error_identity_from_event(&event);
        assert_eq!(
            identity.tx_hash.as_slice(),
            expected_hash.as_slice(),
            "tx_hash in identity must match event log tx_hash"
        );
    }

    // -----------------------------------------------------------------------
    // Round-trip: encode -> verify ABI structure
    // -----------------------------------------------------------------------

    #[test]
    fn round_trip_encode_error_returns_decodable_bytes() {
        let event = make_empty_evm_event("eip155:1");
        let encoded = encode_error_from_event(&event, "round-trip test".to_string());

        // The encoded bytes should be ABI-decodable as the AppraisalError tuple.
        // We verify this indirectly: the payload is non-empty and ABI-aligned.
        assert!(!encoded.is_empty());
        assert_eq!(encoded.len() % 32, 0);

        // The leading 32 bytes encode the contract address (zero-padded).
        // For Address::ZERO the first 12 bytes of the first word should be zero.
        assert_eq!(&encoded[0..12], &[0u8; 12]);
    }
}
