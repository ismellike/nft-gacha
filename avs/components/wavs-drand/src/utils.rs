use alloy_provider::{network::Ethereum, Provider};
use alloy_rpc_types::Block;
use anyhow::anyhow;
use wavs_wasi_utils::evm::new_evm_provider;

use crate::bindings::{host::EvmChainConfig, wavs::types::chain::EvmAddress};

impl From<EvmAddress> for alloy_primitives::Address {
    fn from(addr: EvmAddress) -> Self {
        alloy_primitives::Address::from_slice(&addr.raw_bytes)
    }
}

pub(crate) async fn get_evm_block(
    chain_config: EvmChainConfig,
    chain_name: String,
    block_number: u64,
) -> anyhow::Result<Block> {
    let endpoint = chain_config
        .http_endpoint
        .ok_or(anyhow!("Http endpoint for {0} not found", chain_name))?;
    let provider = new_evm_provider::<Ethereum>(endpoint);

    let block = provider
        .get_block_by_number(alloy_rpc_types::BlockNumberOrTag::Number(block_number))
        .await?
        .ok_or(anyhow!(
            "Block not found at height {0} for chain {1}",
            block_number,
            chain_name
        ))?;

    Ok(block)
}
