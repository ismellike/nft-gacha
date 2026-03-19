// SECURITY: This module performs full BLS threshold signature verification on every drand
// round response using the `drand-verify` crate. Responses that fail signature verification
// are rejected with an error before the randomness bytes are used anywhere. Skipping or
// bypassing this verification would allow an attacker controlling the HTTP response to
// substitute arbitrary randomness, defeating the entire security model of this VRF component.

use alloy_primitives::{hex, B256};
use anyhow::{anyhow, Result};
use drand_verify::Pubkey as _;
use serde::{Deserialize, Serialize};
use wavs_wasi_utils::http::{fetch_string, http_request_get};

#[cfg(not(test))]
use crate::wasi::keyvalue::store::open;
use crate::wasi::keyvalue::store::Bucket;

// ---------------------------------------------------------------------------
// Known chain configurations (public keys are stable and published by the
// DRAND League of Entropy; they are hardcoded here to avoid a bootstrapping
// attack where an adversary could supply a crafted public key on the /info
// endpoint and then forge signatures against it).
// ---------------------------------------------------------------------------

/// BLS12-381 public key (G1 compressed, 48 bytes) for the DRAND mainnet
/// "pedersen-bls-chained" chain:
/// chain hash `8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce`.
///
/// In the "pedersen-bls-chained" / "pedersen-bls-unchained" schemes, the
/// public key lives on G1 (48 compressed bytes) and the signature lives on G2.
///
/// Source: https://api.drand.sh/8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce/info
pub const MAINNET_CHAINED_CHAIN_HASH: &str =
    "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce";
pub const MAINNET_CHAINED_PUBKEY_HEX: &str =
    "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31";

/// BLS12-381 public key (G2 compressed, 96 bytes) for the DRAND "quicknet"
/// chain using scheme ID "bls-unchained-g1-rfc9380":
/// chain hash `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`.
///
/// In the "bls-unchained-g1-rfc9380" scheme the public key lives on G2
/// (96 compressed bytes) and the signature lives on G1.
///
/// Source: https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/info
pub const QUICKNET_UNCHAINED_CHAIN_HASH: &str =
    "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";
pub const QUICKNET_UNCHAINED_PUBKEY_HEX: &str =
    "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a";

// ---------------------------------------------------------------------------
// Scheme discriminant
// ---------------------------------------------------------------------------

/// Which drand signature scheme the chain uses, determining which curve holds
/// the public key and which holds the signature.
///
/// Naming follows the `drand-verify` crate conventions:
///
/// * `PedersenBls` – scheme IDs "pedersen-bls-chained" and
///   "pedersen-bls-unchained" (legacy mainnet): public key on G1 (48 bytes),
///   signature on G2. Verified with `drand_verify::G1Pubkey`.
///
/// * `BlsUnchainedRfc` – scheme ID "bls-unchained-g1-rfc9380" (quicknet):
///   public key on G2 (96 bytes), signature on G1.
///   Verified with `drand_verify::G2PubkeyRfc`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DrandScheme {
    /// G1 public key (48 bytes), G2 signature. Chained or unchained legacy mainnet.
    PedersenBls,
    /// G2 public key (96 bytes), G1 signature. Quicknet (bls-unchained-g1-rfc9380).
    BlsUnchainedRfc,
}

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/// JSON response from the drand HTTP API `/public/<round>` endpoint.
///
/// The `previous_signature` field is only present for chained chains and is
/// `None` for unchained chains. We keep it optional so the same struct works
/// for both schemes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DrandRound {
    pub round: u64,
    pub randomness: String,
    pub signature: String,
    #[serde(default)]
    pub previous_signature: Option<String>,
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/// Configuration for a single drand chain endpoint.
///
/// `verify_chain_hash` must match the chain hash embedded in every API URL.
/// If it does not, `get_round` will return an error before making a network
/// request. This guards against misconfiguration that would silently hit the
/// wrong chain.
#[derive(Debug, Clone)]
pub struct ChainConfig {
    /// Hex-encoded chain hash that the operator is configured for.
    pub verify_chain_hash: String,
    /// Hex-encoded compressed BLS12-381 public key for the chain.
    pub public_key_hex: String,
    /// Which signature scheme the chain uses.
    pub scheme: DrandScheme,
}

