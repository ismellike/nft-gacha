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
    pub fn from_host() -> Self {
        let defaults = Self::default();

        let drand_url = host::config_var("DRAND_URL").unwrap_or(defaults.drand_url);

        let drand_chain_hash =
            host::config_var("DRAND_CHAIN_HASH").unwrap_or(defaults.drand_chain_hash);

        let drand_genesis_time = host::config_var("DRAND_GENESIS_TIME")
            .and_then(|s| s.parse().ok())
            .unwrap_or(defaults.drand_genesis_time);

        let drand_period = host::config_var("DRAND_PERIOD")
            .and_then(|s| s.parse().ok())
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
            panic!(
                "DRAND_PUBLIC_KEY must be set when using an unrecognised \
                 DRAND_CHAIN_HASH '{}'. BLS signature verification cannot \
                 proceed without a public key.",
                drand_chain_hash
            );
        };

        Self {
            drand_url,
            drand_chain_hash,
            drand_public_key,
            drand_genesis_time,
            drand_period,
        }
    }
}
