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

    fn make_pfp_uri(token_id: u32, rarity: &str) -> String {
        let json = format!(
            r#"{{"name":"Gacha PFP #{}","description":"Gacha PFP Collection - {}","attributes":[{{"trait_type":"Rarity","value":"{}"}}]}}"#,
            token_id, rarity, rarity
        );
        let encoded = base64_encode(json.as_bytes());
        format!("{}{}", DATA_URI_PREFIX, encoded)
    }

    #[test]
    fn test_can_handle_pfp_uri() {
        let provider = PfpProvider::new();
        let uri = make_pfp_uri(1, "Common");
        assert!(provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_cannot_handle_non_pfp() {
        let provider = PfpProvider::new();
        assert!(!provider.can_handle_uri("https://courtyard.io/some-nft"));
        assert!(!provider.can_handle_uri("testnet-gacha://1"));
    }

    #[test]
    fn test_cannot_handle_non_gacha_data_uri() {
        let provider = PfpProvider::new();
        let json = r#"{"name":"Other NFT #1","attributes":[]}"#;
        let encoded = base64_encode(json.as_bytes());
        let uri = format!("{}{}", DATA_URI_PREFIX, encoded);
        assert!(!provider.can_handle_uri(&uri));
    }

    #[test]
    fn test_extract_rarity() {
        for rarity in &["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"] {
            let uri = make_pfp_uri(1, rarity);
            let extracted = extract_rarity_from_uri(&uri);
            assert_eq!(extracted.as_deref(), Some(*rarity));
        }
    }

    #[test]
    fn test_price_for_all_rarities() {
        assert_eq!(price_for_rarity("Common"), Some(5.0));
        assert_eq!(price_for_rarity("Uncommon"), Some(30.0));
        assert_eq!(price_for_rarity("Rare"), Some(120.0));
        assert_eq!(price_for_rarity("Epic"), Some(600.0));
        assert_eq!(price_for_rarity("Legendary"), Some(2000.0));
        assert_eq!(price_for_rarity("Mythic"), Some(4000.0));
        assert_eq!(price_for_rarity("Unknown"), None);
    }

    #[test]
    fn test_price_case_insensitive() {
        assert_eq!(price_for_rarity("COMMON"), Some(5.0));
        assert_eq!(price_for_rarity("legendary"), Some(2000.0));
        assert_eq!(price_for_rarity("Mythic"), Some(4000.0));
    }

    #[test]
    fn test_fetch_metadata_parses_correctly() {
        // Test the underlying parsing logic synchronously
        let uri = make_pfp_uri(42, "Epic");
        let b64 = uri.strip_prefix(DATA_URI_PREFIX).unwrap();
        let decoded = base64_decode(b64).unwrap();
        let meta: PfpMetadata = serde_json::from_slice(&decoded).unwrap();
        assert_eq!(meta.name, "Gacha PFP #42");
        let rarity_attr = meta.attributes.iter().find(|a| a.trait_type == "Rarity").unwrap();
        assert_eq!(rarity_attr.value, "Epic");
    }
}
