// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {RandomnessRequested} from "../interfaces/WavsDrandTypes.sol";

/// @title GachaPFP
/// @notice Paid-mint NFT profile picture collection with on-chain rarity traits and supply cap.
/// @dev Rarity is assigned by the WAVS-DRAND randomness service, NOT at mint time. A mint emits a
///      `RandomnessRequested(tokenId)` event; WAVS operators fetch a BLS-verified DRAND beacon and,
///      via the authorized service handler, call `fulfillRarity` with unpredictable randomness. This
///      prevents mint-time rarity prediction/sniping that on-chain sources like `block.prevrandao`
///      allow — important because rarity maps to real appraised value in the gacha treasury.
///      Until fulfilled, a token is "unrevealed": its metadata exposes no Rarity trait, so it cannot
///      be appraised or deposited. Metadata is fully on-chain (data URI JSON) for marketplaces.
contract GachaPFP is ERC721, Ownable {
    using Strings for uint256;

    error MintPriceNotMet();
    error MaxSupplyReached();
    error WithdrawFailed();
    error InvalidServiceHandler();
    error NotServiceHandler();
    error RarityAlreadyRevealed();
    error RevealRequestCooldown();

    enum Rarity {
        Common, // 40%
        Uncommon, // 25%
        Rare, // 18%
        Epic, // 10%
        Legendary, // 5%
        Mythic // 2%
    }

    uint256 private _nextId = 1;

    /// @notice Price to mint one PFP (in native token wei)
    uint256 public immutable mintPrice;

    /// @notice Maximum number of PFPs that can be minted
    uint256 public immutable maxSupply;

    /// @notice Minimum delay before a stuck (unfulfilled) reveal can be re-requested
    uint256 public constant REVEAL_REREQUEST_COOLDOWN = 5 minutes;

    /// @notice Authorized WAVS service handler permitted to fulfill rarity randomness
    address public serviceHandler;

    /// @notice Rarity assigned to each token once its randomness has been fulfilled
    mapping(uint256 => Rarity) public tokenRarity;

    /// @notice Whether a token's rarity has been fulfilled by the randomness service
    mapping(uint256 => bool) public rarityRevealed;

    /// @notice Timestamp of the most recent randomness request per token (for re-request cooldown)
    mapping(uint256 => uint256) public revealRequestedAt;

    event ServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event RarityRequested(uint256 indexed tokenId, address indexed to);
    event RarityRevealed(uint256 indexed tokenId, Rarity rarity);

    modifier onlyServiceHandler() {
        if (msg.sender != serviceHandler) revert NotServiceHandler();
        _;
    }

    constructor(uint256 _mintPrice, uint256 _maxSupply, address _owner) ERC721("Gacha PFP", "GPFP") Ownable(_owner) {
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
    }

    /// @notice Sets the authorized WAVS service handler that fulfills rarity randomness
    /// @param _serviceHandler New service handler address (must be non-zero)
    function setServiceHandler(address _serviceHandler) external onlyOwner {
        if (_serviceHandler == address(0)) revert InvalidServiceHandler();
        emit ServiceHandlerUpdated(serviceHandler, _serviceHandler);
        serviceHandler = _serviceHandler;
    }

    /// @notice Mint a single PFP NFT to the caller. Rarity is fulfilled asynchronously by WAVS-DRAND.
    /// @dev The token is minted immediately in an unrevealed state and a randomness request is
    ///      emitted. Rarity is set later by `fulfillRarity`; until then the token has no Rarity trait.
    function mint() external payable returns (uint256 tokenId) {
        if (msg.value < mintPrice) revert MintPriceNotMet();
        tokenId = _nextId++;
        if (tokenId > maxSupply) revert MaxSupplyReached();
        _mint(msg.sender, tokenId);
        revealRequestedAt[tokenId] = block.timestamp;
        emit RarityRequested(tokenId, msg.sender);
        emit RandomnessRequested(tokenId);
    }

    /// @notice Re-emit the randomness request for a token whose rarity has not been fulfilled yet.
    /// @dev Permissionless recovery for operator downtime, rate-limited by REVEAL_REREQUEST_COOLDOWN
    ///      to avoid spamming the WAVS trigger. Reverts if the token is already revealed.
    /// @param tokenId Token to re-request randomness for
    function requestReveal(uint256 tokenId) external {
        _requireOwned(tokenId);
        if (rarityRevealed[tokenId]) revert RarityAlreadyRevealed();
        if (block.timestamp < revealRequestedAt[tokenId] + REVEAL_REREQUEST_COOLDOWN) {
            revert RevealRequestCooldown();
        }
        revealRequestedAt[tokenId] = block.timestamp;
        emit RarityRequested(tokenId, _ownerOf(tokenId));
        emit RandomnessRequested(tokenId);
    }

    /// @notice Fulfills a token's rarity using randomness from the WAVS-DRAND service.
    /// @dev Only the authorized service handler may call this. Idempotent: reverts if already revealed.
    /// @param tokenId Token to assign rarity to
    /// @param randomness Random bytes32 derived from a BLS-verified DRAND beacon
    function fulfillRarity(uint256 tokenId, bytes32 randomness) external onlyServiceHandler {
        _requireOwned(tokenId);
        if (rarityRevealed[tokenId]) revert RarityAlreadyRevealed();
        Rarity r = _rollToRarity(uint256(randomness) % 10000);
        tokenRarity[tokenId] = r;
        rarityRevealed[tokenId] = true;
        emit RarityRevealed(tokenId, r);
    }

    /// @notice Returns the total number of tokens minted so far
    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }

    /// @notice Withdraw collected mint fees to the owner
    function withdraw() external onlyOwner {
        (bool success,) = owner().call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    /// @notice Returns fully on-chain JSON metadata. Unrevealed tokens expose no Rarity trait.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        bytes memory json;
        if (rarityRevealed[tokenId]) {
            string memory rarityStr = _rarityString(tokenRarity[tokenId]);
            json = abi.encodePacked(
                '{"name":"Gacha PFP #',
                tokenId.toString(),
                '","description":"Gacha PFP Collection - ',
                rarityStr,
                '","attributes":[{"trait_type":"Rarity","value":"',
                rarityStr,
                '"}]}'
            );
        } else {
            // No Rarity trait until fulfilled, so appraisal/treasury deposit is blocked pre-reveal.
            json = abi.encodePacked(
                '{"name":"Gacha PFP #',
                tokenId.toString(),
                '","description":"Gacha PFP Collection - Unrevealed","attributes":[{"trait_type":"Status","value":"Unrevealed"}]}'
            );
        }

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(json)));
    }

    /// @dev Maps a uniform roll in [0, 10000) to a rarity tier.
    function _rollToRarity(uint256 roll) internal pure returns (Rarity) {
        if (roll < 4000) return Rarity.Common; // 40%
        if (roll < 6500) return Rarity.Uncommon; // 25%
        if (roll < 8300) return Rarity.Rare; // 18%
        if (roll < 9300) return Rarity.Epic; // 10%
        if (roll < 9800) return Rarity.Legendary; //  5%
        return Rarity.Mythic; //  2%
    }

    function _rarityString(Rarity r) internal pure returns (string memory) {
        if (r == Rarity.Common) return "Common";
        if (r == Rarity.Uncommon) return "Uncommon";
        if (r == Rarity.Rare) return "Rare";
        if (r == Rarity.Epic) return "Epic";
        if (r == Rarity.Legendary) return "Legendary";
        return "Mythic";
    }
}
