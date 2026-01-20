# Test Framework Guide

This document provides comprehensive guidance for working with the NFT Gacha contracts test framework.

## Table of Contents

- [Running Tests](#running-tests)
- [Test Organization](#test-organization)
- [Writing New Tests](#writing-new-tests)
- [Test Types](#test-types)
- [Best Practices](#best-practices)
- [Advanced Testing](#advanced-testing)

---

## Running Tests

### Run All Tests

```bash
forge test
```

### Run Specific Test Suites

```bash
# Unit tests only
forge test --match-path "test/unit/**/*"

# Integration tests
forge test --match-path "test/integration/**/*"

# Fuzz tests
forge test --match-path "test/fuzz/**/*" -f

# Invariant tests
forge test --match-path "test/invariant/**/*" -i

# Gas snapshot tests
forge test --match-path "test/gas/**/*" --gas-snapshot

# Stress tests
forge test --match-path "test/stress/**/*"

# Upgrade tests
forge test --match-path "test/upgrade/**/*"
```

### Run Specific Test Files

```bash
# Single test file
forge test --match-path "test/unit/gacha/Gacha.t.sol"

# Specific test function
forge test --match-test "testDeposit_Success"

# Contract-specific tests
forge test --match-contract GachaTest
```

### Test with Verbosity

```bash
# Verbose output (show all prints and traces)
forge test -vvv

# Show gas usage for each test
forge test --gas-report

# Show test execution time
forge test --summary
```

### Generate Coverage Report

```bash
# Full coverage report
forge coverage

# Coverage report with HTML output
forge coverage --report lcov
genhtml lcov.info -o coverage
```

---

## Test Organization

### Directory Structure

```
contracts/test/
├── helpers/              # Shared testing utilities
│   ├── StandardTest.sol       # Base test contract with modifiers, assertions
│   ├── TestConstants.sol      # Centralized constants
│   ├── DeploymentHelpers.sol  # Standardized deployment patterns
│   └── NFTHelpers.sol         # NFT operations
├── mocks/                # Mock contracts for testing
│   ├── MockNFTAppraisal.sol
│   ├── MockWavsServiceManager.sol
│   └── ...
├── unit/                 # Unit tests organized by domain
│   ├── gacha/            # Gacha system tests
│   ├── appraisal/        # Appraisal system tests
│   ├── economy/          # Economy system tests
│   └── utils/            # Utility contract tests
│       ├── BaseERC20.t.sol
│       ├── BaseERC721.t.sol
│       ├── ERC20BatchQuery.t.sol
│       └── ValidationLib.t.sol
├── integration/          # End-to-end workflow tests
├── fuzz/                 # Property-based fuzz tests
│   ├── GachaTreasury.fuzz.sol
│   ├── RarityTracker.fuzz.sol
│   └── GachaEconomyManager.fuzz.sol
├── invariant/            # Invariant tests
│   ├── GachaTreasuryInvariants.t.sol
│   └── EconomyInvariants.t.sol
├── gas/                  # Gas snapshot tests
│   └── GasSnapshots.t.sol
├── stress/               # Large-scale stress tests
│   └── StressTests.t.sol
└── upgrade/              # Contract upgrade tests
    └── UpgradeTests.t.sol
```

### Test File Naming Conventions

- Unit tests: `ContractName.t.sol`
- Fuzz tests: `ContractName.fuzz.sol`
- Invariant tests: `ContractNameInvariants.t.sol`
- Specialized tests: `TestName.t.sol`

---

## Writing New Tests

### Basic Test Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {StandardTest} from "../helpers/StandardTest.sol";

/**
 * @title Contract Name Test
 * @notice Comprehensive tests for ContractName
 */
contract ContractNameTest is StandardTest {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    ContractName contract;

    // ========================================================================
    // EVENTS
    // ========================================================================

    event ImportantEvent(address indexed user, uint256 value);

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        // Deploy contracts and set up test state
        contract = new ContractName();
    }

    // ========================================================================
    // DEPLOYMENT TESTS
    // ========================================================================

    /**
     * @notice Test correct deployment
     */
    function test_Deployment() public view {
        assertEq(contract.owner(), owner);
    }

    // ========================================================================
    // FEATURE TESTS
    // ========================================================================

    /**
     * @notice Test feature works correctly
     */
    function test_Feature_Success() public {
        vm.prank(user);
        contract.feature();

        assertTrue(contract.featureCalled());
    }

    /**
     * @notice Test feature reverts with invalid input
     */
    function test_Feature_InvalidInput_Fails() public {
        vm.prank(user);
        vm.expectRevert();
        contract.feature(0);
    }
}
```

### Using Test Helpers

```solidity
// Use StandardTest for common utilities
contract MyTest is StandardTest {
    function test_Example() public {
        // Use pre-defined addresses
        address user = USER;

        // Use pre-defined constants
        uint256 price = COMMON_PRICE;

        // Use assertion helpers
        assertNotZero(value, "Value should not be zero");
    }
}
```

### Event Testing

```solidity
function test_EventEmission() public {
    vm.expectEmit(true, true, false, true);
    emit ImportantEvent(user, 100);

    contract.emitEvent(user, 100);
}
```

### Revert Testing

```solidity
function test_Revert() public {
    vm.expectRevert(abi.encodeWithSelector(Error.selector));
    contract.failingFunction();
}
```

---

## Test Types

### Unit Tests

**Purpose**: Test individual contract functions in isolation

**Example**:
```solidity
function test_DepositNFT() public {
    uint256 tokenId = 0;
    appraisal.setAppraisal(address(nft), tokenId, COMMON_PRICE);

    vm.prank(user);
    nft.approve(address(treasury), tokenId);

    vm.prank(user);
    treasury.depositNFT(address(nft), tokenId);

    assertEq(treasury.userTotalDeposits(user), 1);
}
```

### Fuzz Tests

**Purpose**: Property-based testing with random inputs

**Example**:
```solidity
function testFuzz_DepositAmount(
    uint256 amount,
    address depositor
) public {
    // Constrain inputs
    vm.assume(amount > 0 && amount <= 10000e18);
    vm.assume(depositor != address(0));

    // Test with random values
    treasury.deposit(depositor, amount);

    assertEq(treasury.userBalance(depositor), amount);
}
```

### Invariant Tests

**Purpose**: Ensure system properties always hold true

**Example**:
```solidity
function invariant_TotalSupplyNeverDecreases() public view {
    uint256 currentSupply = token.totalSupply();
    assertTrue(currentSupply >= initialSupply);
}
```

### Integration Tests

**Purpose**: Test end-to-end workflows across multiple contracts

**Example**:
```solidity
function test_CompleteSpinFlow() public {
    // Deposit NFT
    treasury.depositNFT(...);

    // Spin gacha
    gacha.spin{value: fee}();

    // Verify NFT distribution
    assertEq(nft.ownerOf(tokenId), winner);

    // Verify economy
    assertEq(economy.totalRevenueProcessed(), fee);
}
```

### Gas Tests

**Purpose**: Track gas usage for regression detection

**Example**:
```solidity
function testGas_Deposit() public {
    treasury.depositNFT(...);
}
```

Run with:
```bash
forge test --gas-snapshot
```

### Stress Tests

**Purpose**: Test system under high load

**Example**:
```solidity
function testStress_1000Deposits() public {
    for (uint256 i = 0; i < 1000; i++) {
        treasury.depositNFT(...);
    }

    assertEq(treasury.totalDeposits(), 1000);
}
```

---

## Best Practices

### Test Organization

1. **Use Section Dividers**
   ```solidity
   // ========================================================================
   // DEPLOYMENT TESTS
   // ========================================================================
   ```

2. **Group Related Tests**
   - Deployment tests first
   - Feature tests grouped by functionality
   - Edge case and failure tests at the end

3. **Use Descriptive Names**
   ```solidity
   function test_AddToWhitelist_Success() public {}
   function test_AddToWhitelist_AlreadyWhitelisted_Fails() public {}
   ```

### Test Coverage

1. **Test Happy Paths**: Normal operation scenarios
2. **Test Edge Cases**: Boundary values, zero addresses, empty arrays
3. **Test Failure Modes**: Revert conditions, access control
4. **Test Events**: Verify important events are emitted
5. **Test Gas**: Track gas usage for critical functions

### Common Patterns

**Arrange-Act-Assert**:
```solidity
function test_Pattern() public {
    // Arrange: Set up test state
    uint256 value = 100;

    // Act: Execute function
    contract.setValue(value);

    // Assert: Verify results
    assertEq(contract.value(), value);
}
```

**Prank Testing**:
```solidity
function test_AccessControl() public {
    vm.prank(user);  // Execute as user
    contract.restrictedFunction();

    vm.prank(owner);  // Execute as owner
    contract.adminFunction();
}
```

**Time Manipulation**:
```solidity
function test_TimeLock() public {
    contract.setLockTime(1 days);

    // Before lock expires
    vm.expectRevert();
    contract.withdraw();

    // Fast forward
    warp(block.timestamp + 1 days);

    // After lock expires
    contract.withdraw();
}
```

---

## Advanced Testing

### Fuzz Testing

Configure fuzz test runs in `foundry.toml`:

```toml
[fuzz]
runs = 256
max_test_rejects = 65536
```

Run with custom runs:
```bash
forge test --match-path "test/fuzz/**/*" -f --runs 1000
```

### Invariant Testing

Configure invariants in `foundry.toml`:

```toml
[invariant]
runs = 256
depth = 15
fail_on_revert = false
```

Run invariants:
```bash
forge test --match-path "test/invariant/**/*" -i --runs 1000
```

### Gas Snapshots

Create gas snapshot baseline:
```bash
forge test --gas-snapshot > .gas-snapshot
```

Compare against baseline:
```bash
forge test --gas-snapshot > .gas-snapshot-new
diff .gas-snapshot .gas-snapshot-new
```

### Coverage Reports

Generate coverage:
```bash
forge coverage --report lcov
```

View HTML coverage report:
```bash
genhtml lcov.info -o coverage
python3 -m http.server 8000 --directory coverage
# Open http://localhost:8000
```

---

## Common Gotchas

### Prank vs StartPrank

```solidity
// vm.prank - only next call
vm.prank(user);
contract.function1();  // Executed as user
contract.function2();  // Executed as test contract

// vm.startPrank - all calls until stopPrank
vm.startPrank(user);
contract.function1();  // Executed as user
contract.function2();  // Executed as user
vm.stopPrank();
```

### Deal vs Mint

```solidity
// Deal - sends ETH to address
deal(address, 1 ether);

// Mint - only works for contracts that implement onReceived
token.mint(address(user), 100);
```

### ExpectEmit Matching

```solidity
// Must match event signature exactly
vm.expectEmit(true, true, false, true);
emit Event(address(this), 100);  // Check signature

emit Event(user, 100);  // Will fail - address doesn't match
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        - uses: foundry-rs/foundry-toolchain@v1
      - run: forge test --gas-report
      - run: forge coverage
```

---

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Forge Test Reference](https://book.getfoundry.sh/forge/tests)
- [Cheatcodes Reference](https://book.getfoundry.sh/cheatcodes/)
- [Fuzz Testing Guide](https://book.getfoundry.sh/forge/fuzz-testing)
- [Invariant Testing Guide](https://book.getfoundry.sh/forge/invariant-testing)

---

## Contributing

When adding new tests:

1. Follow the naming conventions
2. Add NatSpec comments to all test functions
3. Use section dividers for organization
4. Include both success and failure cases
5. Test events with `vm.expectEmit()`
6. Verify gas usage for critical paths
7. Update this README if adding new test types

---

## Quick Reference

### Common Commands

```bash
# Run all tests
forge test

# Run with output
forge test -vvv

# Gas snapshot
forge test --gas-snapshot

# Coverage
forge coverage

# Run specific test
forge test --match-test testFunctionName

# Run fuzz tests
forge test -f --runs 1000

# Run invariants
forge test -i --runs 1000
```

### Common Cheatcodes

```solidity
// Address manipulation
vm.prank(address)
vm.startPrank(address)
vm.stopPrank()
deal(address, amount)

// Time manipulation
warp(uint256)
skip(uint256)
rewind(uint256)

// Event testing
vm.expectEmit()

// Revert testing
vm.expectRevert()

// Storage manipulation
vm.store(address, bytes32, bytes32)

// Mocking
mockCall(address, bytes, bytes)
```

---

For questions or issues, please refer to the main project documentation or open an issue.
