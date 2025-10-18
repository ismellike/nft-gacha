// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/gacha/GachaTreasury.sol";
import "../src/tokens/BaseERC721.sol";
import "./mocks/MockNFTAppraisal.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Simple Card Tracking Test
 * @notice Tests the simplified card tracking system after the rarity dimension was removed
 */
contract SimpleCardTrackingTest is Test {
    GachaTreasury public treasury;
    BaseERC721 public nft;
    MockNFTAppraisal public mockAppraisal;

    address public owner = address(1);
    address public user1 = address(2);

    // Test card IDs
    bytes32 public constant CARD_A = keccak256("CARD_A");
    bytes32 public constant CARD_B = keccak256("CARD_B");

    function setUp() public {
        vm.startPrank(owner);

        // Deploy contracts
        nft = new BaseERC721("TestNFT", "TNFT", owner);
        mockAppraisal = new MockNFTAppraisal();

        // Deploy treasury implementation and proxy with a temporary address, then set the real gacha later
        GachaTreasury treasuryImpl = new GachaTreasury();

        uint256[5] memory minPrices = [uint256(0), 25 * 1e18, 70 * 1e18, 300 * 1e18, 1_500 * 1e18];
        uint256[5] memory maxPrices = [uint256(15 * 1e18), 60 * 1e18, 250 * 1e18, 1_200 * 1e18, type(uint256).max];
        bytes memory initData = abi.encodeWithSelector(
            GachaTreasury.initialize.selector,
            owner,
            address(this), // temporary gacha address
            address(mockAppraisal),
            minPrices,
            maxPrices
        );

        ERC1967Proxy proxy = new ERC1967Proxy(address(treasuryImpl), initData);
        treasury = GachaTreasury(address(proxy));

        // Whitelist the NFT collection
        treasury.addToWhitelist(address(nft));

        vm.stopPrank();
    }

    function testCardTrackingAfterDeposit() public {
        console.log("\n=== Testing Card Tracking After Deposit ===\n");

        // Setup: Mint NFTs to user1
        vm.startPrank(owner);
        uint256 tokenId1 = nft.mint(user1); // tokenId = 0
        uint256 tokenId2 = nft.mint(user1); // tokenId = 1
        vm.stopPrank();

        // Setup: Set appraisals with the same cardId to ensure consistent pricing
        vm.startPrank(owner);
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId1, CARD_A, 50 * 1e18); // $50, Common tier
        mockAppraisal.setMockAppraisalWithCardId(address(nft), tokenId2, CARD_A, 50 * 1e18); // Same card, same price
        vm.stopPrank();

        console.log("Setup complete:");
        console.log("  Token 0 -> CARD_A");
        console.log("  Token 1 -> CARD_A (same card)");

        // User1 deposits both NFTs
        vm.startPrank(user1);
        nft.approve(address(treasury), tokenId1);
        nft.approve(address(treasury), tokenId2);

        treasury.depositNFT(address(nft), tokenId1);
        treasury.depositNFT(address(nft), tokenId2);
        vm.stopPrank();

        console.log("\nAfter deposits:");

        // Test: Check user card IDs list
        bytes32[] memory userCardIds = treasury.getAllUserCardIds(user1);
        console.log("User1 distinct card types:", userCardIds.length);

        // Should have exactly 1 distinct card type (CARD_A)
        assertEq(userCardIds.length, 1, "Should have 1 distinct card type");
        assertEq(userCardIds[0], CARD_A, "Should be CARD_A");

        // Test: Check user card deposit count
        uint256 cardACount = treasury.getUserCardDeposits(user1, CARD_A);
        console.log("User1 CARD_A deposit count:", cardACount);

        // Should have 2 deposits of CARD_A
        assertEq(cardACount, 2, "Should have 2 CARD_A deposits");

        // Test: Check total card deposits
        uint256 totalCardA = treasury.getCardTotalDeposits(CARD_A);
        console.log("Total CARD_A deposits:", totalCardA);

        // Should have 2 total deposits
        assertEq(totalCardA, 2, "Should have 2 total CARD_A deposits");

        // Test: Check paginated access
        (bytes32[] memory page, uint256 total, bool hasMore) = treasury.getUserCardIds(user1, 0, 10);
        console.log("Paginated result:");
        console.log("  Page size:", page.length);
        console.log("  Total:", total);
        console.log("  Has more:", hasMore);

        assertEq(page.length, 1, "Page should have 1 card");
        assertEq(total, 1, "Total should be 1");
        assertEq(hasMore, false, "Should not have more");
        assertEq(page[0], CARD_A, "Page should contain CARD_A");

        console.log("\nAll card tracking tests passed!");
    }

    function testMultipleUsersMultipleCards() public {
        console.log("\n=== Testing Multiple Users with Multiple Cards ===\n");

        address user2 = address(3);

        // Setup: Mint NFTs to both users
        vm.startPrank(owner);
        uint256 token1 = nft.mint(user1); // 0
        uint256 token2 = nft.mint(user1); // 1
        uint256 token3 = nft.mint(user2); // 2
        uint256 token4 = nft.mint(user2); // 3
        vm.stopPrank();

        // Setup: Set appraisals with consistent card-based pricing
        vm.startPrank(owner);
        // Set appraisals with specific cardIds to ensure price consistency
        mockAppraisal.setMockAppraisalWithCardId(address(nft), token1, CARD_A, 50 * 1e18); // $50
        mockAppraisal.setMockAppraisalWithCardId(address(nft), token2, CARD_B, 75 * 1e18); // $75
        mockAppraisal.setMockAppraisalWithCardId(address(nft), token3, CARD_A, 50 * 1e18); // Same card, same price as token1
        mockAppraisal.setMockAppraisalWithCardId(address(nft), token4, CARD_B, 75 * 1e18); // Same card, same price as token2
        vm.stopPrank();

        // User1 deposits
        vm.startPrank(user1);
        nft.approve(address(treasury), token1);
        nft.approve(address(treasury), token2);
        treasury.depositNFT(address(nft), token1);
        treasury.depositNFT(address(nft), token2);
        vm.stopPrank();

        // User2 deposits
        vm.startPrank(user2);
        nft.approve(address(treasury), token3);
        nft.approve(address(treasury), token4);
        treasury.depositNFT(address(nft), token3);
        treasury.depositNFT(address(nft), token4);
        vm.stopPrank();

        // Test: Check both users have 2 distinct card types
        bytes32[] memory user1Cards = treasury.getAllUserCardIds(user1);
        bytes32[] memory user2Cards = treasury.getAllUserCardIds(user2);

        console.log("User1 distinct cards:", user1Cards.length);
        console.log("User2 distinct cards:", user2Cards.length);

        assertEq(user1Cards.length, 2, "User1 should have 2 distinct cards");
        assertEq(user2Cards.length, 2, "User2 should have 2 distinct cards");

        // Test: Check individual card counts
        assertEq(treasury.getUserCardDeposits(user1, CARD_A), 1, "User1 should have 1 CARD_A");
        assertEq(treasury.getUserCardDeposits(user1, CARD_B), 1, "User1 should have 1 CARD_B");
        assertEq(treasury.getUserCardDeposits(user2, CARD_A), 1, "User2 should have 1 CARD_A");
        assertEq(treasury.getUserCardDeposits(user2, CARD_B), 1, "User2 should have 1 CARD_B");

        // Test: Check total card counts across all users
        assertEq(treasury.getCardTotalDeposits(CARD_A), 2, "Total CARD_A should be 2");
        assertEq(treasury.getCardTotalDeposits(CARD_B), 2, "Total CARD_B should be 2");

        console.log("\nMulti-user card tracking tests passed!");
    }
}
