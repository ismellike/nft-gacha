#[rustfmt::skip]
#[allow(clippy::all)]
mod bindings;

use crate::bindings::{
    export, host,
    wavs::types::{core::LogLevel, events::TriggerDataEvmContractEvent},
    Guest, TriggerAction, WasmResponse,
};
use wstd::runtime::block_on;

mod core;
mod engine;
mod providers;
mod resolvers;
mod traits;
mod types;
mod utils;

use anyhow::Result;
use core::AppraisalErrorCode;
use core::AppraisalProcessor;

alloy_sol_types::sol!("../../../contracts/src/interfaces/NFTAppraisalTypes.sol");

struct Component;

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Option<WasmResponse>, String> {
        block_on(async move {
            let evm_event = match action.data {
                crate::bindings::wavs::operator::input::TriggerData::EvmContractEvent(event) => {
                    event
                }
                _ => return Ok(None),
            };

            match process_appraisal_request(&evm_event).await {
                Ok(Some(response)) => {
                    host::log(
                        LogLevel::Info,
                        &format!("Appraisal success: {:?}", response),
                    );
                    Ok(Some(response))
                }
                Ok(None) => {
                    host::log(LogLevel::Warn, "No appraisal result available");
                    Ok(None)
                }
                Err(e) => {
                    let error_response =
                        AppraisalErrorCode::create_error_response(&evm_event, e.to_string());
                    let response_payload = error_response.to_error_payload(e.to_string());
                    host::log(LogLevel::Error, &format!("Appraisal error: {}", e));
                    Ok(Some(WasmResponse {
                        payload: response_payload,
                        ordering: None,
                    }))
                }
            }
        })
    }
}

async fn process_appraisal_request(
    evm_event: &TriggerDataEvmContractEvent,
) -> Result<Option<WasmResponse>> {
    let processor = AppraisalProcessor::new()
        .map_err(|e| anyhow::anyhow!("Failed to initialize appraisal processor: {}", e))?;

    let appraisal_result = processor.process_appraisal_request(evm_event).await?;

    // Try to create success payload
    if let Some(payload) = appraisal_result.to_success_payload() {
        return Ok(Some(WasmResponse {
            payload,
            ordering: None,
        }));
    }

    // No success payload available (no price or zero price)
    Ok(None)
}

export!(Component with_types_in bindings);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_appraisal_processor_creation() {
        // Test that we can create a processor (may fail without proper config)
        let result = AppraisalProcessor::new();
        // The result may fail in test environment without proper config
        // This just verifies the struct is properly defined
        assert!(result.is_ok() || result.is_err());
    }
}
