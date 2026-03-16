// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {StandardTest} from "../../helpers/StandardTest.sol";
import {TestConstants} from "../../helpers/TestConstants.sol";
import {Gacha} from "../../../src/gacha/Gacha.sol";
import {GachaServiceHandler} from "../../../src/gacha/GachaServiceHandler.sol";
import {GachaTreasury} from "../../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../../src/tokens/BaseERC721.sol";
import {BaseERC20} from "../../../src/tokens/BaseERC20.sol";
import {MockNFTAppraisal} from "../../mocks/MockNFTAppraisal.sol";
import {MockWavsServiceManager} from "../../mocks/MockWavsServiceManager.sol";
import {MockGachaEconomyManager} from "../../mocks/MockGachaEconomyManager.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IWavsServiceManager} from "@wavs/eigenlayer/ecdsa/interfaces/IWavsServiceManager.sol";

/**
 * @title Gacha Spin Extensions Test Suite
 * @notice Tests for setSpinTimeout bounds and spinWithPermit
 */
contract GachaSpinExtensionsTest is StandardTest {
    using TestConstants for *;

    Gacha public gacha;
    GachaServiceHandler public serviceHandler;
    GachaTreasury public treasury;
    BaseERC721 public nft;
    BaseERC20 public feeToken;
    MockNFTAppraisal public mockAppraisal;
    MockWavsServiceManager public mockWavsManager;
    MockGachaEconomyManager public mockEconomyManager;

    address public gachaOwner;
    address public gameSpinner;
    address public treasuryOwner;

    uint256 public constant MIN_SPIN_FEE = 0.01e6;
    uint256 public constant MAX_SPIN_FEE = 1e9;

    // For permit signing
    uint256 public spinnerPrivateKey;
    address public spinnerAddr;

    event SpinTimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);

    function setUp() public {
        gachaOwner = makeAddr("gachaOwner");
        treasuryOwner = makeAddr("treasuryOwner");

        // Create a spinner with known private key for permit
        spinnerPrivateKey = 0xA11CE;
        spinnerAddr = vm.addr(spinnerPrivateKey);

        gameSpinner = spinnerAddr;

        mockWavsManager = new MockWavsServiceManager();
        mockEconomyManager = new MockGachaEconomyManager();
        feeToken = new BaseERC20("USDC", "USDC", gachaOwner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury
        vm.startPrank(treasuryOwner);
        GachaTreasury treasuryImpl = new GachaTreasury();
        uint256[] memory minPrices = TestConstants.getMinPrices();
        uint256[] memory maxPrices = TestConstants.getMaxPrices();
        string[] memory rarityNames = TestConstants.getDefaultRarityNames();
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            treasuryOwner,
            address(0xDEAD),
            address(mockAppraisal),
            uint8(5),
            rarityNames,
            minPrices,
            maxPrices
        );
        ERC1967Proxy treasuryProxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(treasuryProxy));
        vm.stopPrank();

        // Deploy Gacha proxy
        Gacha gachaImpl = new Gacha();
        serviceHandler = new GachaServiceHandler(
            IWavsServiceManager(address(mockWavsManager)), address(gachaImpl)
        );
        vm.prank(gachaOwner);
        initData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            gachaOwner,
            address(serviceHandler),
            address(feeToken),
            MIN_SPIN_FEE,
            address(treasury),
            address(mockEconomyManager)
        );
        ERC1967Proxy gachaProxy = new ERC1967Proxy(address(gachaImpl), initData);
        gacha = Gacha(address(gachaProxy));

        vm.prank(gachaOwner);
        gacha.setFeeTokenDecimals(6);

        vm.prank(treasuryOwner);
        treasury.setGachaContract(address(gacha));

        nft = new BaseERC721("Test NFT", "TNFT", treasuryOwner);

        // Fund spinner
        vm.prank(gachaOwner);
        feeToken.mint(gameSpinner, 100 ether);
    }

    // ========================================================================
    // setSpinTimeout BOUNDS
    // ========================================================================

    function testSetSpinTimeoutValid() public {
        uint256 oldTimeout = gacha.spinTimeout();
        vm.expectEmit(false, false, false, true);
        emit SpinTimeoutUpdated(oldTimeout, 120);
        vm.prank(gachaOwner);
        gacha.setSpinTimeout(120);
        assertEq(gacha.spinTimeout(), 120);
    }

    function testSetSpinTimeoutMinBound() public {
        vm.prank(gachaOwner);
        gacha.setSpinTimeout(30);
        assertEq(gacha.spinTimeout(), 30);
    }

    function testSetSpinTimeoutMaxBound() public {
        vm.prank(gachaOwner);
        gacha.setSpinTimeout(3600);
        assertEq(gacha.spinTimeout(), 3600);
    }

    function testSetSpinTimeoutRevertsBelowMin() public {
        vm.prank(gachaOwner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidSpinTimeout.selector));
        gacha.setSpinTimeout(29);
    }

    function testSetSpinTimeoutRevertsAboveMax() public {
        vm.prank(gachaOwner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidSpinTimeout.selector));
        gacha.setSpinTimeout(3601);
    }

    function testSetSpinTimeoutRevertsZero() public {
        vm.prank(gachaOwner);
        vm.expectRevert(abi.encodeWithSelector(Gacha.InvalidSpinTimeout.selector));
        gacha.setSpinTimeout(0);
    }

    function testSetSpinTimeoutOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        gacha.setSpinTimeout(120);
    }

    // ========================================================================
    // spinWithPermit
    // ========================================================================

    function testSpinWithPermitSuccess() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        uint256 deadline = block.timestamp + 1 hours;

        // Build ERC-2612 permit signature
        bytes32 permitHash = _buildPermitHash(spinnerAddr, address(gacha), MAX_SPIN_FEE, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spinnerPrivateKey, permitHash);

        vm.prank(spinnerAddr);
        uint256 triggerId = gacha.spinWithPermit(deadline, v, r, s, MAX_SPIN_FEE);

        (uint256 feePaid,, address requester,) = gacha.spinRequests(triggerId);
        assertTrue(feePaid > 0, "Fee should be paid");
        assertEq(requester, spinnerAddr, "Requester should be spinner");
    }

    function testSpinWithPermitRevertsMaxFeeExceeded() public {
        _depositNFTsForSpins();

        uint256 fee = gacha.getCurrentSpinFee();
        uint256 tooLowMax = fee - 1; // Lower than current fee
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 permitHash = _buildPermitHash(spinnerAddr, address(gacha), tooLowMax, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spinnerPrivateKey, permitHash);

        vm.prank(spinnerAddr);
        vm.expectRevert(abi.encodeWithSelector(Gacha.MaxFeeExceeded.selector, fee, tooLowMax));
        gacha.spinWithPermit(deadline, v, r, s, tooLowMax);
    }

    function testSpinWithPermitRevertsExpiredDeadline() public {
        _depositNFTsForSpins();

        uint256 deadline = block.timestamp - 1; // Already expired

        bytes32 permitHash = _buildPermitHash(spinnerAddr, address(gacha), MAX_SPIN_FEE, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spinnerPrivateKey, permitHash);

        vm.prank(spinnerAddr);
        vm.expectRevert(); // ERC20Permit will revert with expired deadline
        gacha.spinWithPermit(deadline, v, r, s, MAX_SPIN_FEE);
    }

    function testSpinWithPermitRevertsInvalidSignature() public {
        _depositNFTsForSpins();

        uint256 deadline = block.timestamp + 1 hours;
        uint256 wrongKey = 0xBAAD;

        bytes32 permitHash = _buildPermitHash(spinnerAddr, address(gacha), MAX_SPIN_FEE, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, permitHash);

        vm.prank(spinnerAddr);
        vm.expectRevert(); // ERC20Permit will revert with invalid signer
        gacha.spinWithPermit(deadline, v, r, s, MAX_SPIN_FEE);
    }

    function testSpinWithPermitRevertsWhenPaused() public {
        _depositNFTsForSpins();

        vm.prank(gachaOwner);
        gacha.emergencyPause();

        uint256 deadline = block.timestamp + 1 hours;
        bytes32 permitHash = _buildPermitHash(spinnerAddr, address(gacha), MAX_SPIN_FEE, deadline);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(spinnerPrivateKey, permitHash);

        vm.prank(spinnerAddr);
        vm.expectRevert(); // Paused
        gacha.spinWithPermit(deadline, v, r, s, MAX_SPIN_FEE);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    bool private _nftDeposited;

    function _depositNFTsForSpins() internal {
        if (_nftDeposited) return;

        vm.startPrank(treasuryOwner);
        treasury.addToWhitelist(address(nft));

        uint256[] memory prices = new uint256[](5);
        prices[0] = TestConstants.COMMON_PRICE;
        prices[1] = TestConstants.UNCOMMON_PRICE;
        prices[2] = TestConstants.RARE_PRICE;
        prices[3] = TestConstants.EPIC_PRICE;
        prices[4] = TestConstants.LEGENDARY_PRICE;

        for (uint256 i = 0; i < 5; i++) {
            uint256 tokenId = nft.mint(treasuryOwner);
            nft.approve(address(treasury), tokenId);
            mockAppraisal.setMockAppraisal(address(nft), tokenId, prices[i]);
            treasury.depositNFT(address(nft), tokenId);
        }

        vm.stopPrank();
        _nftDeposited = true;
    }

    function _buildPermitHash(address permitOwner, address spender, uint256 value, uint256 deadline)
        internal
        view
        returns (bytes32)
    {
        bytes32 PERMIT_TYPEHASH =
            keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

        uint256 nonce = feeToken.nonces(permitOwner);

        bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, permitOwner, spender, value, nonce, deadline));

        bytes32 domainSeparator = feeToken.DOMAIN_SEPARATOR();
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
}
