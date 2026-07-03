# wavs-drand

A WAVS (WebAssembly Verifiable Services) component that supplies **provably fair
randomness** to the gacha. It fetches a [drand](https://drand.love/) beacon round and
derives a deterministic-but-unpredictable VRF value bound to a specific spin, which the
operators sign and submit on-chain via `GachaServiceHandler`.

## How it works

1. A `RandomnessRequested(triggerId)` event from `Gacha.sol` triggers the component.
2. It computes the drand round for the request and fetches that beacon
   (`drand.rs`), validating the BLS signature against the configured chain.
3. `random_derivation.rs` folds the drand randomness with trigger-specific data
   (`keccak256` over the sources) so every spin gets an independent value that no
   single party can bias.
4. The result is ABI-encoded and returned to WAVS for on-chain fulfillment.

Because the drand round and derivation are deterministic given the trigger, any
observer can recompute and verify a spin's randomness.

## Layout

```
src/
├── lib.rs               # Component entrypoint (WIT operator world)
├── drand.rs             # drand client + beacon signature validation
├── random_derivation.rs # VRF derivation from drand + trigger sources
├── trigger.rs           # Round calculation and trigger parsing
├── config.rs            # Chain / genesis configuration
└── utils.rs
```

## Building & testing

```bash
cargo test                              # Unit + fuzz tests
cargo build --target wasm32-wasip2      # Build the WASI component
```

WIT definitions live in [`../../wit-definitions/operator`](../../wit-definitions/operator).
