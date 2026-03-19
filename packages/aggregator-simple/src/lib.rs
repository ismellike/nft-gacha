mod gas_oracle;
mod utils;
mod world;

use wavs_wasi_utils::impl_u128_conversions;

use world::{
    host,
    wavs::aggregator::input::AggregatorInput,
    wavs::aggregator::output::{AggregatorAction, EvmSubmitAction, SubmitAction, TimerAction},
    wavs::types::chain::{AnyTxHash, EvmAddress},
    wavs::types::core::{Duration, LogLevel, U128},
    wavs::types::service::Submit,
    Guest,
};

impl_u128_conversions!(U128);

struct Component;

impl Guest for Component {
    fn process_input(input: AggregatorInput) -> Result<Vec<AggregatorAction>, String> {
        let timer_delay_secs = host::config_var("timer_delay_secs")
            .map(|delay_str| {
                delay_str
                    .parse()
                    .map_err(|e| format!("Failed to parse timer_delay_secs: {e}"))
            })
            .transpose()?;

        match timer_delay_secs {
            Some(secs) => {
                // Use timer delay if specified
                let timer_action = TimerAction {
                    delay: Duration { secs },
                };
                Ok(vec![AggregatorAction::Timer(timer_action)])
            }
            None => {
                // No timer delay - process immediately (skip tx validation)
                process_submission(input, false)
            }
        }
    }

    fn handle_timer_callback(input: AggregatorInput) -> Result<Vec<AggregatorAction>, String> {
        process_submission(input, true)
    }

    fn handle_submit_callback(
        _input: AggregatorInput,
        tx_result: Result<AnyTxHash, String>,
    ) -> Result<(), String> {
        match tx_result {
            Ok(hash) => {
                let tx_desc = match &hash {
                    AnyTxHash::Evm(bytes) => {
                        format!("evm:0x{}", alloy_primitives::hex::encode(bytes))
                    }
                    AnyTxHash::Cosmos(hash_str) => {
                        format!("cosmos:{}", hash_str)
                    }
                };
                host::log(
                    LogLevel::Info,
                    &format!("Submit succeeded: {}", tx_desc),
                );
                Ok(())
            }
            Err(e) => {
                host::log(
                    LogLevel::Error,
                    &format!("Submit failed: {}", e),
                );
                Ok(())
            }
        }
    }
}

fn process_submission(input: AggregatorInput, validate_tx: bool) -> Result<Vec<AggregatorAction>, String> {
    let workflow = host::get_workflow().workflow;

    let submit_config = match workflow.submit {
        Submit::None => {
            return Err("Workflow has no submit configuration".to_string());
        }
        Submit::Aggregator(aggregator_submit) => aggregator_submit.component.config,
    };

    if submit_config.is_empty() {
        return Err("Workflow submit component config is empty".to_string());
    }

    let mut actions = Vec::new();

    if validate_tx && !utils::is_valid_tx(input.trigger_action.data)? {
        return Ok(actions);
    }

    // Get gas price from Etherscan if configured once before the loop.
    // Will fail the entire operation if API key is configured but fetching fails.
    let gas_price = gas_oracle::get_gas_price()?;

    for (chain_key, service_handler_address) in submit_config {
        if host::get_evm_chain_config(&chain_key).is_some() {
            let address: alloy_primitives::Address =
                service_handler_address.parse().map_err(|e| {
                    format!(
                        "Failed to parse address for '{chain_key}': {service_handler_address} {e}"
                    )
                })?;

            let submit_action = SubmitAction::Evm(EvmSubmitAction {
                chain: chain_key.to_string(),
                address: EvmAddress {
                    raw_bytes: address.to_vec(),
                },
                gas_price: gas_price.map(|x| x.into()),
            });

            actions.push(AggregatorAction::Submit(submit_action));
        } else if host::get_cosmos_chain_config(&chain_key).is_some() {
            return Err(format!(
                "Cosmos chain '{chain_key}' is not yet supported"
            ));
        } else {
            // Not all config values are chains, skip unknown keys
            continue;
        }
    }

    Ok(actions)
}

export_aggregator_world!(Component);
