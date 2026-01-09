use alloy_primitives::{Address, B256, U256};
use alloy_sol_types::{sol, SolValue};
use sha3::{Digest, Keccak256};

sol!("../../contracts/src/interfaces/NFTAppraisalTypes.sol");

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
    let src = tx_hash_bytes;
    if src.len() == 32 {
        hash_bytes.copy_from_slice(src);
    } else {
        let copy_len = src.len().min(32);
        hash_bytes[32 - copy_len..].copy_from_slice(&src[src.len() - copy_len..]);
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