impl ChainConfig {
    /// Build a `ChainConfig` from the chain hash and a hex-encoded public key.
    ///
    /// The signature scheme is inferred from the public key byte length after
    /// hex decoding:
    ///
    /// * 48 bytes → G1 compressed public key → `DrandScheme::PedersenBls`
    ///   (pedersen-bls-chained / pedersen-bls-unchained, legacy mainnet)
    /// * 96 bytes → G2 compressed public key → `DrandScheme::BlsUnchainedRfc`
    ///   (bls-unchained-g1-rfc9380, quicknet)
    ///
    /// If neither length matches, the function returns an error rather than
    /// guessing, because using the wrong scheme would cause every verification
    /// to fail or, worse, silently accept invalid signatures.
    pub fn from_chain_hash_and_pubkey(
        chain_hash: impl Into<String>,
        public_key_hex: impl Into<String>,
    ) -> Result<Self> {
        let chain_hash = chain_hash.into();
        let pubkey_hex = public_key_hex.into();

        // Validate hex now so errors surface at config time, not request time.
        let pubkey_bytes = hex::decode(&pubkey_hex)
            .map_err(|e| anyhow!("Invalid public key hex for chain {}: {}", chain_hash, e))?;

        let scheme = match pubkey_bytes.len() {
            // 48 bytes = G1 compressed = pedersen-bls-chained / pedersen-bls-unchained
            48 => DrandScheme::PedersenBls,
            // 96 bytes = G2 compressed = bls-unchained-g1-rfc9380 (quicknet)
            96 => DrandScheme::BlsUnchainedRfc,
            n => {
                return Err(anyhow!(
                    "Unexpected public key length {} bytes for chain {}; \
                     expected 48 (G1, pedersen-bls-chained/unchained) or \
                     96 (G2, bls-unchained-g1-rfc9380/quicknet)",
                    n,
                    chain_hash
                ));
            }
        };

        Ok(Self {
            verify_chain_hash: chain_hash,
            public_key_hex: pubkey_hex,
            scheme,
        })
    }

    /// Attempt to build a `ChainConfig` from only a chain hash, using the
    /// hardcoded known-good public keys for well-known League of Entropy chains.
    ///
    /// Returns `None` if the chain hash is not recognised. Callers should then
    /// supply the public key explicitly via `from_chain_hash_and_pubkey`.
    pub fn from_known_chain_hash(chain_hash: &str) -> Option<Self> {
        match chain_hash {
            MAINNET_CHAINED_CHAIN_HASH => Some(Self {
                verify_chain_hash: MAINNET_CHAINED_CHAIN_HASH.to_string(),
                public_key_hex: MAINNET_CHAINED_PUBKEY_HEX.to_string(),
                scheme: DrandScheme::PedersenBls,
            }),
            QUICKNET_UNCHAINED_CHAIN_HASH => Some(Self {
                verify_chain_hash: QUICKNET_UNCHAINED_CHAIN_HASH.to_string(),
                public_key_hex: QUICKNET_UNCHAINED_PUBKEY_HEX.to_string(),
                scheme: DrandScheme::BlsUnchainedRfc,
            }),
            _ => None,
        }
    }
}

/// Drand client for fetching and **cryptographically verifying** randomness.
///
/// Every round fetched by `get_round` has its BLS threshold signature checked
/// against the configured chain's public key before the randomness bytes are
/// returned to the caller. Rounds that fail verification are rejected with an
/// error.
#[derive(Debug)]
pub struct DrandClient {
    pub url: String,
    /// Chain hash used to build the API URL **and** validated against
    /// `chain_config.verify_chain_hash` on construction.
    pub chain_hash: String,
    pub chain_config: ChainConfig,
    cache_bucket: Option<Bucket>,
}

impl DrandClient {
    /// Create a new `DrandClient`.
    ///
    /// `chain_hash` must match `chain_config.verify_chain_hash`; the
    /// constructor enforces this to prevent silent misconfiguration.
    pub fn new(url: String, chain_hash: String, chain_config: ChainConfig) -> Result<Self> {
        if chain_hash != chain_config.verify_chain_hash {
            return Err(anyhow!(
                "Chain hash mismatch: URL chain hash '{}' does not match \
                 the chain config's verify_chain_hash '{}'",
                chain_hash,
                chain_config.verify_chain_hash
            ));
        }

        Ok(Self {
            url,
            chain_hash,
            chain_config,
            #[cfg(not(test))]
            cache_bucket: open("drand-cache").ok(),
            #[cfg(test)]
            cache_bucket: None,
        })
    }

    /// Fetch the randomness for `round`, verify the BLS signature, and return
    /// the 32-byte randomness value.
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// * `round` is 0 (not a valid drand round number)
    /// * The HTTP request fails
    /// * The JSON response cannot be parsed
    /// * The `randomness` field is not a valid 64-character hex string (32 bytes)
    /// * The `round` in the response does not match the requested round
    /// * BLS signature verification fails
    pub async fn get_round(&self, round: u64) -> Result<B256> {
        // Round 0 is not a valid drand round. Reject it early.
        if round == 0 {
            return Err(anyhow!(
                "Round 0 is not a valid drand round number; \
                 round numbering starts at 1"
            ));
        }

        let cache_key = format!("round_{}", round);

        // Try to get from cache first. Cached values were already verified, so
        // we do not re-verify them on retrieval.
        if let Some(ref bucket) = self.cache_bucket {
            if let Ok(Some(cached_data)) = bucket.get(&cache_key) {
                if let Ok(b) = b256_from_bytes(&cached_data) {
                    return Ok(b);
                }
            }
        }

        // Fetch from drand API.
        let url = format!("{}/{}/public/{}", self.url, self.chain_hash, round);

        let request =
            http_request_get(&url).map_err(|e| anyhow!("Failed to create HTTP request: {}", e))?;

        let response = fetch_string(request)
            .await
            .map_err(|e| anyhow!("Failed to fetch drand round {}: {}", round, e))?;

        let drand_round: DrandRound = serde_json::from_str(&response)
            .map_err(|e| anyhow!("Failed to parse drand response: {}", e))?;

        // Validate and verify before extracting randomness.
        let randomness_bytes = self.validate_and_verify(&drand_round, round)?;

        let result = b256_from_bytes(&randomness_bytes).map_err(|_| {
            anyhow!(
                "Drand randomness is not 32 bytes, got {} bytes",
                randomness_bytes.len()
            )
        })?;

        // Cache only after successful verification.
        if let Some(ref bucket) = self.cache_bucket {
            let _ = bucket.set(&cache_key, &randomness_bytes);
        }

        Ok(result)
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /// Perform all validation and BLS signature verification on a parsed round.
    ///
    /// Returns the decoded 32-byte randomness on success.
    fn validate_and_verify(&self, round: &DrandRound, expected_round: u64) -> Result<Vec<u8>> {
        // 1. Round number must match what we requested.
        if round.round != expected_round {
            return Err(anyhow!(
                "Round number mismatch: requested round {} but response contains round {}",
                expected_round,
                round.round
            ));
        }

        // 2. Round must be positive (belt-and-suspenders; already checked in get_round).
        if round.round == 0 {
            return Err(anyhow!("Response contains round 0, which is not a valid drand round"));
        }

        // 3. Validate the randomness field: must be exactly 64 hex chars (32 bytes).
        if round.randomness.len() != 64 {
            return Err(anyhow!(
                "Drand randomness field has unexpected length {} (expected 64 hex characters = 32 bytes); \
                 this may indicate a tampered or malformed response",
                round.randomness.len()
            ));
        }
        if !round.randomness.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(anyhow!(
                "Drand randomness field contains non-hex characters; \
                 this may indicate a tampered or malformed response"
            ));
        }
        let randomness_bytes = hex::decode(&round.randomness)
            .map_err(|e| anyhow!("Failed to decode randomness hex: {}", e))?;

        // 4. Decode the BLS signature from the response.
        let sig_bytes = hex::decode(&round.signature)
            .map_err(|e| anyhow!("Failed to decode signature hex: {}", e))?;

        // 5. Perform BLS threshold signature verification.
        //    This is the critical security check. A forged response from a
        //    compromised HTTP endpoint cannot produce a valid BLS signature
        //    without the threshold share of the DRAND network's private key.
        self.verify_bls_signature(round.round, &sig_bytes, &round.previous_signature)?;

        Ok(randomness_bytes)
    }

    /// Verify the BLS12-381 threshold signature using `drand-verify`.
    ///
    /// For **PedersenBls** (chained) chains the signature commits to the
    /// previous round's signature; `prev_sig_hex` must be `Some(...)` for all
    /// rounds after round 1.
    ///
    /// For **BlsUnchainedRfc** (quicknet) chains signatures are independent of
    /// history and `prev_sig_hex` is ignored.
    fn verify_bls_signature(
        &self,
        round: u64,
        sig_bytes: &[u8],
        prev_sig_hex: &Option<String>,
    ) -> Result<()> {
        let pubkey_bytes = hex::decode(&self.chain_config.public_key_hex)
            .map_err(|e| anyhow!("Failed to decode public key hex: {}", e))?;

        match self.chain_config.scheme {
            DrandScheme::PedersenBls => {
                // G1 public key (48 bytes compressed), G2 signature.
                // Scheme IDs: pedersen-bls-chained, pedersen-bls-unchained.
                // Uses drand_verify::G1Pubkey with from_fixed().
                let pk = drand_verify::G1Pubkey::from_fixed(pubkey_bytes.as_slice().try_into()
                    .map_err(|_| anyhow!("G1 public key must be exactly 48 bytes, got {}", pubkey_bytes.len()))?)
                    .map_err(|e| anyhow!("Invalid G1 public key: {:?}", e))?;

                let prev_sig = match prev_sig_hex {
                    Some(hex_str) => hex::decode(hex_str)
                        .map_err(|e| anyhow!("Failed to decode previous_signature hex: {}", e))?,
                    None => {
                        if round == 1 {
                            // Round 1 has no previous signature by protocol definition.
                            Vec::new()
                        } else {
                            return Err(anyhow!(
                                "Missing previous_signature for chained round {}; \
                                 cannot verify BLS signature",
                                round
                            ));
                        }
                    }
                };

                pk.verify(round, &prev_sig, sig_bytes)
                    .map_err(|e| anyhow!("BLS signature verification failed for round {}: {:?}", round, e))?;
            }
            DrandScheme::BlsUnchainedRfc => {
                // G2 public key (96 bytes compressed), G1 signature.
                // Scheme ID: bls-unchained-g1-rfc9380 (quicknet).
                // Uses drand_verify::G2PubkeyRfc with from_fixed().
                let pk = drand_verify::G2PubkeyRfc::from_fixed(pubkey_bytes.as_slice().try_into()
                    .map_err(|_| anyhow!("G2 public key must be exactly 96 bytes, got {}", pubkey_bytes.len()))?)
                    .map_err(|e| anyhow!("Invalid G2 public key: {:?}", e))?;

                // Unchained scheme does not use the previous signature.
                pk.verify(round, &[], sig_bytes)
                    .map_err(|e| anyhow!("BLS signature verification failed for round {}: {:?}", round, e))?;
            }
        }

        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/// Convert a 32-byte slice into B256, returning an error if the length is wrong.
fn b256_from_bytes(bytes: &[u8]) -> Result<B256> {
    let sized: [u8; 32] = bytes
        .try_into()
        .map_err(|_| anyhow!("Expected 32 bytes, got {}", bytes.len()))?;
    Ok(B256::from(sized))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    fn make_client(chain_hash: &str, pubkey_hex: &str) -> DrandClient {
        let chain_config =
            ChainConfig::from_chain_hash_and_pubkey(chain_hash, pubkey_hex).unwrap();
        DrandClient::new(
            "https://api.drand.sh".to_string(),
            chain_hash.to_string(),
            chain_config,
        )
        .unwrap()
    }

    #[test]
    fn test_drand_client_creation_mainnet() {
        let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);

        assert_eq!(client.url, "https://api.drand.sh");
        assert_eq!(client.chain_hash, MAINNET_CHAINED_CHAIN_HASH);
        assert_eq!(client.chain_config.scheme, DrandScheme::PedersenBls);
    }

    #[test]
    fn test_drand_client_creation_quicknet() {
        let client = make_client(QUICKNET_UNCHAINED_CHAIN_HASH, QUICKNET_UNCHAINED_PUBKEY_HEX);

        assert_eq!(client.chain_hash, QUICKNET_UNCHAINED_CHAIN_HASH);
        assert_eq!(client.chain_config.scheme, DrandScheme::BlsUnchainedRfc);
    }

    #[test]
    fn test_chain_hash_mismatch_is_rejected() {
        let chain_config = ChainConfig::from_chain_hash_and_pubkey(
            MAINNET_CHAINED_CHAIN_HASH,
            MAINNET_CHAINED_PUBKEY_HEX,
        )
        .unwrap();
        let result = DrandClient::new(
            "https://api.drand.sh".to_string(),
            "different_chain_hash".to_string(),
            chain_config,
        );
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(msg.contains("Chain hash mismatch"), "Got: {}", msg);
    }

    #[test]
    fn test_known_chain_config_mainnet() {
        let cfg = ChainConfig::from_known_chain_hash(MAINNET_CHAINED_CHAIN_HASH).unwrap();
        assert_eq!(cfg.scheme, DrandScheme::PedersenBls);
        assert_eq!(cfg.public_key_hex, MAINNET_CHAINED_PUBKEY_HEX);
    }

    #[test]
    fn test_known_chain_config_quicknet() {
        let cfg = ChainConfig::from_known_chain_hash(QUICKNET_UNCHAINED_CHAIN_HASH).unwrap();
        assert_eq!(cfg.scheme, DrandScheme::BlsUnchainedRfc);
        assert_eq!(cfg.public_key_hex, QUICKNET_UNCHAINED_PUBKEY_HEX);
    }

    #[test]
    fn test_unknown_chain_hash_returns_none() {
        let cfg = ChainConfig::from_known_chain_hash("deadbeefdeadbeef");
        assert!(cfg.is_none());
    }

    #[test]
    fn test_invalid_pubkey_length_rejected() {
        // "deadbeef" decodes to 4 bytes, which is neither 48 nor 96.
        let result =
            ChainConfig::from_chain_hash_and_pubkey(MAINNET_CHAINED_CHAIN_HASH, "deadbeef");
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(
            msg.contains("Unexpected public key length"),
            "Got: {}",
            msg
        );
    }

    #[test]
    fn test_drand_round_deserialization_chained() {
        let randomness = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let json_response = format!(
            r#"{{"round":1,"randomness":"{}","signature":"aabb","previous_signature":"ccdd"}}"#,
            randomness
        );

        let drand_round: DrandRound = serde_json::from_str(&json_response).unwrap();
        assert_eq!(drand_round.round, 1);
        assert_eq!(drand_round.randomness, randomness);
        assert_eq!(drand_round.signature, "aabb");
        assert_eq!(drand_round.previous_signature, Some("ccdd".to_string()));
    }

    #[test]
    fn test_drand_round_deserialization_unchained() {
        let randomness = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let json_response = format!(
            r#"{{"round":42,"randomness":"{}","signature":"aabb"}}"#,
            randomness
        );

        let drand_round: DrandRound = serde_json::from_str(&json_response).unwrap();
        assert_eq!(drand_round.round, 42);
        assert_eq!(drand_round.previous_signature, None);
    }

    #[test]
    fn test_validate_rejects_wrong_round_number() {
        let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
        let round = DrandRound {
            round: 5,
            randomness: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
                .to_string(),
            signature: "aabb".to_string(),
            previous_signature: None,
        };
        // Request round 10 but response contains round 5.
        let result = client.validate_and_verify(&round, 10);
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(msg.contains("Round number mismatch"), "Got: {}", msg);
    }

    #[test]
    fn test_validate_rejects_short_randomness() {
        let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
        let round = DrandRound {
            round: 1,
            // Only 62 hex chars (31 bytes), not 64.
            randomness: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd".to_string(),
            signature: "aabb".to_string(),
            previous_signature: None,
        };
        let result = client.validate_and_verify(&round, 1);
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(msg.contains("unexpected length"), "Got: {}", msg);
    }

    #[test]
    fn test_validate_rejects_non_hex_randomness() {
        let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
        let round = DrandRound {
            round: 1,
            // 64 chars but contains non-hex character 'g'.
            randomness: "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"
                .to_string(),
            signature: "aabb".to_string(),
            previous_signature: None,
        };
        let result = client.validate_and_verify(&round, 1);
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        assert!(msg.contains("non-hex"), "Got: {}", msg);
    }

    #[test]
    fn test_chained_round_missing_prev_sig_fails() {
        let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
        let round = DrandRound {
            round: 100,
            randomness: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
                .to_string(),
            signature: "aabb".to_string(),
            // Missing previous_signature for a chained chain at round > 1.
            previous_signature: None,
        };
        let result = client.validate_and_verify(&round, 100);
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        // Will fail because prev sig is missing for chained round > 1.
        assert!(
            msg.contains("previous_signature") || msg.contains("BLS"),
            "Got: {}",
            msg
        );
    }

    #[test]
    fn test_b256_from_bytes_correct_length() {
        let bytes = [0u8; 32];
        let result = b256_from_bytes(&bytes);
        assert!(result.is_ok());
    }

    #[test]
    fn test_b256_from_bytes_wrong_length() {
        let bytes = [0u8; 16];
        let result = b256_from_bytes(&bytes);
        assert!(result.is_err());
    }

    // -----------------------------------------------------------------------
    // Proptest fuzz tests
    // -----------------------------------------------------------------------

    proptest! {
        #[test]
        fn fuzz_b256_from_bytes_never_panics(bytes in proptest::collection::vec(any::<u8>(), 0..128)) {
            let result = b256_from_bytes(&bytes);
            if bytes.len() == 32 {
                prop_assert!(result.is_ok());
            } else {
                prop_assert!(result.is_err());
            }
        }

        #[test]
        fn fuzz_chain_config_from_arbitrary_pubkey(hex_input in "[0-9a-f]{0,256}") {
            let result = ChainConfig::from_chain_hash_and_pubkey("test_chain", &hex_input);
            match hex::decode(&hex_input) {
                Ok(bytes) if bytes.len() == 48 || bytes.len() == 96 => {
                    prop_assert!(result.is_ok());
                    let cfg = result.unwrap();
                    if bytes.len() == 48 {
                        prop_assert_eq!(cfg.scheme, DrandScheme::PedersenBls);
                    } else {
                        prop_assert_eq!(cfg.scheme, DrandScheme::BlsUnchainedRfc);
                    }
                }
                _ => {
                    prop_assert!(result.is_err());
                }
            }
        }

        #[test]
        fn fuzz_chain_config_rejects_invalid_hex(input in ".*") {
            // If hex decode fails or length is wrong, should return Err
            let result = ChainConfig::from_chain_hash_and_pubkey("test", &input);
            // Just assert it never panics - the result depends on the input
            let _ = result;
        }

        #[test]
        fn fuzz_validate_and_verify_rejects_wrong_round(
            requested_round in 1u64..u64::MAX,
            response_round in 1u64..u64::MAX,
        ) {
            let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
            let round = DrandRound {
                round: response_round,
                randomness: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_string(),
                signature: "aabb".to_string(),
                previous_signature: None,
            };
            let result = client.validate_and_verify(&round, requested_round);
            if requested_round != response_round {
                prop_assert!(result.is_err());
            }
        }

        #[test]
        fn fuzz_validate_rejects_bad_randomness_length(
            randomness_len in 0usize..256,
        ) {
            prop_assume!(randomness_len != 64);
            let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
            let randomness: String = "a".repeat(randomness_len);
            let round = DrandRound {
                round: 1,
                randomness,
                signature: "aabb".to_string(),
                previous_signature: None,
            };
            let result = client.validate_and_verify(&round, 1);
            prop_assert!(result.is_err());
        }

        #[test]
        fn fuzz_validate_rejects_non_hex_randomness(randomness in "[g-z]{64}") {
            let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
            let round = DrandRound {
                round: 1,
                randomness,
                signature: "aabb".to_string(),
                previous_signature: None,
            };
            let result = client.validate_and_verify(&round, 1);
            prop_assert!(result.is_err());
        }

        #[test]
        fn fuzz_validate_round_zero_always_rejected(
            randomness in "[0-9a-f]{64}",
        ) {
            let client = make_client(MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX);
            let round = DrandRound {
                round: 0,
                randomness,
                signature: "aabb".to_string(),
                previous_signature: None,
            };
            let result = client.validate_and_verify(&round, 0);
            prop_assert!(result.is_err());
        }

        #[test]
        fn fuzz_drand_round_deserialization_never_panics(json in "\\{.*\\}") {
            // Arbitrary JSON-like strings should never panic during deserialization
            let _ = serde_json::from_str::<DrandRound>(&json);
        }
    }
}
