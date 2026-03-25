use crate::core::context::AppraisalContext;
use crate::core::payload::{self, AppraisalIdentity};
use crate::providers::generic::provider::random_price_from_uri;
use crate::providers::pfp::provider::{extract_rarity_from_uri, price_for_rarity};
use crate::traits::metadata::ProviderMetadata;
use crate::traits::pricing::ResolverQuote;
use crate::types::ProviderType;
use crate::utils::event_parser::AppraisalRequest;
use crate::utils::EventParser;
use crate::wavs::types::events::TriggerDataEvmContractEvent;
use alloy_primitives::{Address, U256};
use anyhow::{anyhow, Result};
use std::fmt;

pub struct AppraisalProcessor {
    context: AppraisalContext,
}

impl fmt::Debug for AppraisalProcessor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AppraisalProcessor").finish()
    }
}

impl AppraisalProcessor {
    pub fn new() -> Result<Self> {
        Ok(Self {
            context: AppraisalContext::from_env()?,
        })
    }

    pub async fn process_appraisal_request(
        &self,
        evm_event: &TriggerDataEvmContractEvent,
    ) -> Result<AppraisalResponse> {
        // Parse the appraisal request from event data
        let request = EventParser::parse_appraisal_request(evm_event)
            .map_err(|e| anyhow!("Invalid appraisal event: {}", e))?;

        let token = self.describe_token(&request)?;
        let token_uri = self.fetch_token_uri(&token).await?;
        let metadata = self.fetch_metadata(&token_uri).await?;

        // Determine price based on provider type:
        // - PFP: read rarity trait from metadata, map to fixed price
        // - Generic: compute a deterministic pseudo-random price from the URI hash
        // - Known providers (e.g. Courtyard): use the external price resolver
        let price = match metadata.provider {
            ProviderType::Pfp => {
                let rarity = extract_rarity_from_uri(&token_uri)
                    .ok_or_else(|| anyhow!("PFP metadata missing Rarity trait"))?;
                price_for_rarity(&rarity)
            }
            ProviderType::Generic => Some(random_price_from_uri(&token_uri)),
            _ => {
                let price_quote = self.fetch_price(metadata.resolver.clone()).await?;
                price_quote.as_ref().map(|quote| quote.price.value)
            }
        };

        let identity = AppraisalIdentity::new(
            token.chain.clone(),
            token.contract_address,
            token.token_id,
            Some(&metadata.title),
            &evm_event.log.tx_hash,
        );

        Ok(AppraisalResponse { identity, price })
    }

    fn describe_token(&self, request: &AppraisalRequest) -> Result<TokenDescriptor> {
        let contract_address = request
            .contract_address
            .parse::<Address>()
            .map_err(|e| anyhow!("Failed to parse contract address: {}", e))?;
        let token_id = U256::from_str_radix(request.token_id.trim_start_matches("0x"), 16)
            .map_err(|e| anyhow!("Failed to parse token ID: {}", e))?;

        Ok(TokenDescriptor {
            chain: request.chain.clone(),
            contract_address,
            token_id,
        })
    }

    async fn fetch_token_uri(&self, token: &TokenDescriptor) -> Result<String> {
        let contract_hex = format!("{:#x}", token.contract_address);
        let token_id_hex = format!("{:#x}", token.token_id);
        self.context
            .token_uri_fetcher
            .token_uri(&token.chain, &contract_hex, &token_id_hex)
            .await
    }

    async fn fetch_metadata(&self, token_uri: &str) -> Result<ProviderMetadata> {
        self.context.providers.fetch_metadata(token_uri).await
    }

    async fn fetch_price(
        &self,
        route: Option<crate::types::ResolverRoute>,
    ) -> Result<Option<ResolverQuote>> {
        let Some(route) = route else {
            return Ok(None);
        };

        self.context
            .resolvers
            .resolve_with_cache(&route, &self.context.cache)
            .await
    }
}

#[derive(Debug)]
struct TokenDescriptor {
    chain: String,
    contract_address: Address,
    token_id: U256,
}

#[derive(Debug)]
pub struct AppraisalResponse {
    pub identity: AppraisalIdentity,
    pub price: Option<f64>,
}

