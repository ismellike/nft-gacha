use crate::wavs::operator::input::TriggerData;
use crate::wavs::types::{core::LogLevel, events::TriggerDataEvmContractEvent};
use wstd::runtime::block_on;

mod core;
mod providers;
mod resolvers;
mod traits;
mod types;
mod utils;

use anyhow::Result;
use core::AppraisalErrorCode;
use core::AppraisalProcessor;

wit_bindgen::generate!({
    path: "../../wit-definitions/operator/wit",
    world: "wavs-world",
    generate_all,
    with: {
        "wasi:io/poll@0.2.0": wasip2::io::poll
    },
    features: ["tls"]
});

alloy_sol_types::sol!("../../contracts/src/interfaces/NFTAppraisalTypes.sol");

struct Component;

impl Guest for Component {
    fn run(action: TriggerAction) -> std::result::Result<Vec<WasmResponse>, String> {
        block_on(async move {
            let evm_event = match action.data {
                TriggerData::EvmContractEvent(event) => event,
                _ => return Ok(vec![]),
            };

            match process_appraisal_request(&evm_event).await {
                Ok(response) => {
                    if response.is_empty() {
                        host::log(LogLevel::Warn, "No appraisal result available");
                    } else {
                        host::log(
                            LogLevel::Info,
                            &format!("Appraisal success: {:?}", response),
                        );
                    }
                    Ok(response)
                }
                Err(e) => {
                    let error_response =
                        AppraisalErrorCode::create_error_response(&evm_event, e.to_string());
                    let response_payload = error_response.to_error_payload(e.to_string());
                    host::log(LogLevel::Error, &format!("Appraisal error: {}", e));
                    Ok(vec![WasmResponse {
                        payload: response_payload,
                        ordering: None,
                        event_id_salt: None,
                    }])
                }
            }
        })
    }
}

async fn process_appraisal_request(
    evm_event: &TriggerDataEvmContractEvent,
) -> Result<Vec<WasmResponse>> {
    let processor = AppraisalProcessor::new()
        .map_err(|e| anyhow::anyhow!("Failed to initialize appraisal processor: {}", e))?;

    let appraisal_result = processor.process_appraisal_request(evm_event).await?;

    // Try to create success payload
    if let Some(payload) = appraisal_result.to_success_payload() {
        return Ok(vec![WasmResponse {
            payload,
            ordering: None,
            event_id_salt: None,
        }]);
    }

    // No success payload available (no price or zero price)
    Ok(vec![])
}

export!(Component);
