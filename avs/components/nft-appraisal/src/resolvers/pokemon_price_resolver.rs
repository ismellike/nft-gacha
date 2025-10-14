#![allow(dead_code)]
//! Pokemon price resolver using PokemonPriceTracker API
//!
//! This resolver provides pricing information for Pokemon cards using the
//! parse-title endpoint from PokemonPriceTracker API.

use anyhow::{anyhow, Result};
use async_trait::async_trait;
use http::Request;
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};
use wstd::{
    http::{body::BoundedBody, Client, IntoBody},
    io::AsyncRead,
};

use crate::traits::pricing::{AppraisalPrice, PriceResolver, ResolverQuote};
use crate::types::ResolverArgs;

// ============================================================================
// Types
// ============================================================================

// Set API types
#[derive(Debug, Serialize, Deserialize)]
pub struct SetsResponse {
    pub data: Vec<SetData>,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetData {
    pub id: String,
    pub name: String,
    pub series: String,
    pub printed_total: Option<u32>,
    pub total: Option<u32>,
    pub release_date: Option<String>,
    pub logo: Option<String>,
    pub symbol: Option<String>,
    pub card_count: CardCount,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardCount {
    pub official: u32,
    pub normal: u32,
    pub reverse: u32,
    pub holos: u32,
    pub first_edition: Option<u32>,
}

// Card API types
#[derive(Debug, Serialize, Deserialize)]
pub struct CardsResponse {
    pub data: Vec<CardData>,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardData {
    pub id: String,
    pub name: String,
    pub number: String,
    pub rarity: Option<String>,
    pub set: CardSetInfo,
    pub images: CardImages,
    pub tcg_player_id: Option<String>,
    pub market_price: Option<f64>,
    pub artist: Option<String>,
    pub types: Option<Vec<String>>,
    pub hp: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardSetInfo {
    pub id: String,
    pub name: String,
    pub series: String,
    pub printed_total: Option<u32>,
    pub total: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardImages {
    pub small: Option<String>,
    pub large: Option<String>,
}

// Legacy parse-title types (kept as fallback)
#[derive(Debug, Serialize, Deserialize)]
pub struct PokemonPriceResponse {
    pub data: PokemonPriceData,
    pub metadata: ResponseMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PokemonPriceData {
    pub original_title: String,
    pub sanitized_title: String,
    pub parsed: ParsedInfo,
    pub matches: Vec<CardMatch>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedInfo {
    pub confidence: f64,
    pub year: Option<u32>,
    pub psa_grade: Option<u8>,
    pub cgc_grade: Option<u8>,
    pub bgs_grade: Option<f32>,
    pub edition: Option<String>,
    pub set_name: Option<String>,
    pub card_name: Option<String>,
    pub card_number: Option<String>,
    pub variant: Option<String>,
    pub field_confidence: Option<FieldConfidence>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldConfidence {
    pub year: Option<f64>,
    pub grade: Option<f64>,
    pub edition: Option<f64>,
    pub set_name: Option<f64>,
    pub card_name: Option<f64>,
    pub card_number: Option<f64>,
    pub variant: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CardMatch {
    pub tcg_player_id: String,
    pub name: String,
    pub set_name: String,
    pub set_id: String,
    pub card_number: String,
    pub rarity: Option<String>,
    pub artist: Option<String>,
    pub card_type: Option<String>,
    pub match_score: f64,
    pub match_reasons: Vec<String>,
    pub prices: MatchPrices,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchPrices {
    pub market: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseMetadata {
    pub parse_time: Option<String>,
    pub processing_time_ms: u64,
    pub confidence: Option<f64>,
    pub api_calls_consumed: u32,
    pub parsing_method: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardMatchInfo {
    pub card_number: Option<String>,
    pub grade: Option<String>,
    #[allow(dead_code)]
    pub company: Option<String>,
    #[allow(dead_code)]
    pub is_perfect: bool,
    #[allow(dead_code)]
    pub set_name: Option<String>,
    #[allow(dead_code)]
    pub year: Option<String>,
}

// ============================================================================
// Cache Structures
// ============================================================================

#[derive(Debug, Clone)]
struct CachedSet {
    data: SetData,
    #[allow(dead_code)]
    cached_at: SystemTime,
}

#[derive(Debug, Clone)]
struct CachedCard {
    data: CardData,
    cached_at: SystemTime,
}

#[derive(Debug)]
struct PokemonCache {
    sets: Arc<Mutex<HashMap<String, CachedSet>>>, // Key: set name/identifier, Value: set data
    cards: Arc<Mutex<HashMap<String, CachedCard>>>, // Key: set_id + card_number/name, Value: card data
}

impl PokemonCache {
    fn new() -> Self {
        Self {
            sets: Arc::new(Mutex::new(HashMap::new())),
            cards: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // Set cache with indefinite TTL (never expires)
    fn get_set(&self, set_key: &str) -> Option<SetData> {
        if let Ok(sets_cache) = self.sets.lock() {
            sets_cache.get(set_key).map(|cached| cached.data.clone())
        } else {
            None
        }
    }

    fn set_set(&self, set_key: String, set_data: SetData) {
        if let Ok(mut sets_cache) = self.sets.lock() {
            sets_cache.insert(
                set_key,
                CachedSet {
                    data: set_data,
                    cached_at: SystemTime::now(),
                },
            );
        }
    }

    // Card cache with 24-hour TTL
    fn get_card(&self, card_key: &str) -> Option<CardData> {
        if let Ok(cards_cache) = self.cards.lock() {
            if let Some(cached) = cards_cache.get(card_key) {
                // Check if expired (24 hours)
                if let Ok(elapsed) = cached.cached_at.elapsed() {
                    if elapsed < Duration::from_secs(86_400) {
                        return Some(cached.data.clone());
                    }
                }
            }
        }
        None
    }

    fn set_card(&self, card_key: String, card_data: CardData) {
        if let Ok(mut cards_cache) = self.cards.lock() {
            cards_cache.insert(
                card_key,
                CachedCard {
                    data: card_data,
                    cached_at: SystemTime::now(),
                },
            );
        }
    }

    fn generate_set_key(&self, set_name: &str, year: Option<&str>) -> String {
        match year {
            Some(y) => format!("{}:{}", set_name.to_lowercase(), y),
            None => set_name.to_lowercase(),
        }
    }

    fn generate_card_key(&self, set_id: &str, card_identifier: &str) -> String {
        // Card numbers are unique per set, so we can use them directly
        // For names, use lowercase for consistency
        if card_identifier.chars().all(|c| c.is_ascii_digit()) {
            format!("{}:{}", set_id, card_identifier) // Card number - keep as is
        } else {
            format!("{}:{}", set_id, card_identifier.to_lowercase()) // Card name - lowercase
        }
    }
}

// ============================================================================
// Pokemon Price Resolver
// ============================================================================

/// Price resolver for Pokemon cards using PokemonPriceTracker API
pub struct PokemonPriceResolver {
    api_key: String,
    cache: PokemonCache,
}

const POKEMON_PRICE_TRACKER_BASE_URL: &str = "https://www.pokemonpricetracker.com/api/v2";

impl PokemonPriceResolver {
    /// Create a new Pokemon price resolver
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            cache: PokemonCache::new(),
        }
    }

    /// Query the parse-title endpoint to get card information using POST
    async fn query_parse_title(&self, title: &str) -> Result<PokemonPriceResponse> {
        let url = format!("{}/parse-title", POKEMON_PRICE_TRACKER_BASE_URL);

        // Create JSON body for POST request with strict mode always enabled
        let body_str = serde_json::json!({
            "title": title,
            "options": {
                "strictMode": true
            }
        })
        .to_string();

        // Helper to create POST request with JSON body and auth header
        let post_request = |url: &str, json_body: &str| -> Result<Request<BoundedBody<Vec<u8>>>> {
            let body_bytes = json_body.as_bytes().to_vec();

            Request::post(url)
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", self.api_key))
                .body(body_bytes.into_body())
                .map_err(|e| anyhow!("Failed to create HTTP request: {}", e))
        };

        // Create the request
        let request = post_request(&url, &body_str)?;

        // Send the request and get response
        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Failed to send HTTP request: {}", e))?;

        // Check status code
        let status = response.status();
        if status != 200 {
            return Err(anyhow!("HTTP request failed with status: {}", status));
        }

        // Read the response body
        let response_body = response.body_mut();
        let mut body_buf = Vec::new();
        response_body
            .read_to_end(&mut body_buf)
            .await
            .map_err(|e| anyhow!("Failed to read response body: {}", e))?;

        let response_text = String::from_utf8(body_buf)
            .map_err(|e| anyhow!("Failed to decode response body: {}", e))?;

        // Parse JSON response
        let response: PokemonPriceResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse Pokemon API response: {}", e))?;

        Ok(response)
    }

    /// Query the sets endpoint to find set information
    async fn query_sets(&self, search_term: &str) -> Result<SetsResponse> {
        let url = format!(
            "{}/sets?search={}&limit=10",
            POKEMON_PRICE_TRACKER_BASE_URL,
            urlencoding::encode(search_term)
        );

        let request = Request::get(&url)
            .header("authorization", format!("Bearer {}", self.api_key))
            .body(Vec::new().into_body())
            .map_err(|e| anyhow!("Failed to create HTTP request: {}", e))?;

        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Failed to send HTTP request: {}", e))?;

        let status = response.status();
        if status != 200 {
            return Err(anyhow!("HTTP request failed with status: {}", status));
        }

        let response_body = response.body_mut();
        let mut body_buf = Vec::new();
        response_body
            .read_to_end(&mut body_buf)
            .await
            .map_err(|e| anyhow!("Failed to read response body: {}", e))?;

        let response_text = String::from_utf8(body_buf)
            .map_err(|e| anyhow!("Failed to decode response body: {}", e))?;

        let response: SetsResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse sets API response: {}", e))?;

        Ok(response)
    }

    /// Query the cards endpoint for cards in a specific set
    async fn query_cards(&self, set_id: &str, search_term: Option<&str>) -> Result<CardsResponse> {
        let mut url = format!(
            "{}/cards?set={}&limit=100",
            POKEMON_PRICE_TRACKER_BASE_URL, set_id
        );

        if let Some(search) = search_term {
            url.push_str(&format!("&search={}", urlencoding::encode(search)));
        }

        let request = Request::get(&url)
            .header("authorization", format!("Bearer {}", self.api_key))
            .body(Vec::new().into_body())
            .map_err(|e| anyhow!("Failed to create HTTP request: {}", e))?;

        let mut response = Client::new()
            .send(request)
            .await
            .map_err(|e| anyhow!("Failed to send HTTP request: {}", e))?;

        let status = response.status();
        if status != 200 {
            return Err(anyhow!("HTTP request failed with status: {}", status));
        }

        let response_body = response.body_mut();
        let mut body_buf = Vec::new();
        response_body
            .read_to_end(&mut body_buf)
            .await
            .map_err(|e| anyhow!("Failed to read response body: {}", e))?;

        let response_text = String::from_utf8(body_buf)
            .map_err(|e| anyhow!("Failed to decode response body: {}", e))?;

        let response: CardsResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow!("Failed to parse cards API response: {}", e))?;

        Ok(response)
    }

    /// Extract the best price using provided card information instead of parsing from title
    fn extract_best_price_with_info(
        &self,
        data: &PokemonPriceData,
        card_info: Option<&CardMatchInfo>,
    ) -> Option<f64> {
        // Sort matches by multiple criteria:
        // 1. Match score (descending)
        // 2. Card number match (exact match gets priority)
        // 3. Grade match (if grade information is available)
        // 4. Rarity preference (Holo > Rare > Common)
        let mut sorted_matches = data.matches.clone();
        sorted_matches.sort_by(|a, b| {
            // Primary sort: match score (descending)
            match b.match_score.partial_cmp(&a.match_score) {
                Some(std::cmp::Ordering::Equal) => {
                    // Secondary sort: card number match
                    if let Some(info) = card_info {
                        if let (Some(title_num), a_num, b_num) =
                            (&info.card_number, &a.card_number, &b.card_number)
                        {
                            let a_matches = a_num == title_num;
                            let b_matches = b_num == title_num;
                            match (a_matches, b_matches) {
                                (true, false) => return std::cmp::Ordering::Less, // a comes first
                                (false, true) => return std::cmp::Ordering::Greater, // b comes first
                                _ => {} // Continue to next sort criteria
                            }
                        }

                        // Tertiary sort: grade match (if we have grade info)
                        if let Some(title_grade) = &info.grade {
                            let a_grade_matches = self.grade_matches_rarity(&a.rarity, title_grade);
                            let b_grade_matches = self.grade_matches_rarity(&b.rarity, title_grade);
                            match (a_grade_matches, b_grade_matches) {
                                (true, false) => return std::cmp::Ordering::Less, // a comes first
                                (false, true) => return std::cmp::Ordering::Greater, // b comes first
                                _ => {} // Continue to rarity comparison
                            }
                        }
                    }

                    // Final sort: rarity preference
                    self.compare_rarity(a, b)
                }
                Some(order) => order,
                None => std::cmp::Ordering::Equal,
            }
        });

        // First, try to find a high-confidence match with good score
        if let Some(best_match) = sorted_matches.first() {
            // Only accept matches with good confidence scores
            if best_match.match_score >= 0.5 && data.parsed.confidence >= 0.7 {
                return best_match.prices.market;
            }
        }

        // Smart fallback: prioritize exact card number matches even with lower scores
        if let Some(info) = card_info {
            if let Some(title_num) = &info.card_number {
                if let Some(exact_match) = sorted_matches.iter().find(|m| {
                    m.card_number == *title_num && m.match_score >= 0.3 && m.prices.market.is_some()
                }) {
                    return exact_match.prices.market;
                }
            }
        }

        // Fallback: try to use parsed grade information from the API response
        if let Some(_parsed_grade) = self.get_parsed_grade(&data.parsed) {
            // For graded cards, look for matches that might have graded pricing
            for match_item in &sorted_matches {
                if match_item.match_score >= 0.3 && match_item.prices.market.is_some() {
                    return match_item.prices.market;
                }
            }
        }

        // Final fallback: return the highest market price from any match with minimum score
        sorted_matches
            .into_iter()
            .filter(|m| m.match_score >= 0.2) // Very low threshold for fallback
            .filter_map(|m| m.prices.market)
            .max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
    }

    /// Check if a card's rarity matches the expected grade
    fn grade_matches_rarity(&self, rarity: &Option<String>, grade: &str) -> bool {
        let grade_upper = grade.to_uppercase();
        let rarity_upper = rarity
            .as_ref()
            .map(|r| r.to_uppercase())
            .unwrap_or_default();

        // PSA/BGS graded cards typically match rare/holo variants
        if grade_upper.contains("PSA") || grade_upper.contains("BGS") || grade_upper.contains("CGC")
        {
            rarity_upper.contains("RARE")
                || rarity_upper.contains("HOLO")
                || rarity_upper.is_empty()
        } else {
            true // No specific grade, any rarity is acceptable
        }
    }

    /// Compare rarity between two matches (Holo > Rare > Common)
    fn compare_rarity(&self, a: &CardMatch, b: &CardMatch) -> std::cmp::Ordering {
        let a_score = self.rarity_score(&a.rarity);
        let b_score = self.rarity_score(&b.rarity);
        b_score.cmp(&a_score) // Higher score comes first
    }

    /// Assign numeric score to rarity for comparison
    fn rarity_score(&self, rarity: &Option<String>) -> u8 {
        match rarity.as_deref() {
            Some(r) if r.to_uppercase().contains("HOLO") => 3,
            Some(r) if r.to_uppercase().contains("RARE") => 2,
            Some(r) if r.to_uppercase().contains("UNCOMMON") => 1,
            Some(r) if r.to_uppercase().contains("COMMON") => 0,
            _ => 1, // Default to Rare-equivalent for unknown rarities
        }
    }

    /// Get grade information from parsed API response
    fn get_parsed_grade(&self, parsed: &ParsedInfo) -> Option<(String, String)> {
        if let Some(grade) = parsed.psa_grade {
            return Some(("PSA".to_string(), grade.to_string()));
        }
        if let Some(grade) = parsed.cgc_grade {
            return Some(("CGC".to_string(), grade.to_string()));
        }
        if let Some(grade) = parsed.bgs_grade {
            return Some(("BGS".to_string(), grade.to_string()));
        }
        None
    }

    /// Main price resolution method using two-step approach: sets -> cards
    async fn get_price_two_step(
        &self,
        title: &str,
        card_info: Option<&CardMatchInfo>,
    ) -> Result<Option<f64>> {
        // Extract set name and card information from title or card_info
        let set_name = if let Some(info) = &card_info {
            info.set_name.clone()
        } else {
            // Try to extract set name from title - simple approach
            self.extract_set_name_from_title(title)
        };

        let card_name = if let Some(_info) = &card_info {
            // Use card name if available, or extract from title
            Some(title)
        } else {
            Some(title)
        };

        if set_name.is_none() && card_name.is_none() {
            return Err(anyhow!("Cannot determine set name or card name from input"));
        }

        // Step 1: Find the set
        let set_data = if let Some(ref set) = set_name {
            let set_key = self
                .cache
                .generate_set_key(set, card_info.and_then(|i| i.year.as_deref()));

            // Try cache first
            if let Some(cached_set) = self.cache.get_set(&set_key) {
                cached_set
            } else {
                // Query API for sets
                let sets_response = self.query_sets(set).await?;
                if sets_response.data.is_empty() {
                    return Err(anyhow!("No sets found for search term: {}", set));
                }

                // Find the best matching set (first one for now, could be improved)
                let best_set = sets_response.data.into_iter().next().unwrap();

                // Cache the set
                self.cache.set_set(set_key, best_set.clone());
                best_set
            }
        } else {
            return Err(anyhow!("Set name is required for two-step approach"));
        };

        // Step 2: Find the card in the set
        // Prioritize card number since it's unique per set
        let search_term = if let Some(info) = &card_info {
            info.card_number.as_deref().or_else(|| Some(title))
        } else {
            Some(title)
        };

        if let Some(search_term) = search_term {
            let card_key = self.cache.generate_card_key(&set_data.id, search_term);

            // Try card cache first
            if let Some(cached_card) = self.cache.get_card(&card_key) {
                if let Some(price) = cached_card.market_price {
                    return Ok(Some(price));
                }
            } else {
                // Query API for cards in this set
                let cards_response = self.query_cards(&set_data.id, Some(search_term)).await?;

                if !cards_response.data.is_empty() {
                    // Find the matching card (exact match since card numbers are unique per set)
                    let matched_card =
                        self.find_best_matching_card(&cards_response.data, search_term, card_info);

                    if let Some(card) = matched_card {
                        // Cache the card
                        self.cache.set_card(card_key, card.clone());

                        if let Some(price) = card.market_price {
                            return Ok(Some(price));
                        }
                    }
                }
            }
        }

        Ok(None)
    }

    /// Extract set name from card title (simple heuristic)
    fn extract_set_name_from_title(&self, title: &str) -> Option<String> {
        // Common Pokemon set patterns - this is a simple approach
        let known_sets = [
            "Base Set",
            "Jungle",
            "Fossil",
            "Team Rocket",
            "Gym Heroes",
            "Gym Challenge",
            "Neo Genesis",
            "Neo Discovery",
            "Neo Revelation",
            "Neo Destiny",
            "Expedition",
            "Aquapolis",
            "Skyridge",
            "Ruby & Sapphire",
            "Sandstorm",
            "Dragon",
            "Team Magma vs Team Aqua",
            "Hidden Legends",
            "FireRed & LeafGreen",
            "Team Rocket Returns",
            "Deoxys",
            "Emerald",
            "Unseen Forces",
            "Delta Species",
            "Legend Maker",
            "Holon Phantoms",
            "Crystal Guardians",
            "Dragon Frontiers",
            "Power Keepers",
            "Diamond & Pearl",
            "Mysterious Treasures",
            "Secret Wonders",
            "Great Encounters",
            "Stormfront",
            "Platinum",
            "Rising Rivals",
            "Supreme Victors",
            "Arceus",
            "HeartGold & SoulSilver",
            "HS—Unleashed",
            "HS—Undaunted",
            "HS—Triumphant",
            "HS—Colossal",
            "Call of Legends",
            "Black & White",
            "Emerging Powers",
            "Noble Victories",
            "Next Destinations",
            "Dark Explorers",
            "Dragons Exalted",
            "Boundaries Crossed",
            "Plasma Storm",
            "Plasma Freeze",
            "Plasma Blast",
            "Legendary Treasures",
            "X & Y",
            "Flashfire",
            "Furious Fists",
            "Phantom Forces",
            "Primal Clash",
            "Roaring Skies",
            "Ancient Origins",
            "BREAKthrough",
            "BREAKpoint",
            "Fates Collide",
            "Steam Siege",
            "Evolutions",
            "Sun & Moon",
            "Guardians Rising",
            "Burning Shadows",
            "Crimson Invasion",
            "Ultra Prism",
            "Lost Thunder",
            "Team Up",
            "Unified Minds",
            "Cosmic Eclipse",
            "Sword & Shield",
            "Rebel Clash",
            "Darkness Ablaze",
            "Champion's Path",
            "Vivid Voltage",
            "Shining Fates",
            "Battle Styles",
            "Chilling Reign",
            "Evolving Skies",
            "Fusion Strike",
            "Brilliant Stars",
            "Astral Radiance",
            "Pokemon GO",
            "Lost Origin",
            "Silver Tempest",
            "Crown Zenith",
            "Scarlet & Violet",
            "Paldea Evolved",
            "Obsidian Flames",
            "151",
            "Paradox Rift",
            "Temporal Forces",
        ];

        let title_lower = title.to_lowercase();

        for set in known_sets.iter() {
            if title_lower.contains(&set.to_lowercase()) {
                return Some(set.to_string());
            }
        }

        // If no known set found, try to extract year-based sets
        if title_lower.contains("1999") || title_lower.contains("base") {
            return Some("Base Set".to_string());
        }
        if title_lower.contains("fossil") {
            return Some("Fossil".to_string());
        }
        if title_lower.contains("jungle") {
            return Some("Jungle".to_string());
        }

        None
    }

    /// Find the best matching card from a list of cards
    fn find_best_matching_card(
        &self,
        cards: &[CardData],
        search_term: &str,
        card_info: Option<&CardMatchInfo>,
    ) -> Option<CardData> {
        // If we have card number info, do exact match (card numbers are unique per set)
        if let Some(info) = &card_info {
            if let Some(ref card_number) = info.card_number {
                if let Some(card) = cards.iter().find(|c| c.number == *card_number) {
                    return Some(card.clone());
                }
            }
        }

        // Otherwise, try exact name match
        let search_lower = search_term.to_lowercase();
        if let Some(card) = cards.iter().find(|c| c.name.to_lowercase() == search_lower) {
            return Some(card.clone());
        }

        // Fallback: try partial name match
        if let Some(card) = cards.iter().find(|c| {
            let card_name_lower = c.name.to_lowercase();
            card_name_lower.contains(&search_lower) || search_lower.contains(&card_name_lower)
        }) {
            return Some(card.clone());
        }

        None
    }
}

#[async_trait(?Send)]
impl PriceResolver for PokemonPriceResolver {
    fn name(&self) -> &str {
        "PokemonPriceTracker"
    }

    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>> {
        let (title_string, card_info) = match args {
            ResolverArgs::PokemonCardInfo {
                card_number,
                grade,
                company,
                is_perfect,
                set_id,
            } => {
                let card_info = CardMatchInfo {
                    card_number: Some(card_number.clone()),
                    grade: Some(grade.clone()),
                    company: Some(company.clone()),
                    is_perfect: *is_perfect,
                    set_name: Some(set_id.clone()),
                    year: None,
                };
                let title = format!("{} {} {}", set_id, grade, card_number);
                (title, Some(card_info))
            }
        };
        let title = title_string.as_str();

        // Primary approach: Use the new two-step method (sets -> cards)
        match self.get_price_two_step(title, card_info.as_ref()).await {
            Ok(Some(price_value)) => {
                return Ok(Some(ResolverQuote {
                    price: AppraisalPrice {
                        value: price_value,
                        currency: "USD".to_string(),
                        source: self.name().to_string(),
                        context: Some(serde_json::json!({
                            "method": "two_step",
                            "title": title,
                            "card_info": card_info
                        })),
                    },
                    ttl: Duration::from_secs(86_400), // 24 hour TTL for card prices
                }));
            }
            Ok(None) => {
                // No price found with two-step approach, try fallback
            }
            Err(e) => {
                // Two-step approach failed, try fallback to parse-title
                eprintln!(
                    "Two-step approach failed: {}, falling back to parse-title",
                    e
                );
            }
        }

        // Fallback: Use the original parse-title method
        match self.query_parse_title(title).await {
            Ok(response) => {
                // Extract the best price from the matches array using the provided card info
                let price = self.extract_best_price_with_info(&response.data, card_info.as_ref());

                if let Some(price_value) = price {
                    return Ok(Some(ResolverQuote {
                        price: AppraisalPrice {
                            value: price_value,
                            currency: "USD".to_string(),
                            source: self.name().to_string(),
                            context: Some(serde_json::to_value(&response.data)?),
                        },
                        ttl: Duration::from_secs(86_400),
                    }));
                }
            }
            Err(e) => {
                eprintln!("Parse-title fallback also failed: {}", e);
            }
        }

        Ok(None)
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pokemon_price_resolver_creation() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());
        assert_eq!(resolver.name(), "PokemonPriceTracker");
        assert_eq!(resolver.api_key, "test_key");
    }

    #[test]
    fn test_cache_functionality() {
        let cache = PokemonCache::new();

        // Test cache key generation for card numbers vs names
        let number_key = cache.generate_card_key("base1", "4");
        let name_key = cache.generate_card_key("base1", "Charmander");

        assert_eq!(number_key, "base1:4"); // Card number preserved as-is
        assert_eq!(name_key, "base1:charmander"); // Name converted to lowercase

        // Test set cache
        let test_set = SetData {
            id: "base1".to_string(),
            name: "Base Set".to_string(),
            series: "Base".to_string(),
            printed_total: Some(102),
            total: Some(102),
            release_date: Some("1999/01/09".to_string()),
            logo: None,
            symbol: None,
            card_count: CardCount {
                official: 102,
                normal: 83,
                reverse: 19,
                holos: 16,
                first_edition: Some(102),
            },
        };

        let set_key = cache.generate_set_key("Base Set", None);
        cache.set_set(set_key.clone(), test_set.clone());

        let cached_set = cache.get_set(&set_key);
        assert!(cached_set.is_some());
        assert_eq!(cached_set.unwrap().name, "Base Set");

        // Test card cache
        let test_card = CardData {
            id: "base1-1".to_string(),
            name: "Bulbasaur".to_string(),
            number: "1".to_string(),
            rarity: Some("Common".to_string()),
            set: CardSetInfo {
                id: "base1".to_string(),
                name: "Base Set".to_string(),
                series: "Base".to_string(),
                printed_total: Some(102),
                total: Some(102),
            },
            images: CardImages {
                small: None,
                large: None,
            },
            tcg_player_id: Some("12345".to_string()),
            market_price: Some(5.50),
            artist: Some("Ken Sugimori".to_string()),
            types: Some(vec!["Grass".to_string()]),
            hp: Some("70".to_string()),
        };

        let card_key = cache.generate_card_key("base1", "Bulbasaur");
        cache.set_card(card_key.clone(), test_card.clone());

        let cached_card = cache.get_card(&card_key);
        assert!(cached_card.is_some());
        let card = cached_card.unwrap();
        assert_eq!(card.name, "Bulbasaur");
        assert_eq!(card.market_price, Some(5.50));
    }

    #[test]
    fn test_set_name_extraction() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test known set extraction
        assert_eq!(
            resolver.extract_set_name_from_title("1999 Base Set Charizard"),
            Some("Base Set".to_string())
        );
        assert_eq!(
            resolver.extract_set_name_from_title("Fossil Set Articuno"),
            Some("Fossil".to_string())
        );
        assert_eq!(
            resolver.extract_set_name_from_title("Jungle Set Venusaur"),
            Some("Jungle".to_string())
        );

        // Test case insensitivity
        assert_eq!(
            resolver.extract_set_name_from_title("base set pikachu"),
            Some("Base Set".to_string())
        );

        // Test year-based extraction
        assert_eq!(
            resolver.extract_set_name_from_title("1999 Blastoise"),
            Some("Base Set".to_string())
        );

        // Test unknown set
        assert_eq!(
            resolver.extract_set_name_from_title("Unknown Set Card"),
            None
        );
    }

    #[test]
    fn test_card_matching() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        let cards = vec![
            CardData {
                id: "base1-4".to_string(),
                name: "Charmander".to_string(),
                number: "4".to_string(),
                rarity: Some("Common".to_string()),
                set: CardSetInfo {
                    id: "base1".to_string(),
                    name: "Base Set".to_string(),
                    series: "Base".to_string(),
                    printed_total: Some(102),
                    total: Some(102),
                },
                images: CardImages {
                    small: None,
                    large: None,
                },
                tcg_player_id: Some("12348".to_string()),
                market_price: Some(3.25),
                artist: Some("Ken Sugimori".to_string()),
                types: Some(vec!["Fire".to_string()]),
                hp: Some("70".to_string()),
            },
            CardData {
                id: "base1-5".to_string(),
                name: "Charmeleon".to_string(),
                number: "5".to_string(),
                rarity: Some("Uncommon".to_string()),
                set: CardSetInfo {
                    id: "base1".to_string(),
                    name: "Base Set".to_string(),
                    series: "Base".to_string(),
                    printed_total: Some(102),
                    total: Some(102),
                },
                images: CardImages {
                    small: None,
                    large: None,
                },
                tcg_player_id: Some("12349".to_string()),
                market_price: Some(8.50),
                artist: Some("Ken Sugimori".to_string()),
                types: Some(vec!["Fire".to_string()]),
                hp: Some("90".to_string()),
            },
        ];

        // Test card number exact match (priority since card numbers are unique per set)
        let card_info = CardMatchInfo {
            card_number: Some("4".to_string()),
            grade: None,
            company: None,
            is_perfect: false,
            set_name: Some("Base Set".to_string()),
            year: Some("1999".to_string()),
        };

        let best_match = resolver.find_best_matching_card(&cards, "Charmander", Some(&card_info));
        assert!(best_match.is_some());
        assert_eq!(best_match.unwrap().number, "4"); // Should match by card number

        // Test exact name match (no card info provided)
        let best_match = resolver.find_best_matching_card(&cards, "Charmeleon", None);
        assert!(best_match.is_some());
        assert_eq!(best_match.unwrap().name, "Charmeleon");

        // Test case insensitive name match
        let best_match = resolver.find_best_matching_card(&cards, "charmander", None);
        assert!(best_match.is_some());
        assert_eq!(best_match.unwrap().name, "Charmander");

        // Test partial name match fallback
        let best_match = resolver.find_best_matching_card(&cards, "Char", None);
        assert!(best_match.is_some());
        assert!(best_match.unwrap().name.contains("Char"));
    }

    #[test]
    fn test_extract_best_price_with_provided_card_info() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // Test case: Use provided card info instead of parsing from title
        let price_data = PokemonPriceData {
            original_title: "1999 Fossil Articuno".to_string(),
            sanitized_title: "1999 Fossil Articuno".to_string(),
            parsed: ParsedInfo {
                confidence: 0.89,
                year: Some(1999),
                psa_grade: None,
                cgc_grade: None,
                bgs_grade: None,
                edition: None,
                set_name: Some("Fossil".to_string()),
                card_name: Some("Articuno".to_string()),
                card_number: None,
                variant: None,
                field_confidence: None,
            },
            matches: vec![
                CardMatch {
                    tcg_player_id: "44425".to_string(),
                    name: "Articuno (17)".to_string(),
                    set_name: "Fossil".to_string(),
                    set_id: "fossil".to_string(),
                    card_number: "17".to_string(), // Correct card number!
                    rarity: Some("Rare".to_string()),
                    artist: None,
                    card_type: Some("Water".to_string()),
                    match_score: 0.7,
                    match_reasons: vec![
                        "Name matches \"Articuno\"".to_string(),
                        "Set matches \"Fossil\"".to_string(),
                    ],
                    prices: MatchPrices { market: Some(9.15) },
                },
                CardMatch {
                    tcg_player_id: "106518".to_string(),
                    name: "Articuno (2)".to_string(),
                    set_name: "Fossil".to_string(),
                    set_id: "fossil".to_string(),
                    card_number: "02".to_string(), // Wrong card number
                    rarity: Some("Holo Rare".to_string()),
                    artist: None,
                    card_type: Some("Water".to_string()),
                    match_score: 0.7, // Same score as above
                    match_reasons: vec![
                        "Name matches \"Articuno\"".to_string(),
                        "Set matches \"Fossil\"".to_string(),
                    ],
                    prices: MatchPrices {
                        market: Some(120.91),
                    },
                },
            ],
        };

        // Provide card info that specifies card #17 and PSA 8 grade
        let card_info = CardMatchInfo {
            card_number: Some("17".to_string()),
            grade: Some("PSA 8".to_string()),
            company: Some("PSA".to_string()),
            is_perfect: false,
            set_name: Some("Fossil".to_string()),
            year: Some("1999".to_string()),
        };

        let price = resolver.extract_best_price_with_info(&price_data, Some(&card_info));
        assert_eq!(price, Some(9.15)); // Should pick the correct card number match even though it's cheaper
    }

    #[test]
    fn test_grade_matches_rarity() {
        let resolver = PokemonPriceResolver::new("test_key".to_string());

        // PSA grade should match with rare/holo cards
        assert!(resolver.grade_matches_rarity(&Some("Rare".to_string()), "PSA 8"));
        assert!(resolver.grade_matches_rarity(&Some("Holo Rare".to_string()), "PSA 10"));
        assert!(resolver.grade_matches_rarity(&None, "PSA 8")); // No rarity, should still match

        // Non-graded should match anything
        assert!(resolver.grade_matches_rarity(&Some("Common".to_string()), "Base Set"));
        assert!(resolver.grade_matches_rarity(&Some("Rare".to_string()), ""));
    }
}
