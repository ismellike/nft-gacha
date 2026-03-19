---
name: nft-gacha-docker
description: Docker infrastructure for WAVS operators, aggregator, Anvil chain, monitoring. Use when managing Docker services, debugging containers, or working with task backend:* commands. Triggers on "start backend", "docker logs", "container not working", "check health", "restart service", or "port conflict".
metadata:
  author: ismellike
  version: 1.0.0
---

# NFT Gacha Docker Infrastructure

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Anvil | 8548 | Local blockchain (EVM) |
| WAVS Operator 1 | 9876 | Operator dev endpoint |
| WAVS Operator 2 | 9877 | Operator dev endpoint |
| WAVS Aggregator | 8000 | Aggregation service |
| Jaeger UI | 16686 | Tracing visualization |
| Prometheus | 9090 | Metrics dashboard |

## Quick Commands

```bash
task backend:start CHAINS=1 OPERATORS=1
task backend:stop
task backend:health
task backend:logs
task backend:clean
```

Prefer task wrappers over direct `docker compose` commands.

## Container Names

- `wavs-operator-1`, `wavs-operator-2` - WAVS operator instances
- `wavs-aggregator` - Aggregation service
- `anvil` - Local blockchain
- `jaeger` - Distributed tracing
- `prometheus` - Metrics collection

## Debugging

```bash
docker logs wavs-operator-1 -f
task backend:logs
```

```bash
curl http://localhost:9876/health
curl http://localhost:8000/health
curl http://localhost:8548  # Anvil RPC
```

```bash
docker exec -it wavs-operator-1 sh
docker restart wavs-operator-1
```

## Monitoring

- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

## Caution

`task backend:clean` removes containers and can wipe local state. Use only when you want a reset.

## Examples

### Example 1: Start the full backend
User says: "start all the backend services"
Actions:
1. Run `task backend:start CHAINS=1 OPERATORS=1`
2. Wait 30-60 seconds for full startup
3. Verify with `task backend:health`
Result: All containers running, health checks pass.

### Example 2: Debug a failing operator
User says: "operator 1 seems to be down"
Actions:
1. Check status: `docker ps | grep wavs-operator-1`
2. Check logs: `docker logs wavs-operator-1 --tail 50`
3. Check health: `curl http://localhost:9876/health`
4. Restart if needed: `docker restart wavs-operator-1`
Result: Root cause identified and operator restored.

## Troubleshooting

### Error: Port already in use
Cause: Another process is using a required port (8548, 9876, 8000, etc.).
Solution: Run `ss -lntp | grep <port>` to find the conflicting process. Stop it or change the port mapping.

### Error: Container exits immediately
Cause: Missing environment variables or volume mount issues.
Solution: Check `docker logs <container-name>` for the error message. Ensure `.env` has all required variables.

### Error: Services not ready after start
Cause: Services need 30-60 seconds to fully initialize.
Solution: Wait and retry `task backend:health`. If still failing, check individual container logs.

### Error: "task backend:clean" didn't fully reset
Cause: Docker volumes may persist.
Solution: Run `docker volume prune` after `task backend:clean` for a complete reset.
