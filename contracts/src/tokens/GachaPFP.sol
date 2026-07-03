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
    error NotTokenOwnerOrApproved();
    error RevealNotTimedOut();
    error RefundFailed();

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

    /// @notice How long a mint may remain unrevealed before the owner can reclaim (burn + refund)
    uint256 public constant MINT_REVEAL_TIMEOUT = 1 days;

    /// @notice Authorized WAVS service handler permitted to fulfill rarity randomness
    address public serviceHandler;

    /// @notice Mint fees held against still-unrevealed tokens; refundable via reclaimUnrevealedMint
    ///         and therefore NOT withdrawable by the owner until those tokens are revealed.
    uint256 public refundsEscrowed;

    /// @notice Rarity assigned to each token once its randomness has been fulfilled
    mapping(uint256 => Rarity) public tokenRarity;

    /// @notice Whether a token's rarity has been fulfilled by the randomness service
    mapping(uint256 => bool) public rarityRevealed;

    /// @notice Timestamp of the most recent randomness request per token (for re-request cooldown)
    mapping(uint256 => uint256) public revealRequestedAt;

    event ServiceHandlerUpdated(address indexed oldHandler, address indexed newHandler);
    event RarityRequested(uint256 indexed tokenId, address indexed to);
    event RarityRevealed(uint256 indexed tokenId, Rarity rarity);
    event MintReclaimed(uint256 indexed tokenId, address indexed to, uint256 refund);

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
        // Escrow the mint price so it stays refundable until this token is revealed.
        refundsEscrowed += mintPrice;
        revealRequestedAt[tokenId] = block.timestamp;
        emit RarityRequested(tokenId, msg.sender);
        emit RandomnessRequested(tokenId);
    }

    /// @notice Re-emit the randomness request for a token whose rarity has not been fulfilled yet.
    /// @dev Permissionless recovery for operator downtime, rate-limited by REVEAL_REREQUEST_COOLDOWN
    ///      to avoid spamming the WAVS trigger. Reverts if the token is already revealed.
    /// @param tokenId Token to re-request randomness for
    function requestReveal(uint256 tokenId) external {
        address tokenOwner = _requireOwned(tokenId);
        // Restrict to the owner (or an approved operator) so re-requests can't be used to grief the
        // WAVS-DRAND operators by forcing beacon fetches + fulfillment txs for arbitrary tokens.
        if (!_isAuthorized(tokenOwner, msg.sender, tokenId)) revert NotTokenOwnerOrApproved();
        if (rarityRevealed[tokenId]) revert RarityAlreadyRevealed();
        if (block.timestamp < revealRequestedAt[tokenId] + REVEAL_REREQUEST_COOLDOWN) {
            revert RevealRequestCooldown();
        }
        revealRequestedAt[tokenId] = block.timestamp;
        emit RarityRequested(tokenId, tokenOwner);
        emit RandomnessRequested(tokenId);
    }

    /// @notice Burns a still-unrevealed token after the reveal timeout and refunds its mint price.
    /// @dev Terminal escape hatch if the WAVS-DRAND service never fulfills (e.g. prolonged outage),
    ///      so a paid mint can't be stranded inert forever. Callable by the token owner/approved once
    ///      MINT_REVEAL_TIMEOUT has elapsed since the last request. The refund is paid from the
    ///      escrowed mint fee, which withdraw() cannot touch while the token is unrevealed.
    /// @param tokenId Token to reclaim
    function reclaimUnrevealedMint(uint256 tokenId) external {
        address tokenOwner = _requireOwned(tokenId);
        if (!_isAuthorized(tokenOwner, msg.sender, tokenId)) revert NotTokenOwnerOrApproved();
        if (rarityRevealed[tokenId]) revert RarityAlreadyRevealed();
        if (block.timestamp < revealRequestedAt[tokenId] + MINT_REVEAL_TIMEOUT) {
            revert RevealNotTimedOut();
        }

        uint256 refund = mintPrice;
        // Effects before interaction (CEI): release escrow and burn before sending funds.
        if (refund > 0) {
            refundsEscrowed -= refund;
        }
        _burn(tokenId);

        emit MintReclaimed(tokenId, tokenOwner, refund);

        if (refund > 0) {
            (bool success,) = tokenOwner.call{value: refund}("");
            if (!success) revert RefundFailed();
        }
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
        // The mint is now final; its fee is protocol revenue and no longer refundable.
        refundsEscrowed -= mintPrice;
        emit RarityRevealed(tokenId, r);
    }

    /// @notice Returns the total number of tokens minted so far
    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }

    /// @notice Withdraw collected mint fees to the owner, excluding fees still escrowed against
    ///         unrevealed (reclaimable) tokens.
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance - refundsEscrowed;
        (bool success,) = owner().call{value: amount}("");
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
