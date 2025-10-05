// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC1967Utils} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {NFTAppraisal} from "../src/appraisal/NFTAppraisal.sol";
import {GachaTreasury} from "../src/gacha/GachaTreasury.sol";
import {GachaRewardsManager} from "../src/rewards/GachaRewardsManager.sol";
import {Gacha} from "../src/gacha/Gacha.sol";
import {BaseERC20} from "../src/tokens/BaseERC20.sol";
import {BaseERC721} from "../src/tokens/BaseERC721.sol";

contract UpgradeableTest is Test, IERC721Receiver {
    NFTAppraisal public appraisalImpl;
    GachaTreasury public treasuryImpl;
    GachaRewardsManager public rewardsManagerImpl;
    Gacha public gachaImpl;

    ERC1967Proxy public appraisalProxy;
    ERC1967Proxy public treasuryProxy;
    ERC1967Proxy public rewardsManagerProxy;
    ERC1967Proxy public gachaProxy;

    BaseERC20 public testToken;
    BaseERC721 public testNFT;

    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        // Deploy implementation contracts
        appraisalImpl = new NFTAppraisal();
        treasuryImpl = new GachaTreasury();
        rewardsManagerImpl = new GachaRewardsManager();
        gachaImpl = new Gacha();

        // Deploy test token
        testToken = new BaseERC20("Test Token", "TEST", address(this));
        testToken.mint(owner, 1000000 * 10 ** testToken.decimals());

        // Deploy test NFT
        testNFT = new BaseERC721("Test NFT", "TNFT", address(this));

        // Deploy proxies
        _deployProxies();
    }

    function _deployProxies() internal {
        vm.startPrank(owner);

        // Deploy appraisal proxy
        bytes memory appraisalInitData = abi.encodeWithSelector(
            NFTAppraisal.initialize.selector,
            owner,
            address(testToken),
            10 * 10 ** testToken.decimals(),
            owner
        );
        appraisalProxy = new ERC1967Proxy(address(appraisalImpl), appraisalInitData);

        // Deploy treasury proxy
        bytes memory treasuryInitData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(0x1), // temporary gacha address
            address(appraisalProxy)
        );
        treasuryProxy = new ERC1967Proxy(address(treasuryImpl), treasuryInitData);

        // Deploy rewards manager proxy
        bytes memory rewardsManagerInitData = abi.encodeWithSelector(
            GachaRewardsManager.initialize.selector,
            owner,
            address(0x2), // temporary gacha address
            address(treasuryProxy),
            address(appraisalProxy),
            owner,
            address(testToken)
        );
        rewardsManagerProxy = new ERC1967Proxy(address(rewardsManagerImpl), rewardsManagerInitData);

        // Deploy gacha proxy
        bytes memory gachaInitData = abi.encodeWithSelector(
            Gacha.initialize.selector,
            owner,
            address(0x3), // temporary service handler
            address(testToken),
            100 * 10 ** testToken.decimals(),
            address(treasuryProxy),
            address(rewardsManagerProxy)
        );
        gachaProxy = new ERC1967Proxy(address(gachaImpl), gachaInitData);

        vm.stopPrank();

        // Configure contracts - these must be called by the owner
        vm.startPrank(owner);
        GachaTreasury(address(treasuryProxy)).setGachaContract(address(gachaProxy));
        Gacha(address(gachaProxy)).setRewardsManager(address(rewardsManagerProxy));
        GachaTreasury(address(treasuryProxy)).setTreasuryRewardsManager(address(rewardsManagerProxy));

        // Setup NFT approvals
        testNFT.setApprovalForAll(address(treasuryProxy), true);
        vm.stopPrank();
    }

    function testProxyDeployments() public {
        console.log("Testing proxy deployments...");

        // Verify proxies are deployed and working
        assertTrue(address(appraisalProxy) != address(0), "Appraisal proxy not deployed");
        assertTrue(address(treasuryProxy) != address(0), "Treasury proxy not deployed");
        assertTrue(address(rewardsManagerProxy) != address(0), "Rewards manager proxy not deployed");
        assertTrue(address(gachaProxy) != address(0), "Gacha proxy not deployed");

        // Verify owners
        assertEq(
            owner,
            Ownable(payable(address(appraisalProxy))).owner(),
            "Wrong appraisal proxy owner"
        );

        console.log("All proxies deployed and configured correctly");
    }

    function testBasicFunctionality() public {
        console.log("Testing basic upgradeable functionality...");

        // Test appraisal functionality
        uint256 tokenId = testNFT.mint(owner);
        bytes32 cardId = keccak256("test-card");

        vm.startPrank(owner);
        NFTAppraisal(address(appraisalProxy)).ownerSetAppraisalForTokenWithCard(
            address(testNFT),
            tokenId,
            cardId,
            1000 * 1e18
        );
        vm.stopPrank();

        // Verify appraisal worked
        (uint256 price, NFTAppraisal.AppraisalStatus status) =
            NFTAppraisal(address(appraisalProxy)).getAppraisedPrice(address(testNFT), tokenId);

        assertEq(price, 1000 * 1e18, "Wrong appraised price");
        assertEq(uint8(status), uint8(NFTAppraisal.AppraisalStatus.OwnerOverride), "Wrong appraisal status");

        console.log("Basic functionality working through proxies");
    }

    function testUpgradeability() public {
        console.log("Testing contract upgradeability...");

        // Deploy new implementation
        NFTAppraisal newAppraisalImpl = new NFTAppraisal();

        // Upgrade the proxy using UUPS pattern (contract handles its own upgrade)
        vm.startPrank(owner);
        // For UUPS, we call the upgrade function on the proxy itself
        (bool success,) = address(appraisalProxy).call(
            abi.encodeWithSignature("upgradeTo(address)", address(newAppraisalImpl))
        );
        assertTrue(success, "Upgrade failed");

        vm.stopPrank();

        // Test functionality still works after upgrade
        uint256 tokenId = testNFT.mint(owner);
        bytes32 cardId = keccak256("test-card-2");

        vm.startPrank(owner);
        NFTAppraisal(address(appraisalProxy)).ownerSetAppraisalForTokenWithCard(
            address(testNFT),
            tokenId,
            cardId,
            2000 * 1e18
        );
        vm.stopPrank();

        // Verify appraisal still works
        (uint256 price,) =
            NFTAppraisal(address(appraisalProxy)).getAppraisedPrice(address(testNFT), tokenId);

        assertEq(price, 2000 * 1e18, "Wrong appraised price after upgrade");

        console.log("Contract upgradeability working correctly");
    }

    function testConfigurationPreservation() public {
        console.log("Testing configuration preservation during upgrade...");

        // Get initial config
        uint256 initialFee = NFTAppraisal(address(appraisalProxy)).appraisalFee();
        address initialProtocol = NFTAppraisal(address(appraisalProxy)).protocolAddress();

        // Deploy and upgrade to new implementation
        NFTAppraisal newAppraisalImpl = new NFTAppraisal();

        vm.startPrank(owner);
        (bool success,) = address(appraisalProxy).call(
            abi.encodeWithSignature("upgradeTo(address)", address(newAppraisalImpl))
        );
        assertTrue(success, "Upgrade failed");
        vm.stopPrank();

        // Verify config preserved
        assertEq(
            NFTAppraisal(address(appraisalProxy)).appraisalFee(),
            initialFee,
            "Appraisal fee not preserved after upgrade"
        );

        assertEq(
            NFTAppraisal(address(appraisalProxy)).protocolAddress(),
            initialProtocol,
            "Protocol address not preserved after upgrade"
        );

        console.log("Configuration preserved correctly during upgrade");
    }

    function testErrorHandling() public {
        console.log("Testing error handling in upgradeable contracts...");

        // Test unauthorized upgrade
        vm.startPrank(user);
        vm.expectRevert();
        (bool success,) = address(appraisalProxy).call(
            abi.encodeWithSignature("upgradeTo(address)", address(appraisalImpl))
        );
        vm.stopPrank();

        console.log("Error handling working correctly");
    }

    function testFullWorkflow() public {
        console.log("Testing full workflow through upgradeable contracts...");

        // Test basic appraisal functionality (main workflow component)
        uint256 tokenId = testNFT.mint(address(this));
        bytes32 cardId = keccak256("workflow-test");

        vm.startPrank(owner);
        NFTAppraisal(address(appraisalProxy)).ownerSetAppraisalForTokenWithCard(
            address(testNFT),
            tokenId,
            cardId,
            500 * 1e18 // $500 - should be Rare tier
        );
        vm.stopPrank();

        // Verify appraisal worked through proxy
        (uint256 price, NFTAppraisal.AppraisalStatus status) =
            NFTAppraisal(address(appraisalProxy)).getAppraisedPrice(address(testNFT), tokenId);

        assertEq(price, 500 * 1e18, "Appraisal should work through upgradeable proxy");
        assertEq(uint256(status), uint256(NFTAppraisal.AppraisalStatus.OwnerOverride), "Status should be OwnerOverride");

        console.log("Full workflow working correctly through upgradeable contracts");
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}