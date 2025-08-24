# Repository Guidelines

## Project Structure & Modules
- `frontend/`: Next.js + TypeScript app (app router under `src/app`, UI in `src/components`, hooks in `src/hooks`, config in `src/lib`).
- `contracts/`: Foundry workspace for Solidity (`src/`, tests in `test/`, scripts in `script/`).
- `backend/`: Docker Compose for local chains (Anvil), WAVS aggregator/operators, and telemetry.
- `avs/`: WAVS AVS bootstrap tasks and artifacts (`.project-output`).
- `taskfile/` and `Taskfile.yml`: Go Task entrypoints that orchestrate dev flows.

## Build, Test, and Dev Commands
- Bootstrap full stack: `task bootstrap` (spins backend, AVS, codegen, and frontend dev).
- Frontend: `task frontend:dev` (dev), `task frontend:build` (prod build), `task frontend:codegen` (wagmi types), `task frontend:sync-env` (root `.env.local` → `frontend/.env.local`).
- Contracts: `task contracts:build`, `task contracts:test`, `task contracts:deploy WAVS_SERVICE_MANAGER_ADDRESS=0x...`.
- Backend services: `task backend:start` / `task backend:stop`.
- Utilities: `task nft:mint NFT_CONTRACT_ADDRESS=0x... MINT_TO_ADDRESS=0x...`.

## Coding Style & Naming
- TypeScript/React: 2‑space indent, functional components, components in `PascalCase.tsx`, hooks start with `use` in `camelCase`, variables/functions `camelCase`, constants `UPPER_SNAKE`. Lint/format with Biome: `pnpm -C frontend lint` and `pnpm -C frontend format`.
- Solidity: prefer explicit visibility, events/functions `PascalCase`/`camelCase`, constants `UPPER_SNAKE`. Run `forge fmt` before committing.

## Testing Guidelines
- Contracts: Foundry tests in `contracts/test/*.t.sol`. Run locally with `task contracts:test`. Add clear arrange/act/assert sections and NatSpec on public/external interfaces.
- Frontend: none required yet; if contributing, colocate light unit tests near sources and ensure `pnpm -C frontend build` passes type checks.

## Commits & Pull Requests
- Commits: short imperative subject (≤ 50 chars), focused diffs. Example: `Improve rewards distribution logic`.
- PRs: include purpose, linked issues, setup notes, and screenshots for UI changes. Verify locally: `task backend:start`, `task contracts:test`, `pnpm -C frontend build`.

## Security & Configuration
- Secrets: never commit keys. Copy `.env.example` → `.env` and set `DEPLOYER_PRIVATE_KEY`, WAVS config, etc. Local overrides go in `.env.local`. Use `task frontend:sync-env` to expose safe `NEXT_PUBLIC_` vars to the client.
