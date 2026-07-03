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

#[cfg(test)]
mod tests {
    use super::*;

    // Helper: count the number of differing bits between two B256 values.
    fn differing_bits(a: B256, b: B256) -> u32 {
        a.0.iter()
            .zip(b.0.iter())
            .map(|(x, y)| (x ^ y).count_ones())
            .sum()
    }

    // --- Determinism ---

    #[test]
    fn single_source_is_deterministic() {
        let source = b"hello world";
        let out1 = RandomDerivation::from_sources(&[source]);
        let out2 = RandomDerivation::from_sources(&[source]);
        assert_eq!(out1, out2, "same input must always produce same output");
    }

    #[test]
    fn multiple_sources_deterministic() {
        let a = b"source_a";
        let b = b"source_b";
        let c = b"source_c";
        let out1 = RandomDerivation::from_sources(&[a, b, c]);
        let out2 = RandomDerivation::from_sources(&[a, b, c]);
        assert_eq!(out1, out2, "same inputs must always produce same output");
    }

    #[test]
    fn empty_sources_produces_keccak_of_empty() {
        // keccak256([]) is the well-known empty hash
        let out = RandomDerivation::from_sources(&[]);
        let expected = keccak256([]);
        assert_eq!(
            out, expected,
            "empty sources must hash the empty byte string"
        );
    }

    #[test]
    fn empty_sources_is_deterministic() {
        let out1 = RandomDerivation::from_sources(&[]);
        let out2 = RandomDerivation::from_sources(&[]);
        assert_eq!(out1, out2);
    }

    // --- Order matters ---

    #[test]
    fn order_of_sources_matters() {
        let a = b"alpha";
        let b = b"beta";
        let out_ab = RandomDerivation::from_sources(&[a, b]);
        let out_ba = RandomDerivation::from_sources(&[b, a]);
        assert_ne!(
            out_ab, out_ba,
            "reversing source order must change the output"
        );
    }

    // --- Avalanche effect ---

    #[test]
    fn single_byte_change_produces_different_output() {
        let input_a = b"deterministic_seed_1";
        let mut input_b = *input_a;
        input_b[0] ^= 0x01; // flip one bit in the first byte
        let out_a = RandomDerivation::from_sources(&[input_a]);
        let out_b = RandomDerivation::from_sources(&[&input_b]);
        assert_ne!(out_a, out_b, "one-byte change must change the output");
        // keccak256 has a strong avalanche effect; expect many bits to differ.
        let flipped = differing_bits(out_a, out_b);
        assert!(
            flipped >= 50,
            "avalanche: expected >= 50 differing bits, got {}",
            flipped
        );
    }

    #[test]
    fn different_number_of_sources_produce_different_outputs() {
        let data = b"shared_data";
        let out1 = RandomDerivation::from_sources(&[data]);
        let out2 = RandomDerivation::from_sources(&[data, data]);
        assert_ne!(
            out1, out2,
            "different source counts must produce different outputs"
        );
    }

    // --- Edge-case inputs ---

    #[test]
    fn all_zero_source() {
        let zeros = [0u8; 32];
        let out = RandomDerivation::from_sources(&[&zeros]);
        let expected = keccak256(zeros);
        assert_eq!(out, expected);
    }

    #[test]
    fn all_max_byte_source() {
        let maxes = [0xFFu8; 32];
        let out = RandomDerivation::from_sources(&[&maxes]);
        let expected = keccak256(maxes);
        assert_eq!(out, expected);
    }

    #[test]
    fn all_zero_and_all_max_are_different() {
        let zeros = [0u8; 32];
        let maxes = [0xFFu8; 32];
        let out_zeros = RandomDerivation::from_sources(&[&zeros]);
        let out_maxes = RandomDerivation::from_sources(&[&maxes]);
        assert_ne!(out_zeros, out_maxes);
    }

    // --- Consistency with keccak256 concatenation ---

    #[test]
    fn matches_manual_concatenation() {
        let a = b"part_one";
        let b = b"part_two";
        let out = RandomDerivation::from_sources(&[a, b]);

        let mut concat = Vec::new();
        concat.extend_from_slice(a);
        concat.extend_from_slice(b);
        let expected = keccak256(&concat);

        assert_eq!(
            out, expected,
            "from_sources must equal keccak256 of concatenated inputs"
        );
    }

    // --- Output is always B256 (32 bytes) ---

    #[test]
    fn output_is_always_32_bytes() {
        let sources: &[&[u8]] = &[b"a", b"bb", b"ccc"];
        let out = RandomDerivation::from_sources(sources);
        assert_eq!(out.len(), 32);
    }
}
