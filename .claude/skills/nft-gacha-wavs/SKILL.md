---
name: nft-gacha-wavs
description: WAVS AVS infrastructure, operators, aggregator, service deployment. Use when deploying WAVS services, registering operators, updating quorum, or managing AVS workflows. Triggers on "deploy service", "register operator", "update quorum", "AVS setup", or "WAVS workflow".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha WAVS/AVS

## Quick Start

```bash
# Start backend first
task backend:start

# Full AVS deployment
task avs:bootstrap CHAINS=1 OPERATORS=1
```

## Key Concepts

- **WAVS Operators**: Execute WASI components, handle triggers from contracts.
- **WAVS Aggregator**: Batch component outputs, submit to blockchain.
- **Service Manager**: Manage AVS service registration.
- **Quorum**: Fraction of operators required for consensus (e.g., 1/2 = 50%).

## Workflow IDs and Components

- `wavs_drand` workflow uses `wavs_drand` component (DRAND -> VRF).
- `nft_appraisals` workflow uses `nft_appraisal` component (NFT price lookup).

## Standard Deployment Flow

```bash
task backend:start
task avs:components-build
task avs:components-upload
task avs:build-service
task avs:upload-service
task avs:deploy-service WAVS_INSTANCE=1
task avs:register-service
```

## Operator Management

```bash
task avs:register-operators WEIGHT=10000000
task avs:update-quorum QUORUM_NUMERATOR=2 QUORUM_DENOMINATOR=3
```

## WAVS CLI

```bash
task cli:wavs -- service list
task cli:wavs -- workflow get --id <workflow-id>
```

## Prereqs

Set in `.env` or `.env.local` before deploying:
```bash
DEPLOYER_PRIVATE_KEY=0x...
WAVS_SERVICE_MANAGER_ADDRESS=0x...
NFT_APPRAISAL_ADDRESS=0x...
RPC_URL=http://localhost:8548
```

## Service Endpoints

- Operator 1: `http://localhost:9876`
- Operator 2: `http://localhost:9877`
- Aggregator: `http://localhost:8000`

## Examples

### Example 1: Full AVS bootstrap
User says: "set up the WAVS services from scratch"
Actions:
1. Ensure backend is running: `task backend:start`
2. Run `task avs:bootstrap CHAINS=1 OPERATORS=1`
3. Verify: `task backend:health`
Result: All WAVS services deployed, operators registered, workflows active.

### Example 2: Update quorum to 2/3 majority
User says: "change quorum to require 2 out of 3 operators"
Actions:
1. Run `task avs:update-quorum QUORUM_NUMERATOR=2 QUORUM_DENOMINATOR=3`
2. Verify with `task cli:wavs -- service list`
Result: Quorum updated, now requires 66.67% operator agreement.

## Troubleshooting

### Error: Service deployment fails
Cause: Backend not running or missing environment variables.
Solution: Run `task backend:start` and verify `WAVS_SERVICE_MANAGER_ADDRESS` is set in `.env`.

### Error: Operator not responding
Cause: Container may have crashed or port conflict.
Solution: Check `docker logs wavs-operator-1 -f` and `curl http://localhost:9876/health`.

### Error: Component upload fails
Cause: WASM binary not built or outdated.
Solution: Run `task avs:components-build` before `task avs:components-upload`.
