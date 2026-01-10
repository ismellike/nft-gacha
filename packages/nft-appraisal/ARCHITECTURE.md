# NFT Appraisal Component Architecture

## Overview

The `nft-appraisal` component is a WASI-compliant WebAssembly module that fetches and appraises NFT values from external APIs (Scrydex, Courtyard). It operates as a WAVS operator component, processing blockchain events and returning pricing data through cryptographic verification.

## System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     WAVS Operator Event                         │
│                  (TriggerAction with event)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AppraisalProcessor                           │
│                     (core/appraisal.rs)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Parse appraisal request from blockchain event         │  │
│  │ 2. Extract token descriptor (chain, address, token_id)   │  │
│  │ 3. Fetch tokenURI from ERC721 contract                  │  │
│  │ 4. Fetch NFT metadata from provider                      │  │
│  │ 5. Resolve pricing via resolver                          │  │
│  │ 6. Encode response as ABI-encoded payload                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Providers  │    │   Resolvers  │    │    Cache     │
│  (metadata)  │    │  (pricing)   │    │  (WASI KV)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Module Structure

### Core (`src/core/`)

Central business logic that orchestrates the appraisal flow.

```
core/
├── appraisal.rs      # Main processor - entry point for appraisal requests
├── context.rs        # Dependency injection container
├── cache.rs          # WASI key-value store caching layer
├── payload.rs        # ABI encoding/decoding for contract responses
└── errors.rs         # Unified error types
```

#### Key Components

**AppraisalProcessor** (`appraisal.rs`)
- Processes blockchain events and orchestrates the appraisal pipeline
- Manages the complete flow from event parsing to response encoding
- Stateless (all dependencies via AppraisalContext)

**AppraisalContext** (`context.rs`)
- Dependency injection container holding:
  - `TokenUriFetcher`: ERC721 contract client
  - `AppraisalCache`: WASI key-value store
  - `ProviderRegistry`: Metadata provider registry
  - `ResolverRegistry`: Price resolver registry
- Constructed from environment variables via `from_env()`

**AppraisalCache** (`cache.rs`)
- Wraps WASI `wasi:keyvalue` store
- 24-hour positive cache, 5-minute negative cache
- Keccak256-based cache key generation

### Providers (`src/providers/`)

Metadata providers that fetch NFT data from external APIs.

```
providers/
├── registry.rs              # Provider registry and trait definitions
└── courtyard/               # Courtyard.io graded card provider
    ├── client.rs            # HTTP client for Courtyard API
    ├── types.rs             # NFTMetadata and attribute types
    ├── verifier.rs          # Cryptographic integrity verification
    ├── parser.rs            # Attribute extraction and parsing
    ├── provider.rs          # MetadataProvider trait implementation
    └── tests.rs             # Unit tests
```

#### Courtyard Provider

**Responsibility**: Fetch and verify graded trading card metadata from Courtyard.

**Flow**:
1. Receive token URI from blockchain event
2. Fetch metadata JSON from Courtyard API
3. Verify cryptographic integrity proof (keccak256 hash)
4. Extract card attributes (grade, grader, set, variant)
5. Infer appropriate price resolver and route
6. Return structured metadata

**Integrity Verification**:
- Uses Solidity's `abi.encodePacked(fingerprint, salt)` algorithm
- Verifies on-chain proof matches computed keccak256 hash
- Fails fast on tampered metadata

### Resolvers (`src/resolvers/`)

Price resolvers that query external pricing APIs.

```
resolvers/
├── registry.rs              # Resolver registry
├── scrydex_resolver.rs      # Shared ScrydexCardInfo type
└── scrydex/                 # Scrydex Pokemon card pricing
    ├── client.rs            # HTTP client for Scrydex API
    ├── types.rs             # API response types
    ├── matcher.rs           # Price matching logic
    ├── resolver.rs          # PriceResolver trait implementation
    └── tests.rs             # Unit tests
```

#### Scrydex Resolver

**Responsibility**: Fetch Pokemon card pricing from Scrydex API.

**Flow**:
1. Receive card identifier (set-cardnumber) and attributes
2. Query Scrydex cards endpoint
3. Match variant (1st Edition, Shadowless, Holo, etc.)
4. Match grade, company, and perfect status
5. Return market price with 24-hour cache TTL

**Price Matching Logic**:
- Variant matching: Normalized case-insensitive string comparison
- Grade matching: Exact string match (e.g., "10", "9.5", "PSA 10")
- Company matching: Case-insensitive (PSA, BGS, CGC)
- Perfect detection: Pristine, Black Label, Perfect grades

### Traits (`src/traits/`)

Trait definitions for extensibility.

```
traits/
├── metadata.rs      # MetadataProvider trait for NFT metadata sources
└── pricing.rs       # PriceResolver trait for pricing data sources
```

#### MetadataProvider Trait

```rust
#[async_trait(?Send)]
pub trait MetadataProvider {
    fn provider_type(&self) -> ProviderType;
    fn can_handle_uri(&self, uri: &str) -> bool;
    async fn fetch_metadata(&self, uri: &str) -> Result<ProviderMetadata>;
}
```

#### PriceResolver Trait

```rust
#[async_trait(?Send)]
pub trait PriceResolver {
    fn name(&self) -> &str;
    async fn get_price(&self, args: &ResolverArgs) -> Result<Option<ResolverQuote>>;
    fn normalize_quote(&self, quote: ResolverQuote) -> ResolverQuote;
}
```

### Types (`src/types/`)

Shared type definitions and routing logic.

```
types/
└── appraisal.rs     # ProviderType, ResolverRoute, ResolverArgs
```

