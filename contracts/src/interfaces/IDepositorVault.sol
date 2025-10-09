// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IDepositorVault
 * @notice Interface for the depositor yield vault backing the NFT Gacha
 */
interface IDepositorVault {
    /**
     * @notice Emitted when appraisal-backed shares are created for a depositor
     * @param account Address receiving the shares
     * @param appraisalValueUSD Appraised value (18 decimals) used as share weight
     */
    event DepositorRegistered(address indexed account, uint256 appraisalValueUSD);

    /**
     * @notice Emitted when an existing depositor's appraised value is updated
     * @param account Address whose position changed
     * @param previousValueUSD Previous appraisal (18 decimals)
     * @param newValueUSD New appraisal (18 decimals)
     */
    event DepositorUpdated(address indexed account, uint256 previousValueUSD, uint256 newValueUSD);

    /**
     * @notice Emitted when a depositor fully exits
     * @param account Address whose shares were burned
     * @param appraisalValueUSD Appraised value removed (18 decimals)
     */
    event DepositorDeregistered(address indexed account, uint256 appraisalValueUSD);

    /**
     * @notice Emitted on each yield distribution
     * @param caller Address that triggered the distribution (economy manager)
     * @param amount Amount of USDC distributed (6 decimals)
     */
    event YieldDistributed(address indexed caller, uint256 amount);

    /**
     * @notice Emitted when a depositor claims accrued yield
     * @param account Address claiming rewards
     * @param recipient Destination receiving USDC
     * @param amount Amount withdrawn (6 decimals)
     */
    event YieldClaimed(address indexed account, address indexed recipient, uint256 amount);

    /**
     * @notice Returns the USDC token used for yield accounting
     */
    function asset() external view returns (IERC20);

    /**
     * @notice Registers a new depositor with a given appraisal weight
     * @dev Only callable by the Gacha treasury
     * @param account Depositor address
     * @param appraisalValueUSD USD appraisal in 18 decimals
     */
    function registerDepositor(address account, uint256 appraisalValueUSD) external;

    /**
     * @notice Updates an existing depositor's appraisal weight
     * @dev Only callable by the Gacha treasury
     * @param account Depositor address
     * @param newAppraisalValueUSD New USD appraisal in 18 decimals
     */
    function updateDepositor(address account, uint256 newAppraisalValueUSD) external;

    /**
     * @notice Deregisters a depositor and burns their shares
     * @dev Only callable by the Gacha treasury
     * @param account Depositor address
     */
    function deregisterDepositor(address account) external;

    /**
     * @notice Distributes newly received USDC yield to all registered depositors
     * @dev Callable by the economy manager when 70% revenue share arrives
     * @param amount Amount of USDC (6 decimals) to distribute
     */
    function distributeYield(uint256 amount) external;

    /**
     * @notice Claims accumulated USDC yield for an account
     * @param account Address whose rewards will be withdrawn
     * @param recipient Target receiving the USDC
     * @return withdrawn Amount paid out in USDC
     */
    function claimYield(address account, address recipient) external returns (uint256 withdrawn);

    /**
     * @notice Returns claimable yield for an account
     * @param account Address to query
     */
    function pendingYield(address account) external view returns (uint256);

    /**
     * @notice Total appraisal-weighted shares outstanding
     */
    function totalShares() external view returns (uint256);

    /**
     * @notice Shares tracked for an individual depositor
     * @param account Address to query
     */
    function sharesOf(address account) external view returns (uint256);

    /**
     * @notice Stakes buyback liquidity into the vault for additional yield
     * @dev Only callable by the BuybackVault contract
     * @param amount Amount of USDC to stake (will be transferred in)
     */
    function stakeBuybackLiquidity(uint256 amount) external;

    /**
     * @notice Withdraws staked USDC for buyback operations
     * @dev Only callable by the BuybackVault contract
     * @param amount Amount of USDC to withdraw
     * @param recipient Destination that will receive the funds
     */
    function unstakeBuybackLiquidity(uint256 amount, address recipient) external;
}
