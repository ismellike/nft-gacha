use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTMetadata {
    pub collection_name: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub external_url: Option<String>,
    pub image: Option<String>,
    pub animation_url: Option<String>,
    pub video: Option<String>,
    pub token_info: Option<TokenInfo>,
    pub reveal_state: Option<RevealState>,
    pub item_info: Option<ItemInfo>,
    pub attributes: Vec<NFTAttribute>,
    pub product_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenInfo {
    pub token_id: Option<String>,
    pub contract_address: Option<String>,
    pub chain: Option<String>,
    pub proof_of_integrity: Option<ProofOfIntegrityInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProofOfIntegrityInfo {
    pub fingerprint: String,
    pub salt: u64,
    pub hex_proof: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevealState {
    pub revealed: Option<bool>,
    pub reveal_animation: Option<String>,
    pub sealed_pack_image: Option<String>,
    pub sealed_pack_animation: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ItemInfo {
    pub original_owner: Option<String>,
    pub asset_pictures: Option<Vec<String>>,
    pub storage: Option<StorageInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageInfo {
    pub vaulted: Option<bool>,
    pub insured: Option<bool>,
    pub location: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NFTAttribute {
    pub trait_type: Option<String>,
    pub value: serde_json::Value, // Can be string or number
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CourtyardNFTResponse {
    pub token_id: String,
    pub collection_id: String,
    pub metadata: NFTMetadata,
    pub owner: Option<String>,
    pub token_uri: Option<String>,
}
