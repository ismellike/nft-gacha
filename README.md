# NFT Gacha System

A provably fair, decentralized NFT gacha platform where every spin is cryptographically guaranteed. Built with security-first architecture and transparent reward mechanics.

## 🎮 How It Works

### **For Players**
1. **Connect Wallet** and approve ERC20 token spending
2. **Pay Spin Fee** (configurable by admin)
3. **Get Fair Results** via WAVS-DRAND cryptographic randomness
4. **Receive NFT** from the selected rarity pool
5. **Automatic Refund** if selected rarity is temporarily empty

### **For NFT Contributors**
1. **Submit NFTs** with proposed rarity classification
2. **Await Approval** from admin for quality and rarity validation  
3. **Earn Dividends** automatically when NFTs are approved
4. **Claim Rewards** from proportional share of 90% of all spin fees
5. **Benefit from Multipliers** - rarer deposits earn higher reward rates

### **For Administrators**
1. **Curate Submissions** - approve/deny NFT deposits by rarity
2. **Configure Parameters** - adjust spin fees, rarity weights, multipliers
3. **Emergency Controls** - pause system if issues detected
4. **Monitor Health** - track treasury levels and distribution patterns

## 🛠️ Development

### **Prerequisites**
- [Foundry](https://getfoundry.sh/) - Ethereum development toolkit
- [Node.js 18+](https://nodejs.org/) - For frontend development
- [pnpm](https://pnpm.io/) - Package manager

### **Smart Contracts**
```bash
cd contracts
pnpm install && forge install  # Install dependencies
forge build                    # Compile contracts  
forge test                     # Run test suite (54 tests)
forge test --gas-report        # Gas usage analysis
forge coverage                 # Test coverage report
```

### **Frontend**
```bash
cd frontend
pnpm install                   # Install dependencies
pnpm dev                       # Start development server (http://localhost:3000)
pnpm build                     # Build for production
pnpm start                     # Start production server
```

## 📊 Economic Model

### **Fee Distribution**
```
Spin Fee: 100% collected
├── 90% → NFT Contributors (as dividends)
│   ├── Distributed by rarity pool size
│   └── Multiplied by rarity bonuses (1x-3x)
└── 10% → Protocol Treasury
```

### **Rarity Distribution** 
```
Random Roll (0-9999):
├── 0-6999   (70%) → Common NFTs
├── 7000-8999 (20%) → Uncommon NFTs  
├── 9000-9599 (6%)  → Rare NFTs
├── 9600-9899 (3%)  → Epic NFTs
└── 9900-9999 (1%)  → Legendary NFTs
```

### **Reward Multipliers**
- **Common**: 1.0x base reward rate
- **Uncommon**: 1.2x reward multiplier  
- **Rare**: 1.5x reward multiplier
- **Epic**: 2.0x reward multiplier
- **Legendary**: 3.0x reward multiplier

### **Configuration**
```solidity
// Example deployment configuration
gacha.setSpinFee(100e18);                    // 100 tokens per spin
gacha.setRarityWeights(7000, 2000, 600, 300, 100); // Default distribution
rewardsManager.setRarityMultiplier(Legendary, 30000); // 3.0x multiplier
```