// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC721} from "forge-std/interfaces/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GachaTreasury - NFT Treasury Management
/// @notice Manages NFT storage and distribution for gacha system
/// @dev Supports batch operations and rarity-based organization
contract GachaTreasury is IERC721Receiver, Ownable, ReentrancyGuard {
    // Custom errors for gas efficiency
    error InvalidCollectionAddress();
    error NFTAlreadyDeposited();
    error InvalidNFTContract();
    error NotNFTOwner();
    error InvalidIndex();
    error InvalidRecipient();
    error ArrayLengthMismatch();
    error EmptyArrays();
    error TooManyItems();
    error InvalidGachaContract();

    // Constants
    uint256 public constant MAX_BATCH_DEPOSIT = 50;
    uint256 public constant MAX_BATCH_WITHDRAW = 20;
    enum Rarity {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    struct NFTItem {
        address collection;
        uint256 tokenId;
        Rarity rarity;
    }

    mapping(Rarity => NFTItem[]) public treasury;
    mapping(Rarity => uint256) public rarityCount;
    address public gachaContract;
    
    // Duplicate protection
    mapping(address => mapping(uint256 => bool)) public depositedNFTs;

    event NFTDeposited(address indexed collection, uint256 indexed tokenId, Rarity rarity);
    event NFTWithdrawn(address indexed collection, uint256 indexed tokenId, Rarity rarity, address to);
    event GachaContractUpdated(address indexed oldGacha, address indexed newGacha);
    event BatchDeposited(uint256 count, Rarity rarity);
    event BatchWithdrawn(uint256 count, Rarity rarity, address to);

    modifier onlyGacha() {
        require(msg.sender == gachaContract, "GachaTreasury: Only gacha contract allowed");
        _;
    }

    constructor(address _owner, address _gachaContract) Ownable(_owner) {
        gachaContract = _gachaContract;
    }

    /// @notice Deposits an NFT into the treasury
    /// @param collection NFT collection address
    /// @param tokenId Token ID to deposit
    /// @param rarity Assigned rarity for the NFT
    function depositNFT(address collection, uint256 tokenId, Rarity rarity) external onlyOwner nonReentrant {
        if (collection == address(0)) revert InvalidCollectionAddress();
        if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
        if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
        if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

        IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
        depositedNFTs[collection][tokenId] = true;

        treasury[rarity].push(NFTItem({collection: collection, tokenId: tokenId, rarity: rarity}));
        unchecked {
            ++rarityCount[rarity];
        }

        emit NFTDeposited(collection, tokenId, rarity);
    }

    /// @notice Withdraws an NFT from the treasury
    /// @param rarity Rarity tier to withdraw from
    /// @param index Index of NFT in the rarity array
    /// @param to Recipient address
    function withdrawNFT(Rarity rarity, uint256 index, address to) external onlyOwner nonReentrant {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        if (to == address(0)) revert InvalidRecipient();

        NFTItem memory item = treasury[rarity][index];

        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        unchecked {
            --rarityCount[rarity];
        }
        depositedNFTs[item.collection][item.tokenId] = false;

        IERC721(item.collection).safeTransferFrom(address(this), to, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, to);
    }

    /// @notice Sends NFT to gacha winner (called by gacha contract)
    /// @param rarity Rarity tier to select from
    /// @param index Index of NFT in the rarity array
    /// @param winner Winner's address
    /// @return item The NFT item that was sent
    function sendNFTToWinner(Rarity rarity, uint256 index, address winner)
        external
        onlyGacha
        returns (NFTItem memory item)
    {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        if (winner == address(0)) revert InvalidRecipient();

        item = treasury[rarity][index];

        treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
        treasury[rarity].pop();
        unchecked {
            --rarityCount[rarity];
        }
        depositedNFTs[item.collection][item.tokenId] = false;

        IERC721(item.collection).safeTransferFrom(address(this), winner, item.tokenId);

        emit NFTWithdrawn(item.collection, item.tokenId, rarity, winner);
    }

    function getTreasuryItems(Rarity rarity) external view returns (NFTItem[] memory) {
        return treasury[rarity];
    }

    /// @notice Gets a specific NFT item from treasury
    /// @param rarity Rarity tier
    /// @param index Index in the rarity array
    /// @return NFT item at the specified position
    function getTreasuryItem(Rarity rarity, uint256 index) external view returns (NFTItem memory) {
        if (index >= treasury[rarity].length) revert InvalidIndex();
        return treasury[rarity][index];
    }

    function getRarityCount(Rarity rarity) external view returns (uint256) {
        return rarityCount[rarity];
    }

    function getTotalItemsCount() external view returns (uint256) {
        return rarityCount[Rarity.Common] + 
               rarityCount[Rarity.Uncommon] + 
               rarityCount[Rarity.Rare] + 
               rarityCount[Rarity.Epic] + 
               rarityCount[Rarity.Legendary];
    }

    /// @notice Updates the authorized gacha contract address
    /// @param _gachaContract New gacha contract address
    function setGachaContract(address _gachaContract) external onlyOwner {
        if (_gachaContract == address(0)) revert InvalidGachaContract();
        address oldGacha = gachaContract;
        gachaContract = _gachaContract;
        emit GachaContractUpdated(oldGacha, _gachaContract);
    }

    // Batch operations
    /// @notice Batch deposit multiple NFTs
    /// @param collections Array of NFT collection addresses
    /// @param tokenIds Array of token IDs
    /// @param rarities Array of assigned rarities
    function batchDepositNFT(
        address[] calldata collections,
        uint256[] calldata tokenIds,
        Rarity[] calldata rarities
    ) external onlyOwner nonReentrant {
        uint256 length = collections.length;
        if (length != tokenIds.length || length != rarities.length) revert ArrayLengthMismatch();
        if (length == 0) revert EmptyArrays();
        if (length > MAX_BATCH_DEPOSIT) revert TooManyItems();
        
        for (uint256 i; i < length;) {
            address collection = collections[i];
            uint256 tokenId = tokenIds[i];
            Rarity rarity = rarities[i];
            
            if (collection == address(0)) revert InvalidCollectionAddress();
            if (depositedNFTs[collection][tokenId]) revert NFTAlreadyDeposited();
            if (!_isValidNFTContract(collection)) revert InvalidNFTContract();
            if (IERC721(collection).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
            
            IERC721(collection).safeTransferFrom(msg.sender, address(this), tokenId);
            depositedNFTs[collection][tokenId] = true;
            
            treasury[rarity].push(NFTItem({collection: collection, tokenId: tokenId, rarity: rarity}));
            unchecked {
                ++rarityCount[rarity];
                ++i;
            }
            
            emit NFTDeposited(collection, tokenId, rarity);
        }
        
        emit BatchDeposited(length, rarities[0]);
    }
    
    /// @notice Batch withdraw multiple NFTs of same rarity
    /// @param rarity Rarity tier to withdraw from
    /// @param indices Array of indices to withdraw
    /// @param to Recipient address
    function batchWithdrawNFT(
        Rarity rarity,
        uint256[] calldata indices,
        address to
    ) external onlyOwner nonReentrant {
        uint256 length = indices.length;
        if (length == 0) revert EmptyArrays();
        if (length > MAX_BATCH_WITHDRAW) revert TooManyItems();
        if (to == address(0)) revert InvalidRecipient();
        
        // Sort indices in descending order to avoid index shifting issues
        uint256[] memory sortedIndices = _quickSort(indices);
        
        for (uint256 i; i < length;) {
            uint256 index = sortedIndices[i];
            if (index >= treasury[rarity].length) revert InvalidIndex();
            
            NFTItem memory item = treasury[rarity][index];
            
            treasury[rarity][index] = treasury[rarity][treasury[rarity].length - 1];
            treasury[rarity].pop();
            unchecked {
                --rarityCount[rarity];
                ++i;
            }
            depositedNFTs[item.collection][item.tokenId] = false;
            
            IERC721(item.collection).safeTransferFrom(address(this), to, item.tokenId);
            
            emit NFTWithdrawn(item.collection, item.tokenId, rarity, to);
        }
        
        emit BatchWithdrawn(length, rarity, to);
    }
    
    // Helper functions
    function _isValidNFTContract(address collection) private view returns (bool) {
        try IERC721(collection).supportsInterface(0x80ac58cd) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }
    
    /// @dev Optimized sorting for small arrays (up to 20 items)
    /// @param arr Array to sort in descending order
    /// @return sorted Sorted array in descending order
    function _quickSort(uint256[] calldata arr) private pure returns (uint256[] memory sorted) {
        uint256 length = arr.length;
        sorted = new uint256[](length);
        
        for (uint256 i; i < length;) {
            sorted[i] = arr[i];
            unchecked { ++i; }
        }
        
        // Insertion sort for small arrays (most efficient for n <= 20)
        for (uint256 i = 1; i < length;) {
            uint256 key = sorted[i];
            uint256 j = i;
            
            while (j > 0 && sorted[j - 1] < key) {
                sorted[j] = sorted[j - 1];
                unchecked { --j; }
            }
            sorted[j] = key;
            unchecked { ++i; }
        }
    }
    
    function isNFTDeposited(address collection, uint256 tokenId) external view returns (bool) {
        return depositedNFTs[collection][tokenId];
    }
    
    /// @notice Required for receiving ERC721 tokens
    function onERC721Received(
        address, // operator
        address, // from
        uint256, // tokenId
        bytes calldata // data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}