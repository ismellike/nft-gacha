use alloy_primitives::{keccak256, B256};

pub struct RandomDerivation;

impl RandomDerivation {
    /// Create VRF by combining multiple entropy sources
    pub fn from_sources(sources: &[&[u8]]) -> B256 {
        let mut combined = Vec::new();
        for source in sources {
            combined.extend_from_slice(source);
        }
        keccak256(&combined)
    }
}
