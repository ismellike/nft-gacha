use serde::Deserialize;
use wavs_wasi_utils::http::{fetch_json, http_request_get};
use wstd::runtime::block_on;

use crate::world::host::{self, LogLevel};

pub const ETHERSCAN_API_KEY_ENV: &str = "WAVS_ENV_ETHERSCAN_API_KEY";

#[derive(Deserialize)]
struct EtherscanGasOracleResponse {
    result: GasOracleResult,
}

#[derive(Deserialize)]
pub(crate) struct GasOracleResult {
    #[serde(rename = "SafeGasPrice")]
    safe_gas_price: String,
    #[serde(rename = "ProposeGasPrice")]
    propose_gas_price: String,
    #[serde(rename = "FastGasPrice")]
    fast_gas_price: String,
}

/// Select the gas price string from the oracle result based on the strategy.
///
/// Returns `(selected_price_str, used_fallback)` where `used_fallback` is true
/// when the strategy was unrecognised and "standard" was substituted.
pub(crate) fn select_gas_price_str<'a>(
    result: &'a GasOracleResult,
    strategy: &str,
) -> (&'a str, bool) {
    match strategy {
        "fast" => (&result.fast_gas_price, false),
        "slow" | "safe" => (&result.safe_gas_price, false),
        "standard" => (&result.propose_gas_price, false),
        _unknown => (&result.propose_gas_price, true),
    }
}

/// Parse a Gwei price string and convert it to Wei, enforcing sanity bounds.
///
/// Bounds: [0.1, 10_000] Gwei inclusive.
pub(crate) fn gwei_str_to_wei(gwei_str: &str) -> Result<u128, String> {
    let gwei: f64 = gwei_str
        .parse()
        .map_err(|e| format!("Invalid gas price from Etherscan: {e}"))?;

    if !(0.1..=10000.0).contains(&gwei) {
        return Err(format!(
            "Unreasonable gas price from Etherscan: {gwei} Gwei"
        ));
    }

    Ok((gwei * 1_000_000_000.0).round() as u128)
}

pub fn get_gas_price() -> Result<Option<u128>, String> {
    let api_key = match std::env::var(ETHERSCAN_API_KEY_ENV) {
        Ok(key) if !key.is_empty() => key,
        _ => return Ok(None),
    };

    let strategy = host::config_var("gas_strategy").unwrap_or_else(|| "standard".to_string());

    host::log(
        LogLevel::Info,
        &format!("Fetching gas price from Etherscan with strategy: {strategy}"),
    );

    let url =
        format!("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={api_key}");

    let response: EtherscanGasOracleResponse = block_on(async move {
        fetch_json(http_request_get(&url).map_err(|e| format!("Failed to create request: {e}"))?)
            .await
            .map_err(|e| format!("Failed to fetch gas price from Etherscan: {e}"))
    })?;

    let (gas_price_str, used_fallback) = select_gas_price_str(&response.result, &strategy);

    if used_fallback {
        host::log(
            LogLevel::Warn,
            &format!("Unknown gas_strategy '{strategy}', falling back to 'standard'"),
        );
    }

    let gas_price_wei = gwei_str_to_wei(gas_price_str)?;
    let gas_price_gwei: f64 = gas_price_str.parse().unwrap_or(0.0);

    host::log(
        LogLevel::Info,
        &format!("Successfully fetched gas price: {gas_price_gwei} Gwei ({gas_price_wei} Wei)"),
    );

    Ok(Some(gas_price_wei))
}

#[cfg(test)]
mod tests {
    use super::*;

    // Helper to build a GasOracleResult with explicit field values.
    fn make_result(safe: &str, propose: &str, fast: &str) -> GasOracleResult {
        GasOracleResult {
            safe_gas_price: safe.to_string(),
            propose_gas_price: propose.to_string(),
            fast_gas_price: fast.to_string(),
        }
    }

    // --- select_gas_price_str ---

