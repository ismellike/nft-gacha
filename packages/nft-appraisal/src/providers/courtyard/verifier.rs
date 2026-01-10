//! Cryptographic integrity verification for Courtyard NFTs

use alloy_primitives::keccak256;
use anyhow::{anyhow, Result};

use super::types::ProofOfIntegrityInfo;

/// Verifies cryptographic integrity proofs for Courtyard NFTs
pub struct IntegrityVerifier;

impl IntegrityVerifier {
    /// Verify the proof of integrity for a Courtyard NFT
    ///
    /// This verifies that the NFT metadata has not been tampered with by checking
    /// the cryptographic proof stored on-chain against the metadata fingerprint.
    pub fn verify_proof_of_integrity(proof_info: &ProofOfIntegrityInfo) -> Result<bool> {
        // Validate fingerprint format
        if proof_info.fingerprint.is_empty() {
            return Err(anyhow!("Empty fingerprint in integrity proof"));
        }

        // Create verification message using Solidity's abi.encodePacked algorithm
        // abi.encodePacked concatenates raw bytes: fingerprint + salt (as uint256, 32 bytes, big-endian)
        let mut encoded = Vec::new();
        encoded.extend_from_slice(proof_info.fingerprint.as_bytes());

        // Salt as uint256 (32 bytes, big-endian) - same as Solidity's encoding
        let salt_bytes = proof_info.salt.to_be_bytes();
        let mut salt_256 = [0u8; 32];
        salt_256[32 - 8..].copy_from_slice(&salt_bytes);
        encoded.extend_from_slice(&salt_256);

        let expected_hash = keccak256(encoded);

        // Decode the hex proof (strip 0x prefix if present)
        let hex_proof_clean = proof_info
            .hex_proof
            .strip_prefix("0x")
            .unwrap_or(&proof_info.hex_proof);
        let proof_bytes = hex::decode(hex_proof_clean).map_err(|e| {
            anyhow!(
                "Failed to decode hex proof '{}': {}",
                proof_info.hex_proof,
                e
            )
        })?;

        if proof_bytes.len() != 32 {
            return Err(anyhow!(
                "Invalid proof format: expected 32 bytes, got {}",
                proof_bytes.len()
            ));
        }

        // The hex proof should be exactly 32 bytes (the keccak256 hash)
        let actual_hash = alloy_primitives::B256::from_slice(&proof_bytes);

        // Compare hashes
        let is_valid = expected_hash == actual_hash;

        if !is_valid {
            return Err(anyhow!(
                "Integrity verification failed: fingerprint hash mismatch. This may indicate tampered metadata."
            ));
        }

        Ok(is_valid)
    }
}
