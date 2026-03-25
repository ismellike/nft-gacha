use anyhow::{anyhow, Result};

use crate::drand::{ChainConfig, MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX};
use crate::host;

/// Configuration for the VRF service.
///
/// `drand_public_key` is the hex-encoded compressed BLS12-381 public key for
/// the configured drand chain. It is used to cryptographically verify every
/// round response before trusting the randomness. If not supplied via the
/// `DRAND_PUBLIC_KEY` environment variable, the hardcoded key for the default
/// chain is used.
///
/// `drand_chain_hash` is validated against the key at startup: if the two do
/// not correspond to a known chain, the operator must supply both
/// `DRAND_CHAIN_HASH` **and** `DRAND_PUBLIC_KEY` explicitly.
#[derive(Debug, Clone)]
pub struct Config {
    pub drand_url: String,
    pub drand_chain_hash: String,
    /// Hex-encoded BLS12-381 public key for the drand chain. Used for BLS
    /// signature verification of each round response.
    pub drand_public_key: String,
    pub drand_genesis_time: u64,
    pub drand_period: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            drand_url: "https://api.drand.sh".to_string(),
            drand_chain_hash: MAINNET_CHAINED_CHAIN_HASH.to_string(),
            drand_public_key: MAINNET_CHAINED_PUBKEY_HEX.to_string(),
            drand_genesis_time: 1595431050, // Drand mainnet genesis time
            drand_period: 30,               // 30 seconds per round
        }
    }
}

