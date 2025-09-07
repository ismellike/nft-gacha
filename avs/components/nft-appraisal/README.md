# NFT Appraisal Component

A WAVS component for appraising Pokemon trading cards using the Pokemon Price Tracker API with caching, proof-of-integrity verification, and EVM contract event integration.

## Features

- **EVM Contract Event Triggered**: Only responds to EVM contract events with AppraisalRequested signature
- **Real Pokemon Price Tracker API**: Full integration with https://www.pokemonpricetracker.com/api
- **WASI Key-Value Caching**: Built-in caching with configurable TTL (default 24 hours)
- **Grade Support**: PSA 10, PSA 9, raw card pricing from real market data
- **Proof of Integrity**: Courtyard NFT authenticity verification using SHA3 verification
- **ABI-Encoded Responses**: On-chain compatible responses with success/error structs

## Architecture

### Event Integration
Only accepts `TriggerData::EvmContractEvent` - all other trigger types are rejected. Never bubbles errors to chain failures; all errors are encoded as on-chain `AppraisalError` events.

### Flow Architecture
1. **Event Parsing**: Decode `AppraisalRequested(address indexed nftContract, uint256 indexed tokenId)` 
2. **ERC721 Query**: Fetch `tokenURI` from the NFT contract
3. **Courtyard Validation**: Verify URI is from Courtyard API and fetch metadata
4. **Integrity Verification**: Validate proof-of-integrity using SHA3 verification
5. **Pokemon Parsing**: Extract card name, grade, set, etc. from metadata attributes
6. **Price Lookup**: Query Pokemon Price Tracker API with caching
7. **ABI Encoding**: Encode result as `AppraisalSuccess` or `AppraisalError` struct

## Configuration

### Environment Variables (Secrets)
- `POKEMON_PRICE_API_KEY`: Your Pokemon Price Tracker API key (required)

### Host Configuration Variables (Non-Secrets)
- `CACHE_TTL_SECONDS`: Cache expiration time in seconds (default: 86400 = 24 hours)
- `COURTYARD_BASE_URL`: Courtyard API base URL (default: https://api.courtyard.io)

## Request Format (EVM Event Data)

The component expects an EVM contract event with the following Solidity event signature:

```solidity
event AppraisalRequested(address indexed nftContract, uint256 indexed tokenId);
```

The event data is automatically ABI-decoded using the WAVS event decoding pattern. The `nftContract` address and `tokenId` are extracted and converted to hex strings for processing.

**Note**: The component extracts the following information:
- `chain` from `event.chain_name` (EVM event metadata)
- `nftContract` from the ABI-decoded event data (the actual NFT contract to query)
- `tokenId` from the ABI-decoded event data

## Response Format

The component returns ABI-encoded structs directly to WAVS for on-chain emission. Two response types:

### Success Response (`AppraisalSuccess`)
```solidity
struct AppraisalSuccess {
    string chain;           // e.g. "polygon"
    address contractAddress; // NFT contract address
    uint256 tokenId;        // Token ID
    uint256 price;          // Price in USDC-style 6 decimals (micro USD)  
    bytes32 txHash;         // Original transaction hash
}
```

### Error Response (`AppraisalError`)
```solidity
struct AppraisalError {
    string chain;           // e.g. "polygon"
    address contractAddress; // NFT contract address  
    uint256 tokenId;        // Token ID
    string error;           // Human-readable error message
    bytes32 txHash;         // Original transaction hash
}
```

## API Integrations

### Courtyard NFT API
- **Metadata Endpoint**: Fetches NFT metadata from `tokenURI`
- **Card Parsing**: Extracts Pokemon card details from metadata attributes:
  - Card name from `title` or `subject` attributes
  - Grade from grading-related attributes (PSA 10, PSA 9, etc.)
  - Set name, card number, rarity from metadata
- **Proof of Integrity**: SHA3-based authenticity verification
- **Error Handling**: Graceful handling of 404, rate limits, and malformed data

### ERC721 Contract Integration
- **Token URI Query**: Direct RPC calls to fetch `tokenURI(uint256)` 
- **Multi-chain Support**: Works with any EVM chain specified in events
- **Contract Validation**: Verifies contract implements ERC721Metadata

### Pokemon Price Tracker API
- **Endpoint**: `https://www.pokemonpricetracker.com/api/prices`
- **Authentication**: ✅ Bearer token authentication via `Authorization` header
- **Query Parameters**: `name`, `setId` for precise card matching
- **Response Parsing**: JSON with `data`, `error`, and `message` fields  
- **WASI Caching**: Results cached with 24-hour TTL using `wasi:keyvalue/store`
- **Rate Limiting**: Handles 429 responses with clear error messages

### Supported Grade Types
- **PSA 10**: `psa_10_price` field from API
- **PSA 9**: `psa_9_price` field from API
- **raw**: `raw_price` field, fallback to `market_price`
- **market_price**: General market pricing fallback

## Building

```bash
cargo build
cargo test
```

## API Rate Limits

Pokemon Price Tracker API limits:
- **Free Tier**: 200 requests/day
- **API (Non-Commercial)**: 20,000 requests/day  
- **Business**: 200,000 requests/day
- **All plans**: 60 requests per minute

## Testing

```bash
cargo test                    # Run all tests
cargo test --lib             # Library tests only
cargo test courtyard_client  # Specific module tests
```