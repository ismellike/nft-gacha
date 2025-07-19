# NFT Gacha

A provably fair gacha system where every spin is cryptographically guaranteed - no hidden algorithms, no manipulation, just pure chance backed by decentralized infrastructure.

## How It Works

1. **Admins curate** NFT collections by depositing them into rarity-based pools
2. **Users spin** by paying a fixed fee in the designated ERC20 token  
3. **WAVS-DRAND delivers** cryptographically secure randomness to select your NFT
4. **Fair odds guaranteed** - 70% Common, 20% Uncommon, 6% Rare, 3% Epic, 1% Legendary

## Development

### Smart Contracts
```bash
cd contracts
pnpm install && forge install
forge build
```

### Frontend
```bash
cd frontend
pnpm install && pnpm dev
```