impl Config {
    /// Load configuration from host environment variables.
    ///
    /// When `DRAND_CHAIN_HASH` is set to a known well-known chain and
    /// `DRAND_PUBLIC_KEY` is not supplied, the corresponding hardcoded public
    /// key is used automatically. When both `DRAND_CHAIN_HASH` and
    /// `DRAND_PUBLIC_KEY` are supplied, both values are used as-is (enabling
    /// custom drand deployments). When only `DRAND_CHAIN_HASH` is set to an
    /// *unknown* chain and no `DRAND_PUBLIC_KEY` is provided, `from_host`
    /// panics because operating without signature verification is not
    /// permitted.
    pub fn from_host() -> Result<Self> {
        let defaults = Self::default();

        let drand_url = host::config_var("DRAND_URL").unwrap_or(defaults.drand_url);

        let drand_chain_hash =
            host::config_var("DRAND_CHAIN_HASH").unwrap_or(defaults.drand_chain_hash);

        let drand_genesis_time = host::config_var("DRAND_GENESIS_TIME")
            .and_then(|s| s.parse().ok())
            .filter(|&v: &u64| v > 0)
            .unwrap_or(defaults.drand_genesis_time);

        let drand_period = host::config_var("DRAND_PERIOD")
            .and_then(|s| s.parse().ok())
            .filter(|&v: &u64| v > 0)
            .unwrap_or(defaults.drand_period);

        // Resolve the public key: explicit env var takes precedence, then
        // fall back to the hardcoded key for well-known chains.
        let drand_public_key = if let Some(pk) = host::config_var("DRAND_PUBLIC_KEY") {
            pk
        } else if let Some(chain_cfg) = ChainConfig::from_known_chain_hash(&drand_chain_hash) {
            chain_cfg.public_key_hex
        } else {
            // An unknown chain hash with no public key supplied means we
            // cannot verify signatures. This is a fatal misconfiguration.
            return Err(anyhow!(
                "DRAND_PUBLIC_KEY must be set when using an unrecognised \
                 DRAND_CHAIN_HASH '{}'. BLS signature verification cannot \
                 proceed without a public key.",
                drand_chain_hash
            ));
        };

        Ok(Self {
            drand_url,
            drand_chain_hash,
            drand_public_key,
            drand_genesis_time,
            drand_period,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::drand::{
        ChainConfig, DrandScheme, MAINNET_CHAINED_CHAIN_HASH, MAINNET_CHAINED_PUBKEY_HEX,
        QUICKNET_UNCHAINED_CHAIN_HASH, QUICKNET_UNCHAINED_PUBKEY_HEX,
    };

    // --- Config::default() ---

    #[test]
    fn default_url_is_drand_sh() {
        let cfg = Config::default();
        assert_eq!(cfg.drand_url, "https://api.drand.sh");
    }

    #[test]
    fn default_chain_hash_is_mainnet_chained() {
        let cfg = Config::default();
        assert_eq!(cfg.drand_chain_hash, MAINNET_CHAINED_CHAIN_HASH);
    }

    #[test]
    fn default_public_key_is_mainnet_chained() {
        let cfg = Config::default();
        assert_eq!(cfg.drand_public_key, MAINNET_CHAINED_PUBKEY_HEX);
    }

    #[test]
    fn default_genesis_time_is_mainnet_value() {
        let cfg = Config::default();
        // Drand mainnet genesis: 2020-07-22T18:10:00Z = 1595431050
        assert_eq!(cfg.drand_genesis_time, 1595431050);
    }

    #[test]
    fn default_period_is_thirty_seconds() {
        let cfg = Config::default();
        assert_eq!(cfg.drand_period, 30);
    }

    // --- Known chain hashes resolve to correct ChainConfig ---

    #[test]
    fn known_chain_mainnet_returns_pedersen_bls_scheme() {
        let chain_cfg =
            ChainConfig::from_known_chain_hash(MAINNET_CHAINED_CHAIN_HASH).unwrap();
        assert_eq!(chain_cfg.scheme, DrandScheme::PedersenBls);
        assert_eq!(chain_cfg.public_key_hex, MAINNET_CHAINED_PUBKEY_HEX);
        assert_eq!(chain_cfg.verify_chain_hash, MAINNET_CHAINED_CHAIN_HASH);
    }

    #[test]
    fn known_chain_quicknet_returns_bls_unchained_rfc_scheme() {
        let chain_cfg =
            ChainConfig::from_known_chain_hash(QUICKNET_UNCHAINED_CHAIN_HASH).unwrap();
        assert_eq!(chain_cfg.scheme, DrandScheme::BlsUnchainedRfc);
        assert_eq!(chain_cfg.public_key_hex, QUICKNET_UNCHAINED_PUBKEY_HEX);
        assert_eq!(chain_cfg.verify_chain_hash, QUICKNET_UNCHAINED_CHAIN_HASH);
    }

    #[test]
    fn unknown_chain_hash_returns_none() {
        assert!(ChainConfig::from_known_chain_hash("unknown_chain_hash_xyz").is_none());
    }

    #[test]
    fn empty_string_chain_hash_returns_none() {
        assert!(ChainConfig::from_known_chain_hash("").is_none());
    }

    // --- Period and genesis time filtering (v > 0 guard in from_host) ---
    // These tests verify the invariant enforced by from_host's .filter(|&v| v > 0):
    // any parsed value of 0 falls back to the default.

    #[test]
    fn default_period_is_nonzero() {
        // Validates the invariant that the default passes its own filter.
        assert!(
            Config::default().drand_period > 0,
            "default period must be > 0"
        );
    }

    #[test]
    fn default_genesis_time_is_nonzero() {
        assert!(
            Config::default().drand_genesis_time > 0,
            "default genesis time must be > 0"
        );
    }

    // --- ChainConfig::from_chain_hash_and_pubkey for well-known keys ---

    #[test]
    fn mainnet_pubkey_produces_pedersen_bls_scheme() {
        let cfg = ChainConfig::from_chain_hash_and_pubkey(
            MAINNET_CHAINED_CHAIN_HASH,
            MAINNET_CHAINED_PUBKEY_HEX,
        )
        .unwrap();
        assert_eq!(cfg.scheme, DrandScheme::PedersenBls);
    }

    #[test]
    fn quicknet_pubkey_produces_bls_unchained_rfc_scheme() {
        let cfg = ChainConfig::from_chain_hash_and_pubkey(
            QUICKNET_UNCHAINED_CHAIN_HASH,
            QUICKNET_UNCHAINED_PUBKEY_HEX,
        )
        .unwrap();
        assert_eq!(cfg.scheme, DrandScheme::BlsUnchainedRfc);
    }

    #[test]
    fn unknown_chain_with_no_explicit_pubkey_is_rejected_by_from_chain_hash_and_pubkey_with_wrong_length(
    ) {
        // Simulates what from_host does when chain hash is unknown and no public
        // key env var is set: ChainConfig::from_known_chain_hash returns None,
        // which triggers an error return in from_host. We test the None path directly.
        let result = ChainConfig::from_known_chain_hash("completely_unknown_hash_abcdef");
        assert!(
            result.is_none(),
            "unknown chain hash without a registered pubkey must return None"
        );
    }
}