    #[test]
    fn strategy_fast_selects_fast_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "fast");
        assert_eq!(price, "30");
        assert!(!fallback);
    }

    #[test]
    fn strategy_slow_selects_safe_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "slow");
        assert_eq!(price, "10");
        assert!(!fallback);
    }

    #[test]
    fn strategy_safe_selects_safe_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "safe");
        assert_eq!(price, "10");
        assert!(!fallback);
    }

    #[test]
    fn strategy_standard_selects_propose_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "standard");
        assert_eq!(price, "20");
        assert!(!fallback);
    }

    #[test]
    fn unknown_strategy_falls_back_to_propose_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "turbo");
        assert_eq!(price, "20");
        assert!(fallback, "unknown strategy must set the fallback flag");
    }

    #[test]
    fn empty_strategy_falls_back_to_propose_gas_price() {
        let result = make_result("10", "20", "30");
        let (price, fallback) = select_gas_price_str(&result, "");
        assert_eq!(price, "20");
        assert!(fallback);
    }

    // --- gwei_str_to_wei: conversion ---

    #[test]
    fn one_gwei_converts_to_one_billion_wei() {
        assert_eq!(gwei_str_to_wei("1").unwrap(), 1_000_000_000);
    }

    #[test]
    fn ten_gwei_converts_correctly() {
        assert_eq!(gwei_str_to_wei("10").unwrap(), 10_000_000_000);
    }

    #[test]
    fn fractional_gwei_converts_correctly() {
        // 1.5 Gwei = 1_500_000_000 Wei
        assert_eq!(gwei_str_to_wei("1.5").unwrap(), 1_500_000_000);
    }

    #[test]
    fn minimum_valid_gwei_boundary() {
        // Exactly 0.1 Gwei must pass
        assert!(gwei_str_to_wei("0.1").is_ok());
    }

    #[test]
    fn maximum_valid_gwei_boundary() {
        // Exactly 10000 Gwei must pass
        assert!(gwei_str_to_wei("10000").is_ok());
    }

    // --- gwei_str_to_wei: bounds rejection ---

    #[test]
    fn zero_gwei_is_rejected() {
        let err = gwei_str_to_wei("0").unwrap_err();
        assert!(
            err.contains("Unreasonable"),
            "expected bounds error, got: {err}"
        );
    }

    #[test]
    fn below_minimum_gwei_is_rejected() {
        let err = gwei_str_to_wei("0.05").unwrap_err();
        assert!(err.contains("Unreasonable"), "got: {err}");
    }

    #[test]
    fn above_maximum_gwei_is_rejected() {
        let err = gwei_str_to_wei("10001").unwrap_err();
        assert!(err.contains("Unreasonable"), "got: {err}");
    }

    #[test]
    fn negative_gwei_is_rejected() {
        let err = gwei_str_to_wei("-1").unwrap_err();
        assert!(err.contains("Unreasonable"), "got: {err}");
    }

    // --- gwei_str_to_wei: parse errors ---

    #[test]
    fn non_numeric_string_is_rejected() {
        let err = gwei_str_to_wei("not_a_number").unwrap_err();
        assert!(
            err.contains("Invalid gas price"),
            "expected parse error, got: {err}"
        );
    }

    #[test]
    fn empty_string_is_rejected() {
        let err = gwei_str_to_wei("").unwrap_err();
        assert!(err.contains("Invalid gas price"), "got: {err}");
    }

    // --- EtherscanGasOracleResponse deserialization ---

    #[test]
    fn response_deserializes_from_json() {
        let json = r#"{
            "status": "1",
            "message": "OK",
            "result": {
                "LastBlock": "12345678",
                "SafeGasPrice": "10",
                "ProposeGasPrice": "15",
                "FastGasPrice": "25",
                "suggestBaseFee": "8.123456789",
                "gasUsedRatio": "0.5"
            }
        }"#;
        let resp: EtherscanGasOracleResponse = serde_json::from_str(json).unwrap();
        assert_eq!(resp.result.safe_gas_price, "10");
        assert_eq!(resp.result.propose_gas_price, "15");
        assert_eq!(resp.result.fast_gas_price, "25");
    }

    #[test]
    fn response_deserialization_fails_on_missing_result() {
        let json = r#"{"status": "1", "message": "OK"}"#;
        assert!(serde_json::from_str::<EtherscanGasOracleResponse>(json).is_err());
    }
}
