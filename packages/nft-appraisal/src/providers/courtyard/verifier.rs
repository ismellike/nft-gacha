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

#[cfg(test)]
mod tests {
    use super::*;
    use alloy_primitives::keccak256;
    use proptest::prelude::*;

    fn make_valid_proof(fingerprint: &str, salt: u64) -> ProofOfIntegrityInfo {
        let mut encoded = Vec::new();
        encoded.extend_from_slice(fingerprint.as_bytes());
        let salt_bytes = salt.to_be_bytes();
        let mut salt_256 = [0u8; 32];
        salt_256[32 - 8..].copy_from_slice(&salt_bytes);
        encoded.extend_from_slice(&salt_256);
        let hash = keccak256(encoded);
        ProofOfIntegrityInfo {
            fingerprint: fingerprint.to_string(),
            salt,
            hex_proof: format!("0x{}", hex::encode(hash)),
        }
    }

    #[test]
    fn test_valid_proof_verifies() {
        let proof = make_valid_proof("test-fingerprint", 12345);
        assert!(IntegrityVerifier::verify_proof_of_integrity(&proof).is_ok());
    }

    #[test]
    fn test_empty_fingerprint_rejected() {
        let proof = ProofOfIntegrityInfo {
            fingerprint: "".to_string(),
            salt: 0,
            hex_proof: "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
        };
        assert!(IntegrityVerifier::verify_proof_of_integrity(&proof).is_err());
    }

    proptest! {
        #[test]
        fn fuzz_verify_valid_proof_always_succeeds(
            fingerprint in "[a-zA-Z0-9_-]{1,100}",
            salt in any::<u64>(),
        ) {
            let proof = make_valid_proof(&fingerprint, salt);
            let result = IntegrityVerifier::verify_proof_of_integrity(&proof);
            prop_assert!(result.is_ok(), "Valid proof should always verify: {:?}", result.err());
        }

        #[test]
        fn fuzz_verify_tampered_fingerprint_fails(
            fingerprint in "[a-zA-Z0-9]{2,50}",
            salt in any::<u64>(),
        ) {
            let proof = make_valid_proof(&fingerprint, salt);
            // Tamper with the fingerprint
            let tampered = ProofOfIntegrityInfo {
                fingerprint: format!("{}X", fingerprint),
                salt: proof.salt,
                hex_proof: proof.hex_proof,
            };
            let result = IntegrityVerifier::verify_proof_of_integrity(&tampered);
            prop_assert!(result.is_err(), "Tampered fingerprint should fail verification");
        }

        #[test]
        fn fuzz_verify_tampered_salt_fails(
            fingerprint in "[a-zA-Z0-9]{1,50}",
            salt in 0u64..u64::MAX,
        ) {
            let proof = make_valid_proof(&fingerprint, salt);
            let tampered = ProofOfIntegrityInfo {
                fingerprint: proof.fingerprint,
                salt: salt.wrapping_add(1),
                hex_proof: proof.hex_proof,
            };
            let result = IntegrityVerifier::verify_proof_of_integrity(&tampered);
            prop_assert!(result.is_err(), "Tampered salt should fail verification");
        }

        #[test]
        fn fuzz_verify_invalid_hex_proof_rejected(
            fingerprint in "[a-zA-Z0-9]{1,50}",
            bad_hex in "[g-z]{1,100}",
        ) {
            let proof = ProofOfIntegrityInfo {
                fingerprint,
                salt: 0,
                hex_proof: bad_hex,
            };
            let result = IntegrityVerifier::verify_proof_of_integrity(&proof);
            prop_assert!(result.is_err());
        }

        #[test]
        fn fuzz_verify_wrong_length_proof_rejected(
            fingerprint in "[a-zA-Z0-9]{1,50}",
            proof_len in (0usize..64).prop_filter("not 32 bytes", |&l| l != 32),
        ) {
            let hex_proof = format!("0x{}", "aa".repeat(proof_len));
            let proof = ProofOfIntegrityInfo {
                fingerprint,
                salt: 0,
                hex_proof,
            };
            let result = IntegrityVerifier::verify_proof_of_integrity(&proof);
            prop_assert!(result.is_err());
        }

        #[test]
        fn fuzz_verify_never_panics(
            fingerprint in ".*",
            salt in any::<u64>(),
            hex_proof in ".*",
        ) {
            let proof = ProofOfIntegrityInfo {
                fingerprint,
                salt,
                hex_proof,
            };
            // Should never panic, regardless of input
            let _ = IntegrityVerifier::verify_proof_of_integrity(&proof);
        }
    }
}