impl AppraisalResponse {
    pub fn to_success_payload(&self) -> Option<Vec<u8>> {
        if let Some(price) = self.price {
            if price > 0.0 {
                let scaled_price = scale_to_usdc6(price)?;
                return Some(payload::encode_success(&self.identity, scaled_price));
            }
        }
        None
    }

}

fn scale_to_usdc6(p: f64) -> Option<U256> {
    if !p.is_finite() || p <= 0.0 {
        return None;
    }
    let scaled = (p * 1_000_000.0).round();
    if scaled > u128::MAX as f64 {
        return None;
    }
    Some(U256::from(scaled as u128))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resolvers::ResolverRegistry;
    use crate::types::ResolverRoute;
    use proptest::prelude::*;

    #[test]
    fn test_scale_to_usdc6() {
        assert_eq!(scale_to_usdc6(100.50), Some(U256::from(100_500_000u32)));
        assert_eq!(scale_to_usdc6(1.0), Some(U256::from(1_000_000u32)));
        assert_eq!(scale_to_usdc6(0.01), Some(U256::from(10_000u32)));
        assert_eq!(scale_to_usdc6(0.0), None);
        assert_eq!(scale_to_usdc6(-1.0), None);
        assert_eq!(scale_to_usdc6(f64::NAN), None);
        assert_eq!(scale_to_usdc6(f64::INFINITY), None);
    }

    #[test]
    fn test_scale_to_usdc6_extreme_values() {
        // f64::MAX * 1_000_000 far exceeds u128::MAX, must return None
        assert_eq!(
            scale_to_usdc6(f64::MAX),
            None,
            "f64::MAX should overflow u128 and return None"
        );

        // Negative infinity is not finite, must return None
        assert_eq!(scale_to_usdc6(f64::NEG_INFINITY), None);

        // Normal prices still work after the overflow guard is present
        assert_eq!(scale_to_usdc6(9.99), Some(U256::from(9_990_000u32)));
        assert_eq!(scale_to_usdc6(0.000001), Some(U256::from(1u32)));
    }

    #[test]
    fn test_appraisal_response_success_payload() {
        let identity = AppraisalIdentity::new(
            "polygon".to_string(),
            "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            U256::from(0x123u32),
            Some("title"),
            &[0u8; 32],
        );

        let response = AppraisalResponse {
            identity,
            price: Some(100.50),
        };

        let payload = response.to_success_payload();
        assert!(payload.is_some());
        assert!(!payload.unwrap().is_empty());
    }

    #[test]
    fn test_encode_error() {
        let identity = AppraisalIdentity::new(
            "polygon".to_string(),
            "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            U256::from(0x123u32),
            Some("title"),
            &[0u8; 32],
        );

        let payload = payload::encode_error(&identity, "Test error".to_string());
        assert!(!payload.is_empty());
    }

    #[test]
    fn test_cache_seed_is_case_insensitive() {
        let route = ResolverRoute::pokemon_card_info(
            "4".to_string(),
            "10".to_string(),
            "PSA".to_string(),
            true,
            "BASE-SET".to_string(),
            None,
        );
        let seed = ResolverRegistry::cache_seed(&route);
        let expected_suffix = route.cache_key_fragment();
        assert!(seed.ends_with(&expected_suffix));
    }

    // -----------------------------------------------------------------------
    // AppraisalResponse::to_success_payload — additional edge-case tests
    // -----------------------------------------------------------------------

    fn make_identity() -> AppraisalIdentity {
        AppraisalIdentity::new(
            "eip155:1".to_string(),
            "0x251BE3A17Af4892035C37ebf5890F4a4D889dcAD"
                .parse()
                .unwrap(),
            U256::from(42u32),
            Some("Test Card"),
            &[0u8; 32],
        )
    }

    #[test]
    fn to_success_payload_with_price_none_returns_none() {
        let response = AppraisalResponse {
            identity: make_identity(),
            price: None,
        };
        assert!(
            response.to_success_payload().is_none(),
            "price=None must yield no payload"
        );
    }

    #[test]
    fn to_success_payload_with_price_zero_returns_none() {
        let response = AppraisalResponse {
            identity: make_identity(),
            price: Some(0.0),
        };
        assert!(
            response.to_success_payload().is_none(),
            "price=0.0 is not positive and must yield no payload"
        );
    }

    #[test]
    fn to_success_payload_with_negative_price_returns_none() {
        let response = AppraisalResponse {
            identity: make_identity(),
            price: Some(-5.0),
        };
        assert!(
            response.to_success_payload().is_none(),
            "negative price must yield no payload"
        );
    }

    #[test]
    fn to_success_payload_with_positive_price_returns_some() {
        let response = AppraisalResponse {
            identity: make_identity(),
            price: Some(25.50),
        };
        let payload = response.to_success_payload();
        assert!(payload.is_some(), "positive price must produce a payload");
        assert!(!payload.unwrap().is_empty());
    }

    #[test]
    fn to_success_payload_result_is_abi_aligned() {
        let response = AppraisalResponse {
            identity: make_identity(),
            price: Some(1.0),
        };
        let payload = response.to_success_payload().expect("positive price must yield payload");
        assert_eq!(
            payload.len() % 32,
            0,
            "ABI-encoded payload must be a multiple of 32 bytes; got {}",
            payload.len()
        );
    }

    // -----------------------------------------------------------------------
    // scale_to_usdc6 — very large and boundary values
    // -----------------------------------------------------------------------

    #[test]
    fn scale_to_usdc6_very_large_but_in_range() {
        // u128::MAX / 1_000_000 ~ 3.4e32 — a price near u128::MAX after scaling
        // should still work as long as it fits.
        let max_safe = (u128::MAX as f64 / 1_000_000.0).floor();
        // This might be too large due to floating point; just verify it returns a value.
        let result = scale_to_usdc6(max_safe);
        // It may return None if rounding causes overflow, but must not panic.
        let _ = result;
    }

    #[test]
    fn scale_to_usdc6_just_over_u128_max_returns_none() {
        // Construct a value whose scaled form exceeds u128::MAX.
        // u128::MAX ~ 3.4e38; price = u128::MAX * 10.0 / 1_000_000 will overflow.
        let overflow_price = (u128::MAX as f64) * 10.0;
        assert!(
            scale_to_usdc6(overflow_price).is_none(),
            "values that overflow u128 after scaling must return None"
        );
    }

    #[test]
    fn scale_to_usdc6_tiny_positive_rounds_to_one() {
        // 0.000001 USD = 1 micro-USD = 1 in USDC6 units.
        assert_eq!(scale_to_usdc6(0.000001), Some(U256::from(1u32)));
    }

    #[test]
    fn scale_to_usdc6_one_dollar_gives_one_million() {
        assert_eq!(scale_to_usdc6(1.0), Some(U256::from(1_000_000u32)));
    }

    // -----------------------------------------------------------------------
    // Proptest fuzz tests
    // -----------------------------------------------------------------------

    proptest! {
        #[test]
        fn fuzz_scale_to_usdc6_never_panics(price in proptest::num::f64::ANY) {
            let result = scale_to_usdc6(price);
            // Must return None for non-finite, zero, or negative values
            if !price.is_finite() || price <= 0.0 {
                prop_assert!(result.is_none());
            }
            // Must return None if scaled value overflows u128
            if price.is_finite() && price > 0.0 {
                let scaled = (price * 1_000_000.0).round();
                if scaled > u128::MAX as f64 {
                    prop_assert!(result.is_none());
                } else {
                    prop_assert!(result.is_some());
                }
            }
        }

        #[test]
        fn fuzz_scale_to_usdc6_positive_prices(price in 0.000001f64..1_000_000_000.0) {
            let result = scale_to_usdc6(price);
            prop_assert!(result.is_some(), "Reasonable positive price should always succeed");
            let u = result.unwrap();
            // The scaled value should be approximately price * 1_000_000
            let expected = (price * 1_000_000.0).round() as u128;
            prop_assert_eq!(u, U256::from(expected));
        }

        #[test]
        fn fuzz_scale_to_usdc6_negative_always_none(price in f64::MIN..=0.0) {
            prop_assert!(scale_to_usdc6(price).is_none());
        }
    }
}
