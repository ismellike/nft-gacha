# 🎲 NFT Gacha System

> **The future of fair NFT distribution is here.** A provably fair, decentralized gacha platform where every spin is cryptographically guaranteed and every participant earns rewards.

## ✨ Why This Matters

NFT distribution has been broken from the start. Fixed-price mints lack excitement, Dutch auctions favor the wealthy, and traditional raffles can be manipulated. But what if collecting NFTs could be thrilling, fair, and rewarding for everyone involved?

- **🎲 Pure Excitement**: The thrill of not knowing what rarity you'll get until the moment it's revealed
- **🔒 Cryptographically Fair**: WAVS-DRAND ensures every outcome is genuinely random and verifiable
- **💰 Sustainable Rewards**: Contributors earn ongoing dividends, creating lasting value beyond initial sales
- **⚖️ Transparent Odds**: No hidden mechanics - all probabilities and economics are on-chain
- **🎮 Engaging Experience**: Turn NFT acquisition into an interactive game that people actually want to play

## 🚀 Quick Start

Get the complete gacha system running locally in under 5 minutes:

```bash
# Clone the repository
git clone <repo-url>
cd nft-gacha-new

# Start the complete development environment
task backend:start      # Launch WAVS infrastructure
task contracts:deploy   # Deploy gacha system (50 NFTs across 5 rarities)
task frontend:codegen   # Generate TypeScript bindings
task frontend:dev       # Start frontend at http://localhost:3000
```

That's it! You now have a fully functional NFT gacha system with:
- 🎯 **50 NFTs** ready for spinning (10 per rarity tier)
- 🔗 **Smart contracts** deployed to local WAVS chain
- 🌐 **Frontend interface** for wallet connections and spins
- ⚡ **Real randomness** via WAVS-DRAND integration

## 🎮 How It Works

### **For Players**
1. **Connect Wallet** and approve token spending
2. **Pay Spin Fee** to participate in the gacha
3. **Get Fair Results** via cryptographic randomness
4. **Receive NFT** from the selected rarity pool
5. **Automatic Refund** if selected rarity is empty

### **For NFT Contributors** 
1. **Submit NFTs** with proposed rarity classification
2. **Earn Dividends** from 90% of all spin fees automatically
3. **Benefit from Multipliers** - rarer NFTs earn 3x more rewards
4. **Build Passive Income** as the platform grows

### **For Administrators**
1. **Curate Quality** by approving/denying NFT submissions
2. **Configure Economics** - adjust fees, weights, and multipliers
3. **Monitor Health** with built-in treasury analytics
4. **Emergency Controls** to pause if needed

## 📊 Proven Economics

### **Rarity Distribution** 
```
🎲 Every spin (0-9999):
├── 0-6999   (70%) → Common NFTs    💚
├── 7000-8999 (20%) → Uncommon NFTs  💙
├── 9000-9599 (6%)  → Rare NFTs     💜  
├── 9600-9899 (3%)  → Epic NFTs     🧡
└── 9900-9999 (1%)  → Legendary NFTs ⭐
```

### **Reward System**
```
💰 Every 100 token spin:
├── 90 tokens → NFT Contributors
│   ├── Common holders: 1.0x multiplier
│   ├── Uncommon holders: 1.2x multiplier
│   ├── Rare holders: 1.5x multiplier
│   ├── Epic holders: 2.0x multiplier
│   └── Legendary holders: 3.0x multiplier
└── 10 tokens → Protocol Treasury
```

## 🛠️ Technology Stack

**Smart Contracts**
- **Solidity 0.8.27** with custom errors for gas efficiency
- **OpenZeppelin** security-audited libraries
- **WAVS Integration** for cryptographic randomness
- **Foundry** for testing and deployment

**Frontend**
- **Next.js 15** with App Router
- **RainbowKit** for seamless wallet connections
- **wagmi + viem** for type-safe Web3 interactions
- **TypeScript** for full type safety

**Infrastructure**
- **WAVS-DRAND** for provably fair randomness
- **Docker** containerized development environment
- **Task** for streamlined development workflow

## 🔐 Security Features

- **Reentrancy Protection** on all state-changing functions
- **Pausable Contracts** for emergency stops
- **Owner Access Controls** with role-based permissions
- **Input Validation** prevents edge case exploits
- **Automatic Refunds** when rarity pools are empty
- **Gas Optimized** custom errors and efficient storage

## 🎯 What Makes This Special

1. **Actually Fair**: Unlike traditional gacha games, our randomness is cryptographically verifiable
2. **Sustainable Economy**: Contributors earn ongoing rewards, not just one-time payments
3. **Community Driven**: Anyone can contribute NFTs and earn from the ecosystem
4. **Transparent**: All odds, fees, and distributions are on-chain and auditable
5. **Battle Tested**: Comprehensive test suite with edge case coverage

## 📈 Vision

We're building the infrastructure for the next generation of NFT distribution. No more unfair drops, no more bot manipulation, no more whale dominance. Just pure, provably fair fun where everyone can participate and earn.

**Join us in revolutionizing how NFTs are distributed. Every spin is fair. Every contributor earns. Every player wins.**

---

*Built with ❤️ for the decentralized future*