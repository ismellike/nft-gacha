# Backend (WAVS Infrastructure)

Docker Compose stack and configuration for the off-chain half of SPINFI: the WAVS
operator/aggregator services that produce randomness and appraisals, plus the local
chain, IPFS, and telemetry they depend on.

You normally don't run these directly — the [Taskfile](../Taskfile.yml) wraps them
(`task backend:*` / `task avs:*`). See [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md)
for the full bring-up.

## Contents

| File | Purpose |
|---|---|
| `wavs.toml` | WAVS service config — chains (local `31337`, Polygon Amoy `80002`, mainnet `137`), IPFS gateway, telemetry endpoints |
| `docker-compose-wavs-instance.yml` | WAVS operator + aggregator services |
| `docker-compose-anvil.yml` | Local Anvil chain |
| `docker-compose-ipfs.yml` | Local IPFS node for component/service artifacts |
| `docker-compose-telemetry.yml` | Prometheus + Jaeger observability |
| `prometheus.yml` | Prometheus scrape config |
| `wavs-home/` | WAVS runtime home (keys, credentials, service state) |

## Common commands

```bash
task avs:backend:start     # Start WAVS + Anvil + IPFS
task avs:backend:stop      # Stop all backend services
task status                # Health-check running services
docker logs wavs-operator-1 --tail 100   # Inspect an operator
```

## Notes

- In `TESTNET`/`MAINNET` modes the local Anvil and IPFS services are skipped —
  `wavs.toml` points at the public RPC and a remote IPFS gateway instead.
- Telemetry is optional; the stack runs without the telemetry compose file.
