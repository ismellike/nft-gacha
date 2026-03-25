use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::SolValue;
use sha3::{Digest, Keccak256};

use crate::{AppraisalError, AppraisalSuccess};

#[derive(Debug, Clone)]
pub struct AppraisalIdentity {
    pub chain: String,
    pub contract_address: Address,
    pub token_id: U256,
    pub group_id: [u8; 32],
    pub tx_hash: B256,
}

impl AppraisalIdentity {
    pub fn new(
        chain: String,
        contract_address: Address,
        token_id: U256,
        title: Option<&str>,
        tx_hash_bytes: &[u8],
    ) -> Self {
        let group_id = compute_group_id(&chain, contract_address, token_id, title);
        let tx_hash = extract_tx_hash(tx_hash_bytes);
        Self {
            chain,
            contract_address,
            token_id,
            group_id,
            tx_hash,
        }
    }
}

pub fn compute_group_id(
    chain: &str,
    contract_address: Address,
    token_id: U256,
    title: Option<&str>,
) -> [u8; 32] {
    let mut hasher = Keccak256::new();
    hasher.update(chain.as_bytes());
    hasher.update(contract_address.as_slice());
    let token_bytes = token_id.to_be_bytes::<32>();
    hasher.update(token_bytes);
    if let Some(title) = title {
        hasher.update(title.as_bytes());
    }
    hasher.finalize().into()
}

pub fn extract_tx_hash(tx_hash_bytes: &[u8]) -> B256 {
    let mut hash_bytes = [0u8; 32];
    if tx_hash_bytes.len() == 32 {
        hash_bytes.copy_from_slice(tx_hash_bytes);
    } else if tx_hash_bytes.len() < 32 {
        // Left-align: copy into beginning, zero-pad on the right
        hash_bytes[..tx_hash_bytes.len()].copy_from_slice(tx_hash_bytes);
    } else {
        // Truncate: take first 32 bytes
        hash_bytes.copy_from_slice(&tx_hash_bytes[..32]);
    }
    B256::from(hash_bytes)
}

pub fn encode_success(identity: &AppraisalIdentity, price: U256) -> Vec<u8> {
    AppraisalSuccess {
        chain: identity.chain.clone(),
        contractAddress: identity.contract_address,
        tokenId: identity.token_id,
        groupId: identity.group_id.into(),
        price,
        txHash: identity.tx_hash,
    }
    .abi_encode()
}

pub fn encode_error(identity: &AppraisalIdentity, error: String) -> Vec<u8> {
    AppraisalError {
        contractAddress: identity.contract_address,
        tokenId: identity.token_id,
        groupId: identity.group_id.into(),
        error,
        txHash: identity.tx_hash,
    }
    .abi_encode()
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    #[test]
    fn test_extract_tx_hash_exact_32_bytes() {
        let input: Vec<u8> = (1u8..=32).collect();
        let result = extract_tx_hash(&input);
        assert_eq!(result.as_slice(), input.as_slice());
    }

    #[test]
    fn test_extract_tx_hash_short_input_left_aligned() {
        // 20-byte input: bytes should appear at the start; the remaining 12 bytes must be zero.
        let input: Vec<u8> = (1u8..=20).collect();
        let result = extract_tx_hash(&input);
        let bytes = result.as_slice();

        assert_eq!(&bytes[..20], input.as_slice(), "first 20 bytes must match input");
        assert_eq!(
            &bytes[20..],
            &[0u8; 12],
            "trailing bytes must be zero-padded"
        );
    }

    #[test]
    fn test_extract_tx_hash_long_input_truncated() {
        // 40-byte input: only the first 32 bytes should be kept.
        let input: Vec<u8> = (1u8..=40).collect();
        let result = extract_tx_hash(&input);
        assert_eq!(result.as_slice(), &input[..32]);
    }

    #[test]
    fn test_extract_tx_hash_empty_input() {
        // Empty slice should produce all-zero hash (left-aligned with nothing to copy).
        let result = extract_tx_hash(&[]);
        assert_eq!(result, B256::ZERO);
    }

    // -----------------------------------------------------------------------
    // Proptest fuzz tests
    // -----------------------------------------------------------------------

    proptest! {
        #[test]
        fn fuzz_extract_tx_hash_never_panics(bytes in proptest::collection::vec(any::<u8>(), 0..256)) {
            let result = extract_tx_hash(&bytes);
            let result_bytes = result.as_slice();

            if bytes.len() == 32 {
                prop_assert_eq!(result_bytes, bytes.as_slice());
            } else if bytes.len() < 32 {
                // Left-aligned: input bytes at start, zeros at end
                prop_assert_eq!(&result_bytes[..bytes.len()], bytes.as_slice());
                for &b in &result_bytes[bytes.len()..] {
                    prop_assert_eq!(b, 0u8);
                }
            } else {
                // Truncated: only first 32 bytes
                prop_assert_eq!(result_bytes, &bytes[..32]);
            }
        }

        #[test]
        fn fuzz_compute_group_id_deterministic(
            chain in "[a-z]{1,20}",
            addr_bytes in proptest::collection::vec(any::<u8>(), 20..=20),
            token_val in any::<u128>(),
            title in proptest::option::of("[a-zA-Z0-9 ]{0,50}"),
        ) {
            let addr = Address::from_slice(&addr_bytes);
            let token_id = U256::from(token_val);
            let title_ref = title.as_deref();

            let id1 = compute_group_id(&chain, addr, token_id, title_ref);
            let id2 = compute_group_id(&chain, addr, token_id, title_ref);
            prop_assert_eq!(id1, id2, "compute_group_id must be deterministic");
        }

        #[test]
        fn fuzz_compute_group_id_different_inputs_differ(
            chain in "[a-z]{1,10}",
            addr_bytes in proptest::collection::vec(any::<u8>(), 20..=20),
            token_a in 0u128..u128::MAX / 2,
            token_b in (u128::MAX / 2 + 1)..u128::MAX,
        ) {
            let addr = Address::from_slice(&addr_bytes);
            let id_a = compute_group_id(&chain, addr, U256::from(token_a), None);
            let id_b = compute_group_id(&chain, addr, U256::from(token_b), None);
            prop_assert_ne!(id_a, id_b, "Different token IDs should produce different group IDs");
        }
    }
}
