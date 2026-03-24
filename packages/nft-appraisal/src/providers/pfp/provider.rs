//! PFP (Profile Picture) provider for the Gacha PFP collection.
//!
//! Detects on-chain `data:application/json;base64,...` metadata containing
//! "Gacha PFP" in the name. Reads the "Rarity" trait and maps it to a fixed
//! price matching the gacha treasury's rarity tiers.
//!
//! Price mapping (must land within treasury price ranges):
//!   Common:     $5      (treasury: $0 – $15)
//!   Uncommon:   $30     (treasury: $15.01 – $60)
//!   Rare:       $120    (treasury: $60.01 – $250)
//!   Epic:       $600    (treasury: $250.01 – $1,200)
//!   Legendary:  $2,000  (treasury: $1,200.01+)
//!   Mythic:     $4,000  (treasury: $1,200.01+, same tier as Legendary)

use crate::traits::metadata::{MetadataProvider, ProviderMetadata};
use crate::types::ProviderType;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::Deserialize;

/// Provider for on-chain Gacha PFP NFTs with rarity-based pricing.
pub struct PfpProvider;

impl PfpProvider {
    pub fn new() -> Self {
        Self
    }
}

const DATA_URI_PREFIX: &str = "data:application/json;base64,";

#[async_trait(?Send)]
impl MetadataProvider for PfpProvider {
    fn provider_type(&self) -> ProviderType {
        ProviderType::Pfp
    }

    fn can_handle_uri(&self, uri: &str) -> bool {
        if !uri.starts_with(DATA_URI_PREFIX) {
            return false;
        }
        // Quick-decode to check for "Gacha PFP" in the name field
        let b64 = &uri[DATA_URI_PREFIX.len()..];
        if let Ok(decoded) = base64_decode(b64) {
            if let Ok(meta) = serde_json::from_slice::<PfpMetadata>(&decoded) {
                return meta.name.contains("Gacha PFP");
            }
        }
        false
    }

    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata> {
        let b64 = uri
            .strip_prefix(DATA_URI_PREFIX)
            .ok_or_else(|| anyhow!("Not a data URI"))?;

        let decoded = base64_decode(b64).map_err(|e| anyhow!("Base64 decode failed: {}", e))?;
        let meta: PfpMetadata =
            serde_json::from_slice(&decoded).map_err(|e| anyhow!("JSON parse failed: {}", e))?;

        Ok(ProviderMetadata {
            provider: ProviderType::Pfp,
            title: meta.name,
            resolver: None, // Price computed inline, no external resolver
        })
    }
}

/// Map a rarity string from PFP metadata to a USD price.
pub fn price_for_rarity(rarity: &str) -> Option<f64> {
    match rarity.to_ascii_lowercase().as_str() {
        "common" => Some(5.0),
        "uncommon" => Some(30.0),
        "rare" => Some(120.0),
        "epic" => Some(600.0),
        "legendary" => Some(2000.0),
        "mythic" => Some(4000.0),
        _ => None,
    }
}

/// Extract the "Rarity" trait value from a data URI.
pub fn extract_rarity_from_uri(uri: &str) -> Option<String> {
    let b64 = uri.strip_prefix(DATA_URI_PREFIX)?;
    let decoded = base64_decode(b64).ok()?;
    let meta: PfpMetadata = serde_json::from_slice(&decoded).ok()?;
    meta.attributes
        .iter()
        .find(|a| a.trait_type.eq_ignore_ascii_case("rarity"))
        .map(|a| a.value.clone())
}

/// Minimal metadata struct for parsing PFP JSON.
#[derive(Debug, Deserialize)]
struct PfpMetadata {
    name: String,
    #[serde(default)]
    attributes: Vec<PfpAttribute>,
}

#[derive(Debug, Deserialize)]
struct PfpAttribute {
    trait_type: String,
    value: String,
}

/// Simple base64 decoder (standard alphabet, with padding). No external crate needed.
fn base64_decode(input: &str) -> Result<Vec<u8>, String> {
    fn val(c: u8) -> Result<u8, String> {
        match c {
            b'A'..=b'Z' => Ok(c - b'A'),
            b'a'..=b'z' => Ok(c - b'a' + 26),
            b'0'..=b'9' => Ok(c - b'0' + 52),
            b'+' => Ok(62),
            b'/' => Ok(63),
            _ => Err(format!("Invalid base64 char: {}", c as char)),
        }
    }

    let bytes: Vec<u8> = input.bytes().filter(|&b| b != b'=' && b != b'\n' && b != b'\r').collect();
    let mut out = Vec::with_capacity(bytes.len() * 3 / 4);
    let chunks = bytes.chunks(4);
    for chunk in chunks {
        let b0 = val(chunk[0])?;
        let b1 = val(*chunk.get(1).ok_or("Truncated base64")?)?;
        out.push((b0 << 2) | (b1 >> 4));
        if let Some(&c2) = chunk.get(2) {
            let b2 = val(c2)?;
            out.push((b1 << 4) | (b2 >> 2));
            if let Some(&c3) = chunk.get(3) {
                let b3 = val(c3)?;
                out.push((b2 << 6) | b3);
            }
        }
    }
    Ok(out)
}

