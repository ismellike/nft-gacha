# NFT Gacha

A decentralized NFT gacha system where users can spin for randomly distributed NFTs across different rarity tiers.

## Overview

- **Admin Controls**: Set spin costs and deposit NFTs into rarity pools
- **Rarity System**: NFTs organized by rarity tiers with weighted probabilities  
- **Provably Fair**: Uses WAVS-DRAND component providing `bytes32` randomness value
- **Single Random Value**: One `bytes32` value determines both rarity tier and specific NFT

## How It Works

1. **Setup**: Admins deposit NFTs into rarity pools and set spin cost
2. **Spin**: Users pay cost, WAVS-DRAND provides single `bytes32` random value
3. **Selection**: Random value determines rarity tier, then specific NFT within that tier
4. **Transfer**: Selected NFT transferred to user

## Development

```bash
cd contracts
forge install
forge build
forge test
```

## Key Functions

- `spin()`: Execute gacha spin with `bytes32` randomness
- `depositNFT(address nftContract, uint256 tokenId, uint8 rarity)`: Add NFT to pool
- `setSpinCost(uint256 cost)`: Update spin cost