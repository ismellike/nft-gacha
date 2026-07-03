# Contributing to SPINFI

Thank you for your interest in contributing to SPINFI! This document provides guidelines for contributing to the project.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Additional Resources](#additional-resources)

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/nft-gacha.git
cd nft-gacha

# Add the upstream remote
git remote add upstream https://github.com/original-owner/nft-gacha.git
```

### 2. Set Up Development Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Important: Add your wallet keys, RPC endpoints, and contract addresses

# Bootstrap the complete system
task bootstrap
```

See [CLAUDE.md](./CLAUDE.md) for detailed setup instructions and available commands.

### 3. Create a Branch

```bash
# Create a feature branch from main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix
```

### 4. Make Your Changes

**Smart Contracts** (`/contracts`):
```bash
cd contracts
forge build
forge test
```

**Frontend** (`/frontend`):
```bash
cd frontend
pnpm tsc          # Type checking
pnpm lint         # Biome linting with auto-fix
pnpm format       # Biome formatting
```

**After Contract Changes**:
```bash
pnpm codegen      # Generate TypeScript types from contracts
```

### 5. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add rarity multiplier for Legendary NFTs"
```

Commit message prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Style

### Solidity (Smart Contracts)

- **Compiler**: Use Foundry's `forge fmt` for formatting
- **Style**: Follow Solidity style guide
- **Comments**: Use NatSpec for all public/external functions
- **Testing**: Write tests for all contract logic using Foundry

### TypeScript/React (Frontend)

- **Formatter**: Biome (configured in project)
- **Linting**: Run `pnpm lint` before committing
- **Type Checking**: Run `pnpm tsc` to ensure type safety
- **File Organization**:
  - `src/components/` - React components
  - `src/stores/` - Zustand state management
  - `src/async-utils/` - Pure utility functions for async flows
  - `src/lib/` - Configuration and utilities
  - `src/hooks/` - Custom React hooks

### General Guidelines

- Keep functions focused and modular
- Write self-documenting code with clear variable names
- Use existing patterns and conventions from the codebase
- Update documentation when changing functionality

## Testing Requirements

### Smart Contract Tests

All contract changes must include tests:

```bash
# Run all tests
forge test

# Run specific test
forge test --match-test testSpinFlow

# Run with gas reporting
forge test --gas-report
```

**Test Coverage Goals**:
- All public/external functions
- Edge cases (empty pools, zero values, overflow/underflow)
- Revert conditions
- Integration between contracts

### Frontend Tests

```bash
# Run frontend tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Before Submitting

Ensure all checks pass:
- [ ] Smart contract tests pass
- [ ] Frontend type checking passes (`pnpm tsc`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Contract types regenerated after ABI changes (`pnpm codegen`)

## Pull Request Process

### 1. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request

- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your feature branch
- Provide a clear title and description

### PR Title Format

```
type: brief description
```

Examples:
- `feat: add per-rarity yield analytics to the vault`
- `fix: handle empty pool refunds correctly`
- `docs: update contributing guidelines`

### PR Description Template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Bullet point 1
- Bullet point 2

## Testing
- How was this tested?
- Any known issues?

## Checklist
- [ ] Tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Documentation updated (if applicable)
```

### 3. Review Process

- Address review comments promptly
- Keep commit history clean (use `git rebase` if needed)
- Request review from maintainers when ready
- Ensure CI checks pass before requesting merge

### 4. Merge

After approval:
- Squash commits if requested
- Delete your feature branch after merge
- Sync your local main branch

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

## Additional Resources

- **Project Overview**: [CLAUDE.md](./CLAUDE.md)
- **Technical Architecture**: [docs/DESIGN.md](./docs/DESIGN.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Task Commands**: See [Taskfile.yml](./Taskfile.yml) for available automation
- **Frontend Guide**: [frontend/README.md](./frontend/README.md)
- **Contract Development**: [contracts/README.md](./contracts/README.md)

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions or discuss ideas
- **Documentation**: Check existing docs first

## Code of Conduct

Be respectful, constructive, and inclusive. We welcome contributions from everyone regardless of background or experience level.

---

**Thank you for contributing to SPINFI! 🎲**
