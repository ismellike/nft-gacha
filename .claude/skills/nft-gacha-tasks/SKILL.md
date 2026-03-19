---
name: nft-gacha-tasks
description: Taskfile task automation for the NFT gacha project. Use when running task commands, adding tasks, or troubleshooting task workflows. Triggers on "run task", "bootstrap", "list tasks", "start backend", "build contracts", or "what tasks are available".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha Taskfile

## Quick Commands

```bash
task --list              # List all tasks
task bootstrap           # Full system setup
task contracts:build     # Build contracts
task frontend:codegen    # Generate types
task backend:start       # Start services
```

## Standard Workflows

### Bootstrap & Setup
```bash
task bootstrap
task backend:start
task frontend:sync-env
```

### Contracts
```bash
task contracts:build
task contracts:test
task contracts:deploy WAVS_SERVICE_MANAGER_ADDRESS=0x...
```

### Frontend
```bash
task frontend:install
task frontend:codegen
```

### AVS/WAVS
```bash
task avs:bootstrap
task avs:components-build
task avs:components-upload
```

### Backend
```bash
task backend:start CHAINS=1 OPERATORS=1
task backend:health
task backend:logs
task backend:clean
```

## Use Taskfile Sources

- Prefer task commands over direct tooling unless debugging.
- Confirm task variables and defaults in `taskfile/*.yml`.
- Use `Taskfile.yml` for top-level includes and shared vars.

## Environment Prereqs

Set these in `.env` or `.env.local` before deploy/run tasks:
```bash
DEPLOYER_PRIVATE_KEY=0x...
WAVS_SERVICE_MANAGER_ADDRESS=0x...
RPC_URL=http://localhost:8548
CHAIN_ID=31337
```

## Task Conventions

- Pass variables as `VAR=value` on the task command.
- Read `preconditions:` errors to identify missing vars or services.
- Use `deps:` to understand hidden prerequisites.

## Examples

### Example 1: Full system bootstrap
User says: "set up the whole project from scratch"
Actions:
1. Run `task bootstrap`
2. Verify with `task backend:health`
Result: All services running, contracts deployed, frontend types generated.

### Example 2: Rebuild after contract changes
User says: "I changed a contract, update everything"
Actions:
1. `task contracts:build`
2. `task contracts:test`
3. `task frontend:codegen`
Result: Contracts compiled, tests pass, frontend types regenerated.

## Troubleshooting

### Error: "precondition not met"
Cause: A required environment variable or service is missing.
Solution: Check `.env` for the variable mentioned in the error. Run `task backend:health` to verify services.

### Error: Task not found
Cause: Typo in task name or missing Taskfile include.
Solution: Run `task --list` to see all available tasks and verify spelling.

### Error: Backend services not starting
Cause: Docker not running or port conflicts.
Solution: Ensure Docker is running. Check `ss -lntp` for port conflicts on 8548, 9876, 8000.
