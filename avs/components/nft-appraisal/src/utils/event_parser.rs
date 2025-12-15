use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use wavs_wasi_utils::decode_event_log_data;

use crate::wavs::types::events::TriggerDataEvmContractEvent;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppraisalRequest {
    pub chain: String,
    pub contract_address: String,
    pub token_id: String,
}

pub struct EventParser;

impl EventParser {
    pub fn parse_appraisal_request(
        event: &TriggerDataEvmContractEvent,
    ) -> Result<AppraisalRequest> {
        // Extract chain from event
        let chain = event.chain.clone();

        // Decode event data using WAVS pattern to get NFT contract address and token ID
        let crate::AppraisalRequested {
            nftContract,
            tokenId,
        } = decode_event_log_data!(event.log.data.clone())?;

        // Convert address to hex string
        let contract_address = format!("0x{:x}", nftContract);

        // Convert U256 to hex string
        let token_id = format!("0x{:x}", tokenId);

        let request = AppraisalRequest {
            chain,
            contract_address,
            token_id,
        };

        Self::validate_request(&request)?;

        Ok(request)
    }

    fn validate_request(request: &AppraisalRequest) -> Result<()> {
        if request.chain.trim().is_empty() {
            return Err(anyhow!("Chain cannot be empty"));
        }

        if request.contract_address.trim().is_empty() {
            return Err(anyhow!("Contract address cannot be empty"));
        }

        if request.token_id.trim().is_empty() {
            return Err(anyhow!("Token ID cannot be empty"));
        }

        Ok(())
    }
}
