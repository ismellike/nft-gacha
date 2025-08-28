use crate::bindings::host::get_evm_chain_config;
use alloy_primitives::{Address, U256};
use alloy_provider::network::Ethereum;
use alloy_sol_types::sol;
use anyhow::{anyhow, Result};
use wavs_wasi_utils::evm::new_evm_provider;

// Generate sol! macro from the actual ERC721.json ABI file
sol!(
    #[sol(rpc)]
    ERC721,
    "../../../contracts/out/ERC721.sol/ERC721.json"
);

#[derive(Debug)]
pub struct ERC721Client;

impl ERC721Client {
    pub fn new() -> Self {
        Self
    }

    /// Query the tokenURI from an ERC721 contract using WAVS chain config and generated contract instance
    pub async fn get_token_uri(
        &self,
        chain: &str,
        contract_address: &str,
        token_id: &str,
    ) -> Result<String> {
        // Get chain configuration from WAVS host bindings
        let chain_config = get_evm_chain_config(chain)
            .ok_or_else(|| anyhow!("Chain config for {} not found", chain))?;

        // Get HTTP endpoint from chain config
        let endpoint = chain_config
            .http_endpoint
            .ok_or_else(|| anyhow!("HTTP endpoint for {} not found", chain))?;

        // Create provider using WAVS utilities
        let provider = new_evm_provider::<Ethereum>(endpoint);

        // Parse contract address and token ID
        let contract_addr = contract_address
            .parse::<Address>()
            .map_err(|e| anyhow!("Failed to parse contract address: {}", e))?;

        let token_id_u256 = U256::from_str_radix(token_id.trim_start_matches("0x"), 16)
            .map_err(|e| anyhow!("Failed to parse token ID: {}", e))?;

        // Create ERC721 contract instance using the generated sol! types
        let contract = ERC721::new(contract_addr, provider);

        // Call the tokenURI function using the contract instance
        let result = contract
            .tokenURI(token_id_u256)
            .call()
            .await
            .map_err(|e| anyhow!("Contract call failed: {}", e))?;

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let client = ERC721Client::new();
        // Just test that the client can be created
        assert_eq!(format!("{:?}", client), "ERC721Client");
    }

    #[test]
    fn test_sol_macro_generation() {
        // Test that the sol! macro generates the expected types
        let token_id = U256::from(123);
        let call = ERC721::tokenURICall { tokenId: token_id };

        // Verify the call can be ABI encoded
        let encoded = alloy_sol_types::SolCall::abi_encode(&call);
        assert!(!encoded.is_empty());

        // Verify it starts with the tokenURI function selector (0xc87b56dd)
        assert_eq!(&encoded[0..4], &[0xc8, 0x7b, 0x56, 0xdd]);
    }
}
