// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {GachaTreasury} from "../../src/gacha/GachaTreasury.sol";
import {BaseERC721} from "../../src/tokens/BaseERC721.sol";
import {MockNFTAppraisal} from "../mocks/MockNFTAppraisal.sol";
import {TestConstants} from "./TestConstants.sol";

/**
 * @title NFT Helpers
 * @notice Common NFT operations for all test contracts
 * @dev Simplifies NFT minting, approval, and deposit operations
 * @author NFT Gacha Team
 */
contract NFTHelpers is Test {
    using TestConstants for *;

    // ========================================================================
    // NFT MINTING
    // ========================================================================

    /**
     * @notice Mint an NFT to a specific address
     * @param nft The NFT contract
     * @param to The recipient address
     * @return tokenId The minted token ID
     */
    function _mintNFT(BaseERC721 nft, address to) internal returns (uint256 tokenId) {
        vm.prank(nft.owner());
        tokenId = nft.mint(to);
    }

    /**
     * @notice Mint multiple NFTs to an address
     * @param nft The NFT contract
     * @param to The recipient address
     * @param count The number of NFTs to mint
     * @return tokenIds Array of minted token IDs
     */
    function _mintNFTs(BaseERC721 nft, address to, uint256 count) internal returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = _mintNFT(nft, to);
        }
    }

    // ========================================================================
    // NFT APPROVAL
    // ========================================================================

    /**
     * @notice Approve an NFT for transfer by treasury
     * @param nft The NFT contract
     * @param owner The owner of the NFT
     * @param tokenId The token ID to approve
     * @param spender The address to approve (e.g., treasury)
     */
    function _approveNFT(BaseERC721 nft, address owner, uint256 tokenId, address spender) internal {
        vm.startPrank(owner);
        nft.approve(spender, tokenId);
        vm.stopPrank();
    }

    /**
     * @notice Approve multiple NFTs for transfer
     * @param nft The NFT contract
     * @param owner The owner of the NFTs
     * @param tokenIds The token IDs to approve
     * @param spender The address to approve
     */
    function _approveNFTs(BaseERC721 nft, address owner, uint256[] memory tokenIds, address spender) internal {
        vm.startPrank(owner);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            nft.approve(spender, tokenIds[i]);
        }
        vm.stopPrank();
    }

    // ========================================================================
    // NFT DEPOSIT
    // ========================================================================

    /**
     * @notice Mint and approve an NFT, then deposit to treasury
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param mockAppraisal The mock appraisal contract
     * @param owner The NFT owner and depositor
     * @param appraisedPrice The appraised price for rarity assignment
     * @return tokenId The deposited token ID
     */
    function _mintAndDepositNFT(
        BaseERC721 nft,
        GachaTreasury treasury,
        MockNFTAppraisal mockAppraisal,
        address owner,
        uint256 appraisedPrice
    ) internal returns (uint256 tokenId) {
        // Mint NFT
        tokenId = _mintNFT(nft, owner);

        // Approve treasury
        _approveNFT(nft, owner, tokenId, address(treasury));

        // Set mock appraisal
        mockAppraisal.setMockAppraisal(address(nft), tokenId, appraisedPrice);

        // Deposit to treasury
        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);
    }

    /**
     * @notice Deposit an already minted NFT to treasury
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param mockAppraisal The mock appraisal contract
     * @param owner The NFT owner and depositor
     * @param tokenId The token ID to deposit
     * @param appraisedPrice The appraised price for rarity assignment
     */
    function _depositNFT(
        BaseERC721 nft,
        GachaTreasury treasury,
        MockNFTAppraisal mockAppraisal,
        address owner,
        uint256 tokenId,
        uint256 appraisedPrice
    ) internal {
        // Approve treasury
        _approveNFT(nft, owner, tokenId, address(treasury));

        // Set mock appraisal
        mockAppraisal.setMockAppraisal(address(nft), tokenId, appraisedPrice);

        // Deposit to treasury
        vm.prank(owner);
        treasury.depositNFT(address(nft), tokenId);
    }

    // ========================================================================
    // BATCH NFT OPERATIONS
    // ========================================================================

    /**
     * @notice Mint and deposit multiple NFTs with specified appraisals
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param mockAppraisal The mock appraisal contract
     * @param owner The NFT owner and depositor
     * @param appraisedPrices Array of appraised prices
     * @return tokenIds Array of deposited token IDs
     */
    function _mintAndDepositNFTs(
        BaseERC721 nft,
        GachaTreasury treasury,
        MockNFTAppraisal mockAppraisal,
        address owner,
        uint256[] memory appraisedPrices
    ) internal returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](appraisedPrices.length);
        for (uint256 i = 0; i < appraisedPrices.length; i++) {
            tokenIds[i] = _mintAndDepositNFT(nft, treasury, mockAppraisal, owner, appraisedPrices[i]);
        }
    }

    /**
     * @notice Deposit NFTs of each rarity tier
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param mockAppraisal The mock appraisal contract
     * @param owner The NFT owner and depositor
     * @return tokenIds Array of deposited token IDs (one per rarity)
     */
    function _depositOneOfEachRarity(
        BaseERC721 nft,
        GachaTreasury treasury,
        MockNFTAppraisal mockAppraisal,
        address owner
    ) internal returns (uint256[] memory tokenIds) {
        uint256[] memory prices = new uint256[](5);
        prices[0] = TestConstants.COMMON_PRICE;
        prices[1] = TestConstants.UNCOMMON_PRICE;
        prices[2] = TestConstants.RARE_PRICE;
        prices[3] = TestConstants.EPIC_PRICE;
        prices[4] = TestConstants.LEGENDARY_PRICE;

        return _mintAndDepositNFTs(nft, treasury, mockAppraisal, owner, prices);
    }

    // ========================================================================
    // RARITY HELPERS
    // ========================================================================

    /**
     * @notice Get rarity index from price
     * @param priceUSD The appraised price
     * @return rarity The corresponding rarity tier as uint8
     */
    function _getRarityFromPrice(uint256 priceUSD) internal pure returns (uint8) {
        if (priceUSD <= TestConstants.COMMON_MAX) {
            return 0; // Common
        } else if (priceUSD >= TestConstants.UNCOMMON_MIN && priceUSD <= TestConstants.UNCOMMON_MAX) {
            return 1; // Uncommon
        } else if (priceUSD >= TestConstants.RARE_MIN && priceUSD <= TestConstants.RARE_MAX) {
            return 2; // Rare
        } else if (priceUSD >= TestConstants.EPIC_MIN && priceUSD <= TestConstants.EPIC_MAX) {
            return 3; // Epic
        } else {
            return 4; // Legendary
        }
    }

    /**
     * @notice Get test price for a specific rarity
     * @param rarity The desired rarity tier as uint8
     * @return priceUSD The test price for that rarity
     */
    function _getPriceForRarity(uint8 rarity) internal pure returns (uint256 priceUSD) {
        if (rarity == 0) {
            return TestConstants.COMMON_PRICE;
        } else if (rarity == 1) {
            return TestConstants.UNCOMMON_PRICE;
        } else if (rarity == 2) {
            return TestConstants.RARE_PRICE;
        } else if (rarity == 3) {
            return TestConstants.EPIC_PRICE;
        } else {
            return TestConstants.LEGENDARY_PRICE;
        }
    }

    // ========================================================================
    // WHITELIST HELPERS
    // ========================================================================

    /**
     * @notice Whitelist a collection for treasury deposits
     * @param treasury The GachaTreasury contract
     * @param collection The collection address to whitelist
     * @param owner The treasury owner
     */
    function _whitelistCollection(GachaTreasury treasury, address collection, address owner) internal {
        vm.prank(owner);
        treasury.addToWhitelist(collection);
    }

    /**
     * @notice Whitelist multiple collections
     * @param treasury The GachaTreasury contract
     * @param collections Array of collection addresses to whitelist
     * @param owner The treasury owner
     */
    function _whitelistCollections(GachaTreasury treasury, address[] memory collections, address owner) internal {
        vm.startPrank(owner);
        for (uint256 i = 0; i < collections.length; i++) {
            treasury.addToWhitelist(collections[i]);
        }
        vm.stopPrank();
    }

    // ========================================================================
    // NFT WITHDRAWAL
    // ========================================================================

    /**
     * @notice Withdraw an NFT from treasury
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param tokenId The token ID to withdraw
     * @param depositor The original depositor
     */
    function _withdrawNFT(BaseERC721 nft, GachaTreasury treasury, uint256 tokenId, address depositor) internal {
        vm.prank(depositor);
        treasury.withdrawMyNFT(address(nft), tokenId);
    }

    /**
     * @notice Setup complete deposit: whitelist + mint + deposit
     * @param nft The NFT contract
     * @param treasury The GachaTreasury contract
     * @param mockAppraisal The mock appraisal contract
     * @param owner The NFT owner, treasury owner, and depositor
     * @param appraisedPrice The appraised price
     * @return tokenId The deposited token ID
     */
    function _setupCompleteDeposit(
        BaseERC721 nft,
        GachaTreasury treasury,
        MockNFTAppraisal mockAppraisal,
        address owner,
        uint256 appraisedPrice
    ) internal returns (uint256 tokenId) {
        // Whitelist collection
        _whitelistCollection(treasury, address(nft), owner);

        // Mint and deposit
        return _mintAndDepositNFT(nft, treasury, mockAppraisal, owner, appraisedPrice);
    }
}
