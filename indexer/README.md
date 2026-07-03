# Indexer

A [Ponder](https://ponder.sh/) indexer that ingests `Gacha` and `GachaTreasury`
events and serves them over GraphQL/HTTP. It powers the analytics, leaderboard, and
spin-history views in the frontend without hammering the RPC for historical data.

## Configuration

Configured entirely through environment variables (see [`.env.example`](./.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `RPC_URL` | `http://localhost:8545` | Chain RPC endpoint |
| `CHAIN_ID` | `31337` | Target chain ID |
| `GACHA_ADDRESS` | — | Deployed `Gacha` proxy |
| `TREASURY_ADDRESS` | — | Deployed `GachaTreasury` proxy |
| `START_BLOCK` | `0` | Block to begin indexing from (use the deploy block) |

Contract wiring lives in [`ponder.config.ts`](./ponder.config.ts); ABIs are in
[`abis/`](./abis). Regenerate ABIs from Foundry artifacts when contract events change.

## Commands

```bash
pnpm install
pnpm codegen     # Generate Ponder types from the schema
pnpm dev         # Run with hot reload (local development)
pnpm start       # Run in production mode
pnpm serve       # Serve the GraphQL/HTTP API only
```

A `Dockerfile` and `docker-compose.yml` are provided for containerized runs.
