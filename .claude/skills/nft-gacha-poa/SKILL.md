---
name: nft-gacha-poa
description: POA middleware for operator registration, signing keys, quorum. Use when deploying middleware, registering operators, or updating quorum settings. Triggers on "register operator", "update signing key", "change quorum", "deploy middleware", or "operator weight".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha POA Middleware

## Deploy Middleware

```bash
task middleware:deploy
```

Require backend running and `DEPLOYER_PRIVATE_KEY` set.

## Operator Lifecycle

```bash
task middleware:register-operator OPERATOR_ADDRESS=0x... WEIGHT=10000000
task middleware:update-signing-key OPERATOR_KEY=0x... SIGNING_KEY=0x...
task middleware:update-operator-weight OPERATOR_ADDRESS=0x... WEIGHT=20000000
task middleware:deregister-operator OPERATOR_ADDRESS=0x...
```

Treat **WEIGHT** as voting power in consensus.

## Quorum

```bash
task middleware:update-quorum QUORUM_NUMERATOR=1 QUORUM_DENOMINATOR=2
```

Use QUORUM = NUMERATOR / DENOMINATOR:
- `1/2` = 50%
- `2/3` = 66.67%
- `3/5` = 60%

## Deployment Artifacts

Read addresses from:
```
.project-output/chain-<n>/avs/avs_deploy.json
```

## Get Addresses

```bash
task middleware:get-service-manager-address
task middleware:get-stake-registry-address
```

## Docker Image

```
ghcr.io/lay3rlabs/poa-middleware:1.0.1
```

Use ARM64 image when needed:
```
ghcr.io/lay3rlabs/poa-middleware:1.0.1-arm64
```

## Upstream

https://github.com/Lay3rLabs/poa-middleware

## Examples

### Example 1: Register a new operator
User says: "add a new operator with 10M weight"
Actions:
1. Get operator address from `.env` or user input
2. Run `task middleware:register-operator OPERATOR_ADDRESS=0x... WEIGHT=10000000`
3. Verify with `task cli:wavs -- service list`
Result: Operator registered with specified voting weight.

### Example 2: Update quorum for higher security
User says: "require 2/3 majority for consensus"
Actions:
1. Run `task middleware:update-quorum QUORUM_NUMERATOR=2 QUORUM_DENOMINATOR=3`
2. Verify quorum change took effect
Result: Consensus now requires 66.67% operator agreement.

## Troubleshooting

### Error: Operator registration fails
Cause: Backend not running or deployer key not set.
Solution: Ensure `task backend:start` has been run and `DEPLOYER_PRIVATE_KEY` is set in `.env`.

### Error: Signing key update rejected
Cause: Operator key does not match a registered operator.
Solution: Verify `OPERATOR_KEY` matches a registered operator address. Check `.project-output/chain-<n>/avs/avs_deploy.json` for registered addresses.

### Error: Quorum denominator is zero
Cause: Invalid quorum parameters.
Solution: Both QUORUM_NUMERATOR and QUORUM_DENOMINATOR must be positive integers, with numerator <= denominator.
