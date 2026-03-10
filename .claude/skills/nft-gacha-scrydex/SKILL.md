---
name: nft-gacha-scrydex
description: Scrydex API integration for graded Pokemon card pricing. Use when decoding NFT metadata to extract card info and querying Scrydex for market prices. Triggers on "card price", "Scrydex", "appraisal", "graded card", "Pokemon card value", or "metadata decoding".
metadata:
  author: ismellike
  version: 1.0.0
---

# Scrydex Pricing Skill

Decode graded Pokemon card NFT metadata and query the Scrydex API for pricing data.

For full API response schemas and variant mapping tables, see `references/api-reference.md`.

## Scrydex API Reference

### Authentication

All requests require these headers:
- `X-Api-Key` (required): API key
- `X-Team-ID` (required): Team identifier

Environment variables: `WAVS_ENV_SCRYDEX_API_KEY`, `WAVS_ENV_SCRYDEX_TEAM_ID`

### Endpoints

**Single Card (with prices):**
```
GET https://api.scrydex.com/pokemon/v1/cards/{card_id}?include=prices
```
Card ID format: `{expansion_id}-{card_number}` (e.g., `base1-4` for Charizard)

**Search Cards:**
```
GET https://api.scrydex.com/pokemon/v1/cards?q={query}&include=prices
```

**Search by expansion:**
```
GET https://api.scrydex.com/pokemon/v1/expansions/{expansion_id}/cards?include=prices
```

**List Expansions:**
```
GET https://api.scrydex.com/pokemon/v1/expansions
```

### Query Syntax (Lucene-like)

| Pattern | Example |
|---------|---------|
| Field match | `name:charizard` |
| Quoted phrase | `name:"venusaur v"` |
| AND (implicit) | `name:charizard subtypes:mega` |
| OR | `(subtypes:mega OR subtypes:vmax)` |
| Exclusion | `subtypes:mega -types:water` |
| Wildcard | `name:char*` |
| Range | `national_pokedex_numbers:[1 TO 151]` |
| Nested field | `expansion.id:base1` |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | - | Search filter |
| `page` | int | 1 | Page number |
| `page_size` | int | 100 | Results per page (max 100) |
| `select` | string | all | Comma-delimited fields |
| `include` | string | - | `prices` to include pricing |
| `orderBy` | string | - | Sort field (`-` prefix for DESC) |

### Supported Grading Companies

PSA, CGC, BGS, TAG, SGC

### Price Fields

| Field | Description |
|-------|-------------|
| `low` | Lowest recorded price |
| `mid` | Mid-market price |
| `high` | Highest recorded price |
| `market` | Current market price (primary value) |
| `currency` | `USD` or `JPY` (we require USD) |

## NFT Metadata Decoding

### Extraction Rules

1. **Card Number**: `trait_type` = `"Card Number"` or `"number"`. Normalize by removing leading zeros (`058/102` -> `58/102`).
2. **Grade**: `trait_type` = `"Grade"` or `"rating"`. Extract numeric value (`"GEM MINT 10"` -> `"10"`). Valid range: 0-10.
3. **Company**: `trait_type` = `"Grader"` or `"grading company"`. Uppercase: `PSA`, `BGS`, `CGC`, `SGC`, `CSG`.
4. **Perfect Detection**: Check grade text for: `PRISTINE`, `BLACK LABEL`, `GEM MINT 10`, `PERFECT 10`. Negations like `NOT PRISTINE` return false.
5. **Set ID**: `trait_type` = `"Set"` or `"set name"`. Strip `"Pokemon "` or `"Pokémon "` prefix, take first word, lowercase. (`"Pokemon Base"` -> `"base"`).
6. **Variants**: Attributes without `trait_type` that match known variants (1st Edition, Shadowless, Holo, etc.).

### Card Identifier

Format: `{set_id}-{normalized_card_number}`

Examples:
- Set "Pokemon Base", Card "058/102" -> `base-58/102`
- Set "Pokemon Jungle", Card "005/064" -> `jungle-5/64`

## Codebase References

### Rust (WASI Component)
- **Types**: `packages/nft-appraisal/src/resolvers/scrydex/types.rs`
- **Client**: `packages/nft-appraisal/src/resolvers/scrydex/client.rs`
- **Matcher**: `packages/nft-appraisal/src/resolvers/scrydex/matcher.rs`
- **Parser**: `packages/nft-appraisal/src/providers/courtyard/parser.rs`

### Frontend (TypeScript)
- **Courtyard Utils**: `frontend/src/lib/courtyard-utils.ts`
- **Metadata Validation**: `frontend/src/lib/metadataValidation.ts`
- **NFT Metadata**: `frontend/src/lib/nft-metadata.ts`

## Examples

### Example 1: Look up a specific card price
User says: "what's the price of a PSA 10 Base Set Charizard?"
Actions:
1. Card ID: `base1-4` (Base Set, card #4)
2. Query: `GET /pokemon/v1/cards/base1-4?include=prices`
3. Find variant `unlimitedHolofoil`, grade `10`, company `PSA`
4. Read `market` field for current price
Result: Current market price in USD returned.

### Example 2: Decode Courtyard NFT metadata
User says: "parse this NFT's metadata to get the card info"
Actions:
1. Fetch metadata from `api.courtyard.io`
2. Extract card number, grade, grading company, set, variants
3. Construct card ID and variant string
4. Query Scrydex with constructed identifiers
Result: Card info decoded and matched to Scrydex pricing data.

## Troubleshooting

### Error: 401 Unauthorized from Scrydex API
Cause: Invalid or missing API key/team ID.
Solution: Verify `WAVS_ENV_SCRYDEX_API_KEY` and `WAVS_ENV_SCRYDEX_TEAM_ID` are set correctly in `.env`.

### Error: Card not found (404)
Cause: Incorrect card ID format or card not in Scrydex database.
Solution: Verify card ID format is `{expansion_id}-{card_number}`. Try searching by name instead: `?q=name:charizard`.

### Error: No matching price for grade/variant
Cause: The specific grade+variant+company combination has no price data.
Solution: Try a different variant or check available variants in the card response. Some combinations may not have market data yet.