/// Simple base64 encoder (standard alphabet, with padding). No external crate needed.
#[cfg(test)]
fn base64_encode(input: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((input.len() + 2) / 3 * 4);
    for chunk in input.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = *chunk.get(1).unwrap_or(&0) as u32;
        let b2 = *chunk.get(2).unwrap_or(&0) as u32;
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(CHARS[((triple >> 18) & 0x3F) as usize] as char);
        out.push(CHARS[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            out.push(CHARS[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(CHARS[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    fn make_pfp_uri(token_id: u32, rarity: &str) -> String {
        let json = format!(
            r#"{{"name":"Gacha PFP #{}","description":"Gacha PFP Collection - {}","attributes":[{{"trait_type":"Rarity","value":"{}"}}]}}"#,
            token_id, rarity, rarity
        );
        let encoded = base64_encode(json.as_bytes());
        format!("{}{}", DATA_URI_PREFIX, encoded)
    }

    fn make_custom_data_uri(json: &str) -> String {
        let encoded = base64_encode(json.as_bytes());
        format!("{}{}", DATA_URI_PREFIX, encoded)
    }

    // -----------------------------------------------------------------------
    // can_handle_uri() tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_can_handle_pfp_uri() {
        let provider = PfpProvider::new();
        let uri = make_pfp_uri(1, "Common");
        assert!(provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_can_handle_all_rarities() {
        let provider = PfpProvider::new();
        for rarity in &["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] {
            let uri = make_pfp_uri(1, rarity);
            assert!(provider.can_handle_uri(&uri), "Should handle {}", rarity);
        }
    }

    #[test]
    fn test_cannot_handle_non_pfp() {
        let provider = PfpProvider::new();
        assert!(!provider.can_handle_uri("https://courtyard.io/some-nft"));
        assert!(!provider.can_handle_uri("testnet-gacha://1"));
        assert!(!provider.can_handle_uri(""));
        assert!(!provider.can_handle_uri("data:text/plain;base64,SGVsbG8="));
    }

    #[test]
    fn test_cannot_handle_non_gacha_data_uri() {
        let provider = PfpProvider::new();
        let json = r#"{"name":"Other NFT #1","attributes":[]}"#;
        let uri = make_custom_data_uri(json);
        assert!(!provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_cannot_handle_gacha_pfp_substring_in_description() {
        let provider = PfpProvider::new();
        // "Gacha PFP" is in description but not in name
        let json = r#"{"name":"My NFT #1","description":"Like Gacha PFP","attributes":[]}"#;
        let uri = make_custom_data_uri(json);
        assert!(!provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_can_handle_gacha_pfp_with_extra_attributes() {
        let provider = PfpProvider::new();
        let json = r#"{"name":"Gacha PFP #99","description":"test","attributes":[{"trait_type":"Rarity","value":"Epic"},{"trait_type":"Color","value":"Blue"}]}"#;
        let uri = make_custom_data_uri(json);
        assert!(provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_cannot_handle_invalid_base64() {
        let provider = PfpProvider::new();
        let uri = format!("{}!!!invalid!!!", DATA_URI_PREFIX);
        assert!(!provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_cannot_handle_invalid_json() {
        let provider = PfpProvider::new();
        let uri = make_custom_data_uri("not json at all");
        assert!(!provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_cannot_handle_empty_base64() {
        let provider = PfpProvider::new();
        assert!(!provider.can_handle_uri(DATA_URI_PREFIX));
    }

    // -----------------------------------------------------------------------
    // provider_type() tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_provider_type_is_pfp() {
        let provider = PfpProvider::new();
        assert_eq!(provider.provider_type(), ProviderType::Pfp);
    }

    // -----------------------------------------------------------------------
    // extract_rarity_from_uri() tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_extract_rarity_all_tiers() {
        for rarity in &["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] {
            let uri = make_pfp_uri(1, rarity);
            let extracted = extract_rarity_from_uri(&uri);
            assert_eq!(extracted.as_deref(), Some(*rarity), "Failed for {}", rarity);
        }
    }

    #[test]
    fn test_extract_rarity_returns_none_for_non_data_uri() {
        assert_eq!(extract_rarity_from_uri("testnet-gacha://1"), None);
        assert_eq!(extract_rarity_from_uri("https://example.com"), None);
    }

    #[test]
    fn test_extract_rarity_returns_none_when_no_rarity_trait() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[{"trait_type":"Color","value":"Blue"}]}"#;
        let uri = make_custom_data_uri(json);
        assert_eq!(extract_rarity_from_uri(&uri), None);
    }

    #[test]
    fn test_extract_rarity_returns_none_for_empty_attributes() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[]}"#;
        let uri = make_custom_data_uri(json);
        assert_eq!(extract_rarity_from_uri(&uri), None);
    }

    #[test]
    fn test_extract_rarity_case_insensitive_trait_type() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[{"trait_type":"RARITY","value":"Epic"}]}"#;
        let uri = make_custom_data_uri(json);
        assert_eq!(extract_rarity_from_uri(&uri).as_deref(), Some("Epic"));
    }

    #[test]
    fn test_extract_rarity_picks_first_rarity_trait() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[{"trait_type":"Rarity","value":"Common"},{"trait_type":"Rarity","value":"Epic"}]}"#;
        let uri = make_custom_data_uri(json);
        assert_eq!(extract_rarity_from_uri(&uri).as_deref(), Some("Common"));
    }

    // -----------------------------------------------------------------------
    // price_for_rarity() tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_price_for_all_rarities() {
        assert_eq!(price_for_rarity("Common"), Some(5.0));
        assert_eq!(price_for_rarity("Uncommon"), Some(30.0));
        assert_eq!(price_for_rarity("Rare"), Some(120.0));
        assert_eq!(price_for_rarity("Epic"), Some(600.0));
        assert_eq!(price_for_rarity("Legendary"), Some(2000.0));
        assert_eq!(price_for_rarity("Mythic"), Some(4000.0));
    }

    #[test]
    fn test_price_for_unknown_rarity() {
        assert_eq!(price_for_rarity("Unknown"), None);
        assert_eq!(price_for_rarity(""), None);
        assert_eq!(price_for_rarity("super_rare"), None);
    }

    #[test]
    fn test_price_case_insensitive() {
        assert_eq!(price_for_rarity("COMMON"), Some(5.0));
        assert_eq!(price_for_rarity("common"), Some(5.0));
        assert_eq!(price_for_rarity("CoMmOn"), Some(5.0));
        assert_eq!(price_for_rarity("LEGENDARY"), Some(2000.0));
        assert_eq!(price_for_rarity("legendary"), Some(2000.0));
        assert_eq!(price_for_rarity("MYTHIC"), Some(4000.0));
        assert_eq!(price_for_rarity("mythic"), Some(4000.0));
    }

    #[test]
    fn test_prices_within_treasury_ranges() {
        // Verify each price lands within the correct gacha treasury rarity tier
        // Common: $0 – $15
        let common = price_for_rarity("Common").unwrap();
        assert!(common >= 0.0 && common <= 15.0, "Common ${} not in $0-$15", common);

        // Uncommon: $15.01 – $60
        let uncommon = price_for_rarity("Uncommon").unwrap();
        assert!(uncommon > 15.0 && uncommon <= 60.0, "Uncommon ${} not in $15.01-$60", uncommon);

        // Rare: $60.01 – $250
        let rare = price_for_rarity("Rare").unwrap();
        assert!(rare > 60.0 && rare <= 250.0, "Rare ${} not in $60.01-$250", rare);

        // Epic: $250.01 – $1,200
        let epic = price_for_rarity("Epic").unwrap();
        assert!(epic > 250.0 && epic <= 1200.0, "Epic ${} not in $250.01-$1200", epic);

        // Legendary: $1,200.01+
        let legendary = price_for_rarity("Legendary").unwrap();
        assert!(legendary > 1200.0, "Legendary ${} not > $1200.01", legendary);

        // Mythic: also $1,200.01+ (same treasury tier as Legendary)
        let mythic = price_for_rarity("Mythic").unwrap();
        assert!(mythic > 1200.0, "Mythic ${} not > $1200.01", mythic);
    }

    // -----------------------------------------------------------------------
    // fetch_metadata() parsing (synchronous verification)
    // -----------------------------------------------------------------------

    #[test]
    fn test_fetch_metadata_parses_correctly() {
        let uri = make_pfp_uri(42, "Epic");
        let b64 = uri.strip_prefix(DATA_URI_PREFIX).unwrap();
        let decoded = base64_decode(b64).unwrap();
        let meta: PfpMetadata = serde_json::from_slice(&decoded).unwrap();
        assert_eq!(meta.name, "Gacha PFP #42");
        let rarity_attr = meta.attributes.iter().find(|a| a.trait_type == "Rarity").unwrap();
        assert_eq!(rarity_attr.value, "Epic");
    }

    #[test]
    fn test_fetch_metadata_title_format() {
        for id in [1, 42, 100, 9999] {
            let uri = make_pfp_uri(id, "Common");
            let b64 = uri.strip_prefix(DATA_URI_PREFIX).unwrap();
            let decoded = base64_decode(b64).unwrap();
            let meta: PfpMetadata = serde_json::from_slice(&decoded).unwrap();
            assert_eq!(meta.name, format!("Gacha PFP #{}", id));
        }
    }

    #[test]
    fn test_fetch_metadata_with_extra_attributes() {
        let json = r#"{"name":"Gacha PFP #1","description":"test","attributes":[{"trait_type":"Rarity","value":"Mythic"},{"trait_type":"Background","value":"Blue"}]}"#;
        let uri = make_custom_data_uri(json);
        let b64 = uri.strip_prefix(DATA_URI_PREFIX).unwrap();
        let decoded = base64_decode(b64).unwrap();
        let meta: PfpMetadata = serde_json::from_slice(&decoded).unwrap();
        assert_eq!(meta.attributes.len(), 2);
    }

    #[test]
    fn test_fetch_metadata_no_attributes_field() {
        let json = r#"{"name":"Gacha PFP #1","description":"test"}"#;
        let uri = make_custom_data_uri(json);
        let b64 = uri.strip_prefix(DATA_URI_PREFIX).unwrap();
        let decoded = base64_decode(b64).unwrap();
        let meta: PfpMetadata = serde_json::from_slice(&decoded).unwrap();
        assert!(meta.attributes.is_empty(), "Missing attributes should default to empty");
    }

    // -----------------------------------------------------------------------
    // base64 codec tests
    // -----------------------------------------------------------------------

    #[test]
    fn test_base64_roundtrip() {
        let inputs = [
            b"Hello, World!".as_slice(),
            b"",
            b"a",
            b"ab",
            b"abc",
            b"abcd",
            b"{\"key\":\"value\"}",
        ];
        for input in inputs {
            let encoded = base64_encode(input);
            let decoded = base64_decode(&encoded).unwrap();
            assert_eq!(decoded, input, "Roundtrip failed for {:?}", input);
        }
    }

    #[test]
    fn test_base64_decode_known_value() {
        // "Hello" → "SGVsbG8="
        let decoded = base64_decode("SGVsbG8=").unwrap();
        assert_eq!(decoded, b"Hello");
    }

    #[test]
    fn test_base64_decode_invalid_chars() {
        let result = base64_decode("!!!!");
        assert!(result.is_err());
    }

    #[test]
    fn test_base64_roundtrip_json_metadata() {
        let json = r#"{"name":"Gacha PFP #123","description":"Gacha PFP Collection - Legendary","attributes":[{"trait_type":"Rarity","value":"Legendary"}]}"#;
        let encoded = base64_encode(json.as_bytes());
        let decoded = base64_decode(&encoded).unwrap();
        assert_eq!(std::str::from_utf8(&decoded).unwrap(), json);
    }

    // -----------------------------------------------------------------------
    // End-to-end URI → rarity → price flow
    // -----------------------------------------------------------------------

    #[test]
    fn test_end_to_end_uri_to_price() {
        let test_cases = vec![
            ("Common", 5.0),
            ("Uncommon", 30.0),
            ("Rare", 120.0),
            ("Epic", 600.0),
            ("Legendary", 2000.0),
            ("Mythic", 4000.0),
        ];

        for (rarity, expected_price) in test_cases {
            let uri = make_pfp_uri(1, rarity);
            let extracted = extract_rarity_from_uri(&uri).unwrap();
            let price = price_for_rarity(&extracted).unwrap();
            assert_eq!(price, expected_price, "Wrong price for {}", rarity);
        }
    }

    #[test]
    fn test_end_to_end_missing_rarity_returns_none() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[{"trait_type":"Color","value":"Red"}]}"#;
        let uri = make_custom_data_uri(json);
        let rarity = extract_rarity_from_uri(&uri);
        assert!(rarity.is_none());
    }

    #[test]
    fn test_end_to_end_unknown_rarity_returns_none_price() {
        let json = r#"{"name":"Gacha PFP #1","attributes":[{"trait_type":"Rarity","value":"SuperRare"}]}"#;
        let uri = make_custom_data_uri(json);
        let rarity = extract_rarity_from_uri(&uri).unwrap();
        assert_eq!(price_for_rarity(&rarity), None);
    }
}