#### Type Hierarchy

```
ProviderType (enum)
├── Courtyard
└── Custom(String)

ResolverKind (enum)
├── PokemonGradedCard
└── Custom(String)

ResolverRoute (struct)
├── kind: ResolverKind
└── args: ResolverArgs

ResolverArgs (enum)
├── ScrydexCardInfo(ScrydexCardInfo)
└── Custom(serde_json::Value)
```

### Utilities (`src/utils/`)

Shared utility functions.

```
utils/
├── event_parser.rs   # Parse appraisal requests from blockchain events
└── erc721_client.rs  # ERC721 contract calls (tokenURI)
```

## WASI Integration

### Host Functions Used

- **`wasi:keyvalue`**: Caching layer for price data
- **`wasi:http`**: HTTP client for external API calls
- **`wavs:host::log`**: Structured logging
- **`wavs:host::get_evm_chain_config`**: Chain configuration

### Entry Point

```rust
fn run(action: TriggerAction) -> Result<Vec<WasmResponse>, String>
```

**Note**: Uses `wstd::runtime::block_on()` because WIT doesn't support async exports yet.

### Permissions Required

```toml
[permissions]
http_hosts = ["*"]           # External API access
file_system = true            # WASI key-value store
```

## Error Handling

### Error Categories

**AppraisalErrorCode** (core/errors.rs):
- `InvalidEvent`: Malformed blockchain event
- `ParsingError`: Failed to parse event data
- `NetworkError`: HTTP request failure
- `UnsupportedProvider`: No provider can handle URI
- `IntegrityVerificationFailed`: Cryptographic proof mismatch
- `PricingError`: Price lookup failed
- `CacheError`: Cache operation failed

### Error Response Format

Errors always return a valid ABI-encoded response with zero price:
```
AppraisalResponse {
    identity: AppraisalIdentity { chain, address, token_id, ... },
    price: None
}
```

## Caching Strategy

### Cache Keys

Generated using `ResolverRoute`:
```
format!("{:?}::{}", route.kind, route.cache_key_fragment())
```

Example: `PokemonGradedCard::base1-4-10-psa-true-firsteditionshadowlessholofoil`

### TTL Policies

- **Positive cache**: 24 hours (successful price lookups)
- **Negative cache**: 5 minutes (failed lookups)
- **Stampede prevention**: Negative cache prevents repeated failed queries

### Cache Invalidation

Currently time-based only. Future improvements:
- Explicit invalidation on known data updates
- Cache warming for popular cards
- Conditional requests with ETags

## Testing Strategy

### Unit Tests

Located in each module's `tests.rs` file:
- Provider tests: Mock API responses, attribute parsing
- Resolver tests: Price matching logic, variant extraction
- Core tests: Price scaling, response encoding

### Integration Tests

**Planned** (not yet implemented):
- Full flow from event to response
- Mock external APIs (wiremock)
- Cache behavior validation

### Test Coverage

Current coverage:
- Courtyard provider: ~450 lines of tests
- Scrydex resolver: ~220 lines of tests
- Core appraisal: ~70 lines of tests

## Performance Characteristics

### Current Behavior

- **Sequential processing**: One appraisal at a time
- **No connection pooling**: New HTTP client per request
- **Single-threaded async**: Uses `wstd::runtime::block_on()`

### Known Bottlenecks

1. **Blocking async in sync context**: WIT limitation
2. **No batch API support**: One HTTP request per card
3. **No request parallelization**: Sequential API calls

### Optimization Opportunities

1. Parallel metadata fetching for batch requests
2. HTTP connection pooling with `reqwest::Client`
3. Batch Scrydex queries (if API supports it)
4. Retry logic with exponential backoff

## Security Considerations

### Cryptographic Verification

Courtyard integrity verification ensures:
- Metadata hasn't been tampered with since minting
- On-chain proof matches off-chain metadata
- Uses `keccak256` hash with Solidity-compatible encoding

### API Key Management

- API keys stored in environment variables
- Never logged or exposed in error messages
- Injected via WAVS operator configuration

### Input Validation

- All user-controlled strings sanitized before use
- Event parsing validates all fields
- Cache keys use deterministic hashing

## Future Improvements

### High Priority

1. **Retry logic**: Exponential backoff for API failures
2. **Circuit breaker**: Prevent cascade failures
3. **Rate limiting**: Protect API quotas
4. **Integration tests**: End-to-end test coverage

### Medium Priority

5. **HTTP connection pooling**: Reuse connections
6. **Batch API support**: Reduce round trips
7. **Cache statistics**: Hit rate tracking
8. **Metrics export**: Prometheus format

### Low Priority

9. **thiserror migration**: Type-safe error handling
10. **Property-based tests**: Proptest for edge cases
11. **Benchmarking suite**: Performance regression tests
12. **Usage examples**: Developer documentation

## Environment Variables

### Required

- `WAVS_ENV_SCRYDEX_API_KEY`: Scrydex API key

### Optional

- `WAVS_ENV_SCRYDEX_TEAM_ID`: Scrydex team ID for quota tracking

## Build and Deployment

### Build Commands

```bash
# Build WASM component
cargo build --release --target wasm32-wasip2

# Output location
target-local/wasm32-wasip2/release/nft_appraisal.wasm
```

### Upload to Operators

```bash
# Upload to all operators
task avs:components-upload

# Upload to specific operator
task avs:components-upload WAVS_INSTANCE=1
```

## Version History

### v0.6.0-alpha.1 (Current)

- Split monolithic files into modular architecture
- Moved registries to domain directories
- Improved test organization
- Enhanced code maintainability

### Previous Versions

See git history for detailed changelog.
