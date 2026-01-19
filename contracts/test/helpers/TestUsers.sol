// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {TestConstants} from "./TestConstants.sol";

/**
 * @title Test Users
 * @notice Manages test addresses for all test contracts
 * @dev Provides labeled addresses and helper functions
 * @author NFT Gacha Team
 */
contract TestUsers is Test {
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================

    /// @dev Named test addresses
    address public owner;
    address public user;
    address public unauthorizedUser;
    address public depositor;
    address public spinner;
    address public oracle;
    address public protocolTreasury;
    address public gachaContract;

    /// @dev Additional test addresses
    address public constant ALICE = address(0xA11CE);
    address public constant BOB = address(0xB0B);
    address public constant CHARLIE = address(0xC4A11E);

    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================

    constructor() {
        _initializeUsers();
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * @notice Initialize standard test users
     * @dev Uses constant addresses from TestConstants for consistency
     */
    function _initializeUsers() internal {
        owner = TestConstants.OWNER;
        user = TestConstants.USER;
        unauthorizedUser = TestConstants.UNAUTHORIZED_USER;
        depositor = TestConstants.DEPOSITOR;
        spinner = TestConstants.SPINNER;
        oracle = TestConstants.ORACLE;
        protocolTreasury = TestConstants.PROTOCOL_TREASURY;
        gachaContract = TestConstants.GACHA_CONTRACT;
    }

    // ========================================================================
    // GETTER FUNCTIONS
    // ========================================================================

    /**
     * @notice Get all test users as an array
     * @return All standard test addresses
     */
    function getAllUsers() public view returns (address[] memory) {
        address[] memory users = new address[](7);
        users[0] = owner;
        users[1] = user;
        users[2] = unauthorizedUser;
        users[3] = depositor;
        users[4] = spinner;
        users[5] = oracle;
        users[6] = protocolTreasury;
        return users;
    }

    /**
     * @notice Get a named address
     * @param name The name of the user (e.g., "owner", "user")
     * @return The corresponding address
     */
    function getUser(string memory name) public view returns (address) {
        bytes32 nameHash = keccak256(bytes(name));

        if (nameHash == keccak256("owner")) return owner;
        if (nameHash == keccak256("user")) return user;
        if (nameHash == keccak256("unauthorizedUser")) return unauthorizedUser;
        if (nameHash == keccak256("depositor")) return depositor;
        if (nameHash == keccak256("spinner")) return spinner;
        if (nameHash == keccak256("oracle")) return oracle;
        if (nameHash == keccak256("protocolTreasury")) return protocolTreasury;
        if (nameHash == keccak256("gachaContract")) return gachaContract;

        revert(string(abi.encodePacked("Unknown user: ", name)));
    }

    /**
     * @notice Create a new labeled address
     * @param label The label for the address
     * @return A new address created with makeAddr
     */
    function createLabeledAddress(string memory label) public returns (address) {
        return makeAddr(label);
    }

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * @notice Fund addresses with ETH
     * @param recipients The addresses to fund
     * @param amount The amount to give each address
     */
    function fundAddresses(address[] memory recipients, uint256 amount) public {
        for (uint256 i = 0; i < recipients.length; i++) {
            vm.deal(recipients[i], amount);
        }
    }

    /**
     * @notice Fund all standard test users with ETH
     * @param amount The amount to give each user
     */
    function fundAllUsers(uint256 amount) public {
        address[] memory users = getAllUsers();
        fundAddresses(users, amount);
    }

    /**
     * @notice Set up prank for a specific user
     * @param userName The name of the user to prank
     */
    function prankAs(string memory userName) public {
        address userAddress = getUser(userName);
        vm.prank(userAddress);
    }

    /**
     * @notice Start persistent prank for a specific user
     * @param userName The name of the user to prank
     */
    function startPrankAs(string memory userName) public {
        address userAddress = getUser(userName);
        vm.startPrank(userAddress);
    }

    /**
     * @notice Create multiple random addresses
     * @param count The number of addresses to create
     * @return Array of new addresses
     */
    function createRandomAddresses(uint256 count) public returns (address[] memory) {
        address[] memory addresses = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            addresses[i] = makeAddr(string(abi.encodePacked("random-", vm.toString(i))));
        }
        return addresses;
    }
}
