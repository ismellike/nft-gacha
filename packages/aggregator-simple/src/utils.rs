use alloy_network::Ethereum;
use alloy_provider::Provider;
use wavs_wasi_utils::evm::new_evm_provider;
use wstd::runtime::block_on;

use crate::world::{
    host,
    wavs::types::events::{TriggerData, TriggerDataEvmContractEvent},
};

pub fn is_valid_tx(trigger_data: TriggerData) -> Result<bool, String> {
    match trigger_data {
        TriggerData::EvmContractEvent(TriggerDataEvmContractEvent { chain, log }) => {
            let chain_config = host::get_evm_chain_config(&chain)
                .ok_or(format!("Could not get evm chain config for {chain}"))?;
            let provider = new_evm_provider::<Ethereum>(
                chain_config
                    .http_endpoint
                    .ok_or(format!("Could not get http endpoint for {chain}"))?,
            );

            let sized_hash: [u8; 32] = log
                .tx_hash
                .try_into()
                .map_err(|_| "Could not convert tx hash to FixedBytes<32>")?;

            let maybe_tx =
                block_on(async move { provider.get_transaction_by_hash(sized_hash.into()).await })
                    .map_err(|e| format!("Could not query transaction via RPC {e}"))?;

            if let Some(tx) = maybe_tx {
                if let Some(block_hash) = tx.block_hash {
                    let sized_hash: [u8; 32] = log
                        .block_hash
                        .try_into()
                        .map_err(|_| "Could not convert block hash to FixedBytes<32>")?;

                    return Ok(block_hash == sized_hash);
                }
            }

            Ok(false)
        }
        _ => Ok(true),
    }
}

#[cfg(test)]
mod tests {
    /// Attempt to convert a byte vector into a [u8; 32] fixed array, mirroring
    /// the conversion performed on `log.tx_hash` and `log.block_hash` inside
    /// `is_valid_tx`. This isolates the pure length-validation logic so it can
    /// be tested without any WASI host imports.
    fn try_to_fixed32(bytes: Vec<u8>) -> Result<[u8; 32], &'static str> {
        bytes
            .try_into()
            .map_err(|_| "Could not convert tx hash to FixedBytes<32>")
    }

    // --- tx hash / block hash length validation ---

    #[test]
    fn exactly_32_bytes_converts_successfully() {
        let bytes = vec![0xabu8; 32];
        assert!(try_to_fixed32(bytes).is_ok());
    }

    #[test]
    fn thirty_one_bytes_is_rejected() {
        let bytes = vec![0u8; 31];
        assert!(try_to_fixed32(bytes).is_err());
    }

    #[test]
    fn thirty_three_bytes_is_rejected() {
        let bytes = vec![0u8; 33];
        assert!(try_to_fixed32(bytes).is_err());
    }

    #[test]
    fn zero_bytes_is_rejected() {
        assert!(try_to_fixed32(vec![]).is_err());
    }

    #[test]
    fn sixty_four_bytes_is_rejected() {
        let bytes = vec![0u8; 64];
        assert!(try_to_fixed32(bytes).is_err());
    }

    #[test]
    fn converted_bytes_match_original_content() {
        let mut bytes = vec![0u8; 32];
        bytes[0] = 0xde;
        bytes[31] = 0xad;
        let arr = try_to_fixed32(bytes).unwrap();
        assert_eq!(arr[0], 0xde);
        assert_eq!(arr[31], 0xad);
    }

    #[test]
    fn all_zero_hash_converts() {
        let arr = try_to_fixed32(vec![0u8; 32]).unwrap();
        assert_eq!(arr, [0u8; 32]);
    }

    #[test]
    fn all_max_byte_hash_converts() {
        let arr = try_to_fixed32(vec![0xFFu8; 32]).unwrap();
        assert_eq!(arr, [0xFFu8; 32]);
    }
}
