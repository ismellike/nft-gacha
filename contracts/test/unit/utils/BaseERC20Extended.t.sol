// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

/**
 * @title BaseERC20 Extended Test Suite
 * @notice Additional tests covering permit(), nonces(), and DOMAIN_SEPARATOR()
 * @author NFT Gacha Team
 */
contract BaseERC20ExtendedTest is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    BaseERC20 public token;

    address public owner;
    address public protocol;

    // EIP-712 permit signer
    uint256 public signerPrivKey;
    address public signer;

    address public spender;

    // ========================================================================
    // SETUP
    // ========================================================================

    function setUp() public {
        owner = makeAddr("owner");
        protocol = makeAddr("protocol");
        spender = makeAddr("spender");

        signerPrivKey = 0xA11CE_CAFE;
        signer = vm.addr(signerPrivKey);

        token = new BaseERC20("Permit Token", "PERM", owner);

        // Fund signer with tokens
        vm.prank(owner);
        token.mint(signer, 1000e18);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    /// @dev Build and sign an EIP-2612 permit signature.
    function _signPermit(address _owner, address _spender, uint256 value, uint256 nonce, uint256 deadline)
        internal
        view
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                _owner,
                _spender,
                value,
                nonce,
                deadline
            )
        );
        bytes32 domainSeparator = token.DOMAIN_SEPARATOR();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (v, r, s) = vm.sign(signerPrivKey, digest);
    }

    // ========================================================================
    // DOMAIN_SEPARATOR TESTS
    // ========================================================================

    function test_DomainSeparator_NotZero() public view {
        bytes32 sep = token.DOMAIN_SEPARATOR();
        assertTrue(sep != bytes32(0), "DOMAIN_SEPARATOR should be non-zero");
    }

    function test_DomainSeparator_Deterministic() public view {
        bytes32 sep1 = token.DOMAIN_SEPARATOR();
        bytes32 sep2 = token.DOMAIN_SEPARATOR();
        assertEq(sep1, sep2, "DOMAIN_SEPARATOR should be deterministic");
    }

    function test_DomainSeparator_DifferentForDifferentTokens() public {
        BaseERC20 token2 = new BaseERC20("Other Token", "OTH", owner);
        assertNotEq(token.DOMAIN_SEPARATOR(), token2.DOMAIN_SEPARATOR(), "different tokens should have different separators");
    }

    // ========================================================================
    // nonces() TESTS
    // ========================================================================

    function test_Nonces_InitiallyZero() public view {
        assertEq(token.nonces(signer), 0, "nonce should start at 0");
    }

    function test_Nonces_IncrementsAfterPermit() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 100e18;
        uint256 nonceBefore = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonceBefore, deadline);

        token.permit(signer, spender, amount, deadline, v, r, s);

        assertEq(token.nonces(signer), nonceBefore + 1, "nonce should increment after permit");
    }

    function test_Nonces_OnlyOwnerNonceIncrements() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 50e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);
        token.permit(signer, spender, amount, deadline, v, r, s);

        // spender's nonce should remain 0
        assertEq(token.nonces(spender), 0, "spender nonce should remain 0");
        assertEq(token.nonces(signer), 1, "signer nonce should be 1");
    }

    // ========================================================================
    // permit() VALID SIGNATURE TESTS
    // ========================================================================

    function test_Permit_ValidSignature_SetsAllowance() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 500e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);

        token.permit(signer, spender, amount, deadline, v, r, s);

        assertEq(token.allowance(signer, spender), amount, "allowance should be set by permit");
    }

    function test_Permit_ValidSignature_EmitsApproval() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 200e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);

        vm.expectEmit(true, true, false, true);
        emit Approval(signer, spender, amount);

        token.permit(signer, spender, amount, deadline, v, r, s);
    }

    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ========================================================================
    // permit() EXPIRED DEADLINE
    // ========================================================================

    function test_Permit_ExpiredDeadline_Reverts() public {
        uint256 deadline = block.timestamp - 1; // already expired
        uint256 amount = 100e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);

        vm.expectRevert();
        token.permit(signer, spender, amount, deadline, v, r, s);
    }

    function test_Permit_ExactDeadlineAtCurrentTimestamp_Succeeds() public {
        uint256 deadline = block.timestamp; // exactly now should pass
        uint256 amount = 100e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);

        // Should not revert (ERC2612 checks deadline >= block.timestamp)
        token.permit(signer, spender, amount, deadline, v, r, s);
        assertEq(token.allowance(signer, spender), amount);
    }

    // ========================================================================
    // permit() INVALID SIGNER
    // ========================================================================

    function test_Permit_InvalidSigner_Reverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 100e18;

        // Sign with a completely different private key
        uint256 wrongKey = 0xBADCAFE;
        address wrongSigner = vm.addr(wrongKey);
        uint256 nonce = token.nonces(wrongSigner);

        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                signer, // claim to be signer
                spender,
                amount,
                nonce,
                deadline
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, digest); // signed by wrong key

        vm.expectRevert();
        token.permit(signer, spender, amount, deadline, v, r, s);
    }

    // ========================================================================
    // permit() REPLAY PROTECTION
    // ========================================================================

    function test_Permit_ReplayAttack_Reverts() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 100e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);

        // First use should succeed
        token.permit(signer, spender, amount, deadline, v, r, s);
        assertEq(token.nonces(signer), nonce + 1);

        // Second use of the same signature should fail (nonce consumed)
        vm.expectRevert();
        token.permit(signer, spender, amount, deadline, v, r, s);
    }

    function test_Permit_MultipleSequentialPermits() public {
        uint256 deadline = block.timestamp + 1 hours;

        // First permit
        uint256 nonce0 = token.nonces(signer);
        (uint8 v0, bytes32 r0, bytes32 s0) = _signPermit(signer, spender, 100e18, nonce0, deadline);
        token.permit(signer, spender, 100e18, deadline, v0, r0, s0);
        assertEq(token.allowance(signer, spender), 100e18);

        // Second permit (with incremented nonce)
        uint256 nonce1 = token.nonces(signer);
        (uint8 v1, bytes32 r1, bytes32 s1) = _signPermit(signer, spender, 200e18, nonce1, deadline);
        token.permit(signer, spender, 200e18, deadline, v1, r1, s1);
        assertEq(token.allowance(signer, spender), 200e18);

        assertEq(token.nonces(signer), 2);
    }

    // ========================================================================
    // permit() allows transferFrom after grant
    // ========================================================================

    function test_Permit_EnablesTransferFrom() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 amount = 300e18;
        uint256 nonce = token.nonces(signer);

        (uint8 v, bytes32 r, bytes32 s) = _signPermit(signer, spender, amount, nonce, deadline);
        token.permit(signer, spender, amount, deadline, v, r, s);

        // spender can now transferFrom signer
        vm.prank(spender);
        // forge-lint: disable-next-line(erc20-unchecked-transfer)
        token.transferFrom(signer, spender, 100e18);

        assertEq(token.balanceOf(spender), 100e18);
        assertEq(token.allowance(signer, spender), amount - 100e18);
    }
}
