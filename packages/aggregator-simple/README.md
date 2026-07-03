# aggregator-simple

A WAVS **aggregator** component. Operators run their compute components (e.g.
[`wavs-drand`](../wavs-drand), [`nft-appraisal`](../nft-appraisal)) and hand their
signed outputs to the aggregator, which decides when and how to submit the result
on-chain.

## Responsibilities

- Collect operator submissions for a workflow and package them into an
  `EvmSubmitAction` for on-chain delivery.
- Apply an optional submission delay via a `TimerAction` (configurable through the
  `timer_delay_secs` service config var).
- Consult a gas oracle (`gas_oracle.rs`) so submissions carry sane gas parameters.

## Layout

```
src/
├── lib.rs         # process_input: turns AggregatorInput into AggregatorActions
├── gas_oracle.rs  # Gas price estimation for submissions
├── world.rs       # Generated WIT bindings (aggregator world)
└── utils.rs
```

## Building & testing

```bash
cargo test
cargo build --target wasm32-wasip2      # Build the WASI component
```

WIT definitions live in [`../../wit-definitions/aggregator`](../../wit-definitions/aggregator).
