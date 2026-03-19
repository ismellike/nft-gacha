---
name: nft-gacha-wasi
description: WASI/Rust components for off-chain compute. NFT appraisal, DRAND randomness, aggregator. Use when editing packages/, building WASM, or working with WAVS operators. Triggers on "build WASM", "edit Rust component", "WASI", "DRAND", "nft appraisal component", or "cargo build wasm".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha WASI Components

## Components

### nft-appraisal (workflow component: `nft_appraisal`)
Fetch NFT prices from external APIs (Scrydex, Courtyard).
- Source: `packages/nft-appraisal/`
- Build: `cargo build --release --target wasm32-wasip2`
- Output: `target-local/wasm32-wasip2/release/nft_appraisal.wasm`

#### Scrydex API Integration
The nft-appraisal component integrates with Scrydex API for graded card pricing. See `nft-gacha-scrydex` skill for full API details.

### wavs-drand (workflow component: `wavs_drand`)
Derive VRF randomness using DRAND beacon.
- Source: `packages/wavs-drand/`
- Build: `cargo build --release --target wasm32-wasip2`
- Output: `target-local/wasm32-wasip2/release/wavs_drand.wasm`

### aggregator-simple
Aggregate component outputs, submit to blockchain.
- Source: `packages/aggregator-simple/`
- Build: `cargo build --release --target wasm32-wasip2`
- Output: `target-local/wasm32-wasip2/release/aggregator_simple.wasm`

## Build & Upload

```bash
task avs:components-build
task avs:components-upload
task avs:components-upload WAVS_INSTANCE=1
```

For single components:
```bash
cd packages/<component>
cargo build --release --target wasm32-wasip2
```

## Toolchain Prereqs

```bash
rustup target add wasm32-wasip2
```

## WIT Definitions

Use `wit-definitions/` for interfaces:
- `operator/wit/`
- `aggregator/wit/`
- `types/`

Refresh when interfaces change:
```bash
task component:fetch-wit
```

## Component Entry Points

Use `wit_bindgen::generate!()` and keep entrypoints stable:
```rust
fn run(action: TriggerAction) -> Result<Vec<WasmResponse>, String>
fn process_packet(packet: Packet) -> Result<Vec<AggregatorAction>, String>
```

## Permissions

Set in service config:
- `http_hosts: ["*"]` for API calls
- `file_system: true` for WASI key-value cache

## Examples

### Example 1: Modify the appraisal resolver
User says: "add a new price source to nft-appraisal"
Actions:
1. Read `packages/nft-appraisal/src/resolvers/` for existing patterns
2. Create new resolver implementing `PriceResolver` trait
3. Register in the resolver chain
4. Build: `cargo build --release --target wasm32-wasip2`
5. Upload: `task avs:components-upload`
Result: New price source integrated and deployed to operators.

### Example 2: Build and deploy all components
User says: "rebuild all WASI components and upload them"
Actions:
1. Run `task avs:components-build`
2. Verify build output in `target-local/wasm32-wasip2/release/`
3. Run `task avs:components-upload`
Result: All WASM binaries rebuilt and uploaded to WAVS operators.

## Troubleshooting

### Error: `wasm32-wasip2` target not found
Cause: Rust target not installed.
Solution: Run `rustup target add wasm32-wasip2`.

### Error: Build fails with missing WIT bindings
Cause: WIT definitions are outdated or missing.
Solution: Run `task component:fetch-wit` to refresh WIT definitions, then rebuild.

### Error: Component upload fails with "binary too large"
Cause: Debug build instead of release build.
Solution: Ensure you're using `--release` flag: `cargo build --release --target wasm32-wasip2`.

### Error: HTTP calls fail at runtime
Cause: Missing `http_hosts` permission in service config.
Solution: Ensure the service config includes `http_hosts: ["*"]` for the component that needs API access.
