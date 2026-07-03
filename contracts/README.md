# SPINFI Contracts

Solidity smart contracts for the SPINFI provably-fair NFT gacha, built with [Foundry](https://book.getfoundry.sh/).

These contracts run the on-chain half of the system: they take spin fees, request
cryptographic randomness from the WAVS-DRAND AVS, draw an NFT from a rarity-tiered
treasury, and route revenue to the depositors who supplied the inventory.

## Layout

```
src/
├── gacha/         # Gacha.sol, GachaTreasury.sol, GachaTreasuryReader.sol, service handler
├── economy/       # GachaEconomyManager, CardGroupedVault, ProtocolTreasury
├── appraisal/     # NFTAppraisal.sol + WAVS service handler (price → rarity)
├── governance/    # GachaTimelock.sol
├── tokens/        # Base ERC20/ERC721, GachaPFP, testnet helpers
├── interfaces/    # Contract interfaces and shared types
└── utils/         # ERC20BatchQuery and helpers

script/            # DeployLocal / DeployTestnet / DeployMainnet
test/              # Unit, integration, and invariant tests (+ mocks/)
```

## Odds model

Draw odds are **uniform-over-pool**: a tier is chosen with probability
`counts[i] / totalCount`, then a uniform NFT within it, so every NFT in the treasury
has an equal `1 / totalCount` chance of being drawn. There is no configurable
rarity-weight knob — the live odds *are* the current pool composition
(`getCurrentRarityWeights()`), fully verifiable on-chain. Rarity is a descriptive
label derived from each NFT's USD appraisal, not a probability input.

## Development

```bash
forge build                     # Compile
forge test                      # Run all tests
forge test --match-test <name>  # Run a specific test
forge fmt                       # Format
forge snapshot                  # Gas snapshots
forge coverage                  # Coverage report
```

Compiler: Solidity `^0.8.27` with the optimizer (200 runs) and IR-based codegen
(`via_ir = true`). See `foundry.toml` for the full profile set.

## Deployment

- **Local** — `forge script script/DeployLocal.s.sol` (or `task contracts:deploy`)
- **Testnet / mainnet** — see [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for the full
  end-to-end deploy (WAVS infrastructure, contracts, operators, and frontend), including
  contract verification and failed-deploy recovery. Scripts: `DeployTestnet.s.sol`,
  `DeployMainnet.s.sol`.

## Security

The full trust model, invariants, and known considerations prepared for audit live
in [SECURITY.md](./SECURITY.md). Analysis config for [Slither](https://github.com/crytic/slither)
is in `slither.config.json`.

## More

Architecture and economic design: [docs/DESIGN.md](../docs/DESIGN.md).
Working notes for contributors: [CLAUDE.md](./CLAUDE.md).
