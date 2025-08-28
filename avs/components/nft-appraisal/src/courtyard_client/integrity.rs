use super::types::NFTMetadata;
use anyhow::{anyhow, Result};
use sha3::{Digest, Keccak256};

pub struct IntegrityVerifier;

impl IntegrityVerifier {
    /// Verify proof of integrity for a Courtyard NFT
    ///
    /// This follows Courtyard's Solidity implementation:
    /// ```solidity
    /// function generateProofOfIntegrity(string memory fingerprint, uint256 salt) public pure returns (bytes32) {
    ///     return keccak256(abi.encodePacked(fingerprint, salt));
    /// }
    /// ```
    pub fn verify_proof_of_integrity(metadata: &NFTMetadata) -> Result<bool> {
        let token_info = metadata
            .token_info
            .as_ref()
            .ok_or_else(|| anyhow!("No token_info found in metadata"))?;

        let proof_info = token_info
            .proof_of_integrity
            .as_ref()
            .ok_or_else(|| anyhow!("No proof_of_integrity found in token_info"))?;

        let computed_hash = Self::generate_proof_hash(&proof_info.fingerprint, proof_info.salt)?;
        let stored_hash = proof_info
            .hex_proof
            .strip_prefix("0x")
            .unwrap_or(&proof_info.hex_proof);
        let computed_normalized = computed_hash.strip_prefix("0x").unwrap_or(&computed_hash);

        Ok(stored_hash.eq_ignore_ascii_case(computed_normalized))
    }

    /// Generate proof of integrity hash using keccak256 with Solidity's abi.encodePacked format
    pub fn generate_proof_hash(fingerprint: &str, salt: u64) -> Result<String> {
        Self::compute_keccak256_hash(fingerprint, salt)
    }

    /// Compute keccak256 hash of fingerprint with salt using Solidity's abi.encodePacked format
    ///
    /// This matches Solidity's behavior:
    /// - UTF-8 bytes of the fingerprint string
    /// - Followed by the salt as a 32-byte big-endian uint256
    fn compute_keccak256_hash(fingerprint: &str, salt: u64) -> Result<String> {
        if fingerprint.trim().is_empty() {
            return Err(anyhow!("Fingerprint cannot be empty"));
        }

        let mut hasher = Keccak256::new();

        // Add fingerprint bytes (UTF-8)
        hasher.update(fingerprint.as_bytes());

        // Add salt as 32-byte big-endian (uint256 in Solidity)
        // Solidity uint256 is 32 bytes, Rust u64 is 8 bytes, so we pad with zeros
        let mut salt_bytes = [0u8; 32];
        salt_bytes[24..32].copy_from_slice(&salt.to_be_bytes());
        hasher.update(salt_bytes);

        let hash_bytes = hasher.finalize();
        let hash_hex = hex::encode(hash_bytes);

        Ok(format!("0x{}", hash_hex))
    }
}
