import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Address
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const addressAbi = [
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BaseERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const baseErc20Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BaseERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const baseErc721Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'batchMint',
    outputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'uris', internalType: 'string[]', type: 'string[]' },
    ],
    name: 'batchMintWithURIs',
    outputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'mint',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'uri', internalType: 'string', type: 'string' },
    ],
    name: 'mintWithURI',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'baseURI', internalType: 'string', type: 'string' }],
    name: 'setBaseURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'uri', internalType: 'string', type: 'string' },
    ],
    name: 'setTokenURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ContextUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const contextUpgradeableAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DepositorVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const depositorVaultAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accYieldPerShare',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'claimYield',
    outputs: [{ name: 'withdrawn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'deregisterDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'distributeYield',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'economyManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'asset_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'economyManager_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'pendingYield',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'appraisalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newManager', internalType: 'address', type: 'address' }],
    name: 'setEconomyManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalYieldClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalYieldDistributed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      {
        name: 'newAppraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'updateDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorDeregistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EconomyManagerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldDistributed',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ECDSA
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ecdsaAbi = [
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EIP712
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const eip712Abi = [
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC165
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc165Abi = [
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967ProxyAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'payable',
  },
  { type: 'fallback', stateMutability: 'payable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'ERC1967ProxyUninitialized' },
  { type: 'error', inputs: [], name: 'FailedCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC1967Utils
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc1967UtilsAbi = [
  {
    type: 'error',
    inputs: [{ name: 'admin', internalType: 'address', type: 'address' }],
    name: 'ERC1967InvalidAdmin',
  },
  {
    type: 'error',
    inputs: [{ name: 'beacon', internalType: 'address', type: 'address' }],
    name: 'ERC1967InvalidBeacon',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20BatchQuery
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20BatchQueryAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'userAddress', internalType: 'address', type: 'address' },
      { name: 'spenderAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getBalanceAndAllowanceBatch',
    outputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'userAddresses', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'getMultipleBalancesBatch',
    outputs: [
      { name: 'balances', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenAddress', internalType: 'address', type: 'address' },
      { name: 'userAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getTokenInfoBatch',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'decimals', internalType: 'uint8', type: 'uint8' },
      { name: 'totalSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'userBalance', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20Permit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20PermitAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721Abi = [
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC721Enumerable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc721EnumerableAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'ERC721EnumerableForbiddenBatchMint' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721OutOfBoundsIndex',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const errorsAbi = [
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'MissingPrecompile',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Gacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'SPIN_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TOTAL_WEIGHT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'economyManager',
    outputs: [
      {
        name: '',
        internalType: 'contract IGachaEconomyManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyUnpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeTokenDecimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeTokenScalar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'triggerId', internalType: 'uint256', type: 'uint256' },
      { name: 'randomness', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'fulfillRandomness',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gachaServiceHandler',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAverageRarityValues',
    outputs: [
      { name: 'averageValues', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'triggerIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'getBatchSpinRequests',
    outputs: [
      {
        name: 'requests',
        internalType: 'struct Gacha.SpinRequest[]',
        type: 'tuple[]',
        components: [
          { name: 'feePaid', internalType: 'uint256', type: 'uint256' },
          { name: 'requestTime', internalType: 'uint256', type: 'uint256' },
          { name: 'requester', internalType: 'address', type: 'address' },
          { name: 'statusFlags', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentRarityWeights',
    outputs: [
      { name: 'weights', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentSpinFee',
    outputs: [{ name: 'fee', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getExpectedValueUSD',
    outputs: [
      { name: 'expectedValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGachaConfigBatch',
    outputs: [
      { name: 'feeTokenAddr', internalType: 'address', type: 'address' },
      { name: 'spinFeeAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'isPaused', internalType: 'bool', type: 'bool' },
      { name: 'rarityWeights', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'totalWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'isAvailable', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGlobalAnalytics',
    outputs: [
      { name: 'totalSpins', internalType: 'uint256', type: 'uint256' },
      { name: 'totalRefunds', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReclaims', internalType: 'uint256', type: 'uint256' },
      {
        name: 'globalRarityWinCounts',
        internalType: 'uint256[5]',
        type: 'uint256[5]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNextTriggerId',
    outputs: [{ name: 'nextId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSpinRequest',
    outputs: [
      { name: 'requester', internalType: 'address', type: 'address' },
      { name: 'fulfilled', internalType: 'bool', type: 'bool' },
      { name: 'reclaimed', internalType: 'bool', type: 'bool' },
      { name: 'feePaid', internalType: 'uint256', type: 'uint256' },
      { name: 'requestTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTargetRarityBps',
    outputs: [
      { name: 'targetBps', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalValueLocked',
    outputs: [
      { name: 'totalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTreasuryAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTreasuryDistribution',
    outputs: [
      { name: 'distribution', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAnalytics',
    outputs: [
      { name: 'totalSpins', internalType: 'uint256', type: 'uint256' },
      { name: 'totalRefunds', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReclaims', internalType: 'uint256', type: 'uint256' },
      { name: 'rarityWins', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserGachaBatch',
    outputs: [
      { name: 'totalSpins', internalType: 'uint256', type: 'uint256' },
      { name: 'totalRefunds', internalType: 'uint256', type: 'uint256' },
      { name: 'totalReclaims', internalType: 'uint256', type: 'uint256' },
      { name: 'rarityWins', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'spinCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getUserRarityWinCount',
    outputs: [{ name: 'winCount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserSpinCount',
    outputs: [{ name: 'spinCount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'globalRarityWins',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      {
        name: '_gachaServiceHandler',
        internalType: 'address',
        type: 'address',
      },
      { name: '_feeToken', internalType: 'address', type: 'address' },
      { name: '_minSpinFee', internalType: 'uint256', type: 'uint256' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_economyManager', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxSpinFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minSpinFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pricingPremiumBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    name: 'reclaimFailedSpin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetBps', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    name: 'setDynamicWeightsConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_economyManager', internalType: 'address', type: 'address' },
    ],
    name: 'setEconomyManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'decimals', internalType: 'uint8', type: 'uint8' }],
    name: 'setFeeTokenDecimals',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_gachaServiceHandler',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setGachaServiceHandler',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'premiumBps', internalType: 'uint256', type: 'uint256' },
      { name: 'minFee', internalType: 'uint256', type: 'uint256' },
      { name: 'maxFee', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPricingConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'maxFee', internalType: 'uint256', type: 'uint256' }],
    name: 'spin',
    outputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'spinRequests',
    outputs: [
      { name: 'feePaid', internalType: 'uint256', type: 'uint256' },
      { name: 'requestTime', internalType: 'uint256', type: 'uint256' },
      { name: 'requester', internalType: 'address', type: 'address' },
      { name: 'statusFlags', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
      { name: 'maxFee', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'spinWithPermit',
    outputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'targetRarityBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalReclaimCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRefundCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSpinCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [
      { name: '', internalType: 'contract GachaTreasury', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'userRarityWins',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userReclaimCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userRefundCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userSpinCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'targetBps',
        internalType: 'uint256[5]',
        type: 'uint256[5]',
        indexed: false,
      },
    ],
    name: 'DynamicWeightsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EconomyManagerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EmergencyPause',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EmergencyUnpause',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousDecimals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newDecimals',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'FeeTokenDecimalsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldHandler',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newHandler',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GachaServiceHandlerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'premiumBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'minFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'maxFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PricingConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'triggerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'RandomnessRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'triggerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'appraisedPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'triggerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinReclaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'triggerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'selectedRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'refundAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinRefunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinRevenueForwarded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'triggerId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'status',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinStatusUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AlreadyFulfilled' },
  { type: 'error', inputs: [], name: 'CannotReclaimFulfilledSpin' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidEconomyManager' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidFeeTokenDecimals' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidPricingConfig' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidServiceHandler' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryContract' },
  { type: 'error', inputs: [], name: 'InvalidTriggerId' },
  {
    type: 'error',
    inputs: [
      { name: 'currentFee', internalType: 'uint256', type: 'uint256' },
      { name: 'maxFee', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'MaxFeeExceeded',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'NoNFTsAvailable',
  },
  { type: 'error', inputs: [], name: 'NoTreasuryInventory' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotSpinRequester' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'SpinAlreadyReclaimed' },
  { type: 'error', inputs: [], name: 'SpinRequestNotExpired' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedServiceHandler' },
  { type: 'error', inputs: [], name: 'WeightsMustSumToTotal' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaEconomyManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaEconomyManagerAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'BPS_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositorShareBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositorVault',
    outputs: [
      { name: '', internalType: 'contract IDepositorVault', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gacha',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'feeToken_', internalType: 'address', type: 'address' },
      { name: 'gacha_', internalType: 'address', type: 'address' },
      { name: 'depositorVault_', internalType: 'address', type: 'address' },
      { name: 'protocolTreasury_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usdcAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'hitRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'onSpinRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolShareBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolTreasury',
    outputs: [
      { name: '', internalType: 'contract IProtocolTreasury', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'queuedDepositorYield',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'revenueByRarity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newToken', internalType: 'address', type: 'address' }],
    name: 'setFeeToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newGacha', internalType: 'address', type: 'address' }],
    name: 'setGacha',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'depositorBps', internalType: 'uint256', type: 'uint256' },
      { name: 'protocolBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setRevenueSplit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'depositorVault_', internalType: 'address', type: 'address' },
      { name: 'protocolTreasury_', internalType: 'address', type: 'address' },
    ],
    name: 'setVaults',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRevenueProcessed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalToDepositors',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalToProtocol',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousVault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newVault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DepositorVaultUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorYieldQueued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeTokenUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousGacha',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newGacha',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GachaUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ProtocolTreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'QueuedDepositorYieldProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositorShareBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolShareBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RevenueSplitUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'depositorShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinRevenueReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaServiceHandlerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'serviceManager',
        internalType: 'contract IWavsServiceManager',
        type: 'address',
      },
      { name: 'gachaAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGacha',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGachaTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getServiceManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'envelope',
        internalType: 'struct IWavsServiceHandler.Envelope',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'bytes20', type: 'bytes20' },
          { name: 'ordering', internalType: 'bytes12', type: 'bytes12' },
          { name: 'payload', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'signatureData',
        internalType: 'struct IWavsServiceHandler.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'referenceBlock', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'handleSignedEnvelope',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'randomness',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'RandomnessReceived',
  },
  { type: 'error', inputs: [], name: 'InvalidGachaAddress' },
  { type: 'error', inputs: [], name: 'InvalidServiceManager' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTreasuryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BATCH_DEPOSIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_BATCH_WITHDRAW',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_MIGRATION_BATCH',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'collection', internalType: 'address', type: 'address' }],
    name: 'addToWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'appraisalContract',
    outputs: [
      { name: '', internalType: 'contract NFTAppraisal', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'batchDepositNFT',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardTotalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'commonMaxPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'commonMinPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositNFT',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositedNFTs',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositorVault',
    outputs: [
      { name: '', internalType: 'contract IDepositorVault', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyUnpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epicMaxPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epicMinPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gachaContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllPriceRanges',
    outputs: [
      {
        name: 'ranges',
        internalType: 'struct GachaTreasury.PriceRange[5]',
        type: 'tuple[5]',
        components: [
          { name: 'minPriceUSD', internalType: 'uint256', type: 'uint256' },
          { name: 'maxPriceUSD', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllRarityCounts',
    outputs: [
      { name: 'counts', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllRarityTotalValues',
    outputs: [
      { name: 'values', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getAllUserCardDeposits',
    outputs: [
      {
        name: 'deposits',
        internalType: 'struct GachaTreasury.UserCardDeposit[]',
        type: 'tuple[]',
        components: [
          { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'depositCount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'totalCardDeposits',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardTotalDeposits',
    outputs: [{ name: 'totalCount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGlobalStats',
    outputs: [
      { name: 'totalDeposited', internalType: 'uint256', type: 'uint256' },
      { name: 'totalClaimed', internalType: 'uint256', type: 'uint256' },
      { name: 'activeUsers', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNFTCurrentRarity',
    outputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNFTReceiveTime',
    outputs: [
      { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformOverviewBatch',
    outputs: [
      { name: 'rarityCounts', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'totalItems', internalType: 'uint256', type: 'uint256' },
      { name: 'gachaAvailable', internalType: 'bool', type: 'bool' },
      { name: 'totalDeposited', internalType: 'uint256', type: 'uint256' },
      { name: 'totalClaimed', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getPriceRange',
    outputs: [
      { name: 'minPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'maxPrice', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'priceUSD', internalType: 'uint256', type: 'uint256' }],
    name: 'getRarityByPrice',
    outputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getRarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getRarityTotalValue',
    outputs: [{ name: 'totalValue', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalItemsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTreasuryItem',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaTreasury.NFTItem',
        type: 'tuple',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getTreasuryItems',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaTreasury.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAllDepositCounts',
    outputs: [
      { name: 'counts', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAllDepositValues',
    outputs: [
      { name: 'values', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserCardDepositsPage',
    outputs: [
      {
        name: 'deposits',
        internalType: 'struct GachaTreasury.UserCardDeposit[]',
        type: 'tuple[]',
        components: [
          { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'depositCount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'totalCardDeposits',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
      { name: 'total', internalType: 'uint256', type: 'uint256' },
      { name: 'hasMore', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserCardIds',
    outputs: [
      { name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'total', internalType: 'uint256', type: 'uint256' },
      { name: 'hasMore', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserCardIdsLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getUserDepositCount',
    outputs: [{ name: 'count', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getUserDepositValue',
    outputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserDepositedNFTs',
    outputs: [
      {
        name: 'items',
        internalType: 'struct GachaTreasury.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getUserDepositedNFTsByCardId',
    outputs: [
      {
        name: 'items',
        internalType: 'struct GachaTreasury.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserLifetimeClaimed',
    outputs: [{ name: 'claimed', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserLifetimeDeposited',
    outputs: [{ name: 'deposited', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserLifetimeStats',
    outputs: [
      { name: 'deposited', internalType: 'uint256', type: 'uint256' },
      { name: 'withdrawn', internalType: 'uint256', type: 'uint256' },
      { name: 'claimed', internalType: 'uint256', type: 'uint256' },
      { name: 'netContribution', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserLifetimeWithdrawn',
    outputs: [{ name: 'withdrawn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserProfileBatch',
    outputs: [
      { name: 'depositCounts', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'totalDeposits', internalType: 'uint256', type: 'uint256' },
      { name: 'lifetimeClaimed', internalType: 'uint256', type: 'uint256' },
      { name: 'lifetimeDeposited', internalType: 'uint256', type: 'uint256' },
      { name: 'lifetimeWithdrawn', internalType: 'uint256', type: 'uint256' },
      { name: 'netContribution', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserTotalDepositCount',
    outputs: [{ name: 'totalCount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelistLength',
    outputs: [{ name: 'count', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelistedCollections',
    outputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalLifetimeClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'globalLifetimeDeposited',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'seller', internalType: 'address', type: 'address' },
      { name: 'appraisalUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'handleRedemptionReturn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_gachaContract', internalType: 'address', type: 'address' },
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
      { name: 'minPrices', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'maxPrices', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'collection', internalType: 'address', type: 'address' }],
    name: 'isCollectionWhitelisted',
    outputs: [{ name: 'isWhitelisted', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isGachaAvailable',
    outputs: [{ name: 'available', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isNFTDeposited',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'legendaryMaxPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'legendaryMinPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'migrateNFTRarity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nftCurrentRarity',
    outputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nftReceiveTimes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nftToTreasuryIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'priceRangesSet',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolTreasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rareMaxPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rareMinPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'rarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordYieldClaim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'collection', internalType: 'address', type: 'address' }],
    name: 'removeFromWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'sendNFTToWinner',
    outputs: [
      {
        name: 'item',
        internalType: 'struct GachaTreasury.NFTItem',
        type: 'tuple',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'randomSeed', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'sendRandomNFTToWinner',
    outputs: [
      {
        name: 'item',
        internalType: 'struct GachaTreasury.NFTItem',
        type: 'tuple',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
    ],
    name: 'setAppraisalContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_depositorVault', internalType: 'address', type: 'address' },
    ],
    name: 'setDepositorVault',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_gachaContract', internalType: 'address', type: 'address' },
    ],
    name: 'setGachaContract',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_protocolTreasury', internalType: 'address', type: 'address' },
    ],
    name: 'setProtocolTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'depositor', internalType: 'address', type: 'address' }],
    name: 'syncDepositorValue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'totalRarityValue',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'treasury',
    outputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
      { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'uncommonMaxPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'uncommonMinPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userActiveDepositValueUSD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'userCardDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'userDepositCounts',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'userDepositValues',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userLifetimeClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userLifetimeDeposited',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userLifetimeWithdrawn',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userTotalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'whitelistedCollections',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'whitelistedCollectionsList',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawMyNFT',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldAppraisal',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newAppraisal',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AppraisalContractUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'BatchDeposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'BatchWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CollectionRemovedFromWhitelist',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CollectionWhitelisted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldVault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newVault',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'DepositorVaultUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldGacha',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newGacha',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GachaContractUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'appraisedPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NFTDeposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'NFTWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ProtocolTreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RarityMigrated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'appraisedPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionRestocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AppraisalRequired' },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'CollectionAlreadyWhitelisted' },
  { type: 'error', inputs: [], name: 'CollectionNotInWhitelist' },
  { type: 'error', inputs: [], name: 'CollectionNotWhitelisted' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EmptyArrays' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InsufficientDepositorValue' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalContract' },
  { type: 'error', inputs: [], name: 'InvalidCollectionAddress' },
  { type: 'error', inputs: [], name: 'InvalidDepositorVault' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidIndex' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidNFTContract' },
  { type: 'error', inputs: [], name: 'InvalidPriceRange' },
  { type: 'error', inputs: [], name: 'InvalidProtocolTreasury' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'NFTAlreadyDeposited' },
  { type: 'error', inputs: [], name: 'NFTNotAppraised' },
  { type: 'error', inputs: [], name: 'NFTNotDeposited' },
  {
    type: 'error',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'NoNFTsAvailable',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NotNFTDepositor' },
  { type: 'error', inputs: [], name: 'NotNFTOwner' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'priceUSD', internalType: 'uint256', type: 'uint256' }],
    name: 'PriceOutOfBounds',
  },
  { type: 'error', inputs: [], name: 'PriceRangesAlreadySet' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TooManyItems' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedGachaContract' },
  { type: 'error', inputs: [], name: 'UnauthorizedProtocolTreasury' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBeacon
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBeaconAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IDepositorVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iDepositorVaultAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'claimYield',
    outputs: [{ name: 'withdrawn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'deregisterDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'distributeYield',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'pendingYield',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'appraisalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      {
        name: 'newAppraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'updateDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorDeregistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldDistributed',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1155Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1155ErrorsAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidApprover',
  },
  {
    type: 'error',
    inputs: [
      { name: 'idsLength', internalType: 'uint256', type: 'uint256' },
      { name: 'valuesLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InvalidArrayLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1155MissingApprovalForAll',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1363
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1363Abi = [
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approveAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'approveAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'transferAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'transferFromAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFromAndCall',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1822Proxiable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1822ProxiableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC1967
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc1967Abi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20ErrorsAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20MetadataAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Permit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20PermitAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC5267
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc5267Abi = [
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Enumerable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721EnumerableAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Errors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ErrorsAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Metadata
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721MetadataAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC721Receiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc721ReceiverAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IFundsDistributionToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iFundsDistributionTokenAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'withdrawableFundsOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'fundsDistributed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'by', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'fundsWithdrawn',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsWithdrawn',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'feeToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'triggerId', internalType: 'uint256', type: 'uint256' },
      { name: 'randomness', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'fulfillRandomness',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentRarityWeights',
    outputs: [{ name: '', internalType: 'uint256[5]', type: 'uint256[5]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentSpinFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getExpectedValueUSD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTargetRarityBps',
    outputs: [{ name: '', internalType: 'uint256[5]', type: 'uint256[5]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targetBps', internalType: 'uint256[5]', type: 'uint256[5]' },
    ],
    name: 'setDynamicWeightsConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'decimals', internalType: 'uint8', type: 'uint8' }],
    name: 'setFeeTokenDecimals',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_serviceHandler', internalType: 'address', type: 'address' },
    ],
    name: 'setGachaServiceHandler',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'premiumBps', internalType: 'uint256', type: 'uint256' },
      { name: 'minFee', internalType: 'uint256', type: 'uint256' },
      { name: 'maxFee', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPricingConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'maxFee', internalType: 'uint256', type: 'uint256' }],
    name: 'spin',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
      { name: 'maxFee', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'spinWithPermit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGachaEconomyManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaEconomyManagerAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'depositorShareBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usdcAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'hitRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'onSpinRevenue',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolShareBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositorShareBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolShareBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RevenueSplitUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'depositorShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinRevenueReceived',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGachaTreasuryYieldTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaTreasuryYieldTrackerAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordYieldClaim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'returnData', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3Value[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'blockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBasefee',
    outputs: [{ name: 'basefee', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'blockNumber', internalType: 'uint256', type: 'uint256' }],
    name: 'getBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBlockNumber',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getChainId',
    outputs: [{ name: 'chainid', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockCoinbase',
    outputs: [{ name: 'coinbase', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockDifficulty',
    outputs: [{ name: 'difficulty', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockGasLimit',
    outputs: [{ name: 'gaslimit', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockTimestamp',
    outputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', internalType: 'address', type: 'address' }],
    name: 'getEthBalance',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryAggregate',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryBlockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iProtocolTreasuryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'executeRedemption',
    outputs: [{ name: 'payout', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'onRevenueReceived',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferOut',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolRevenueReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolTransfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionExecuted',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWavsServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWavsServiceHandlerAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'getServiceManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'envelope',
        internalType: 'struct IWavsServiceHandler.Envelope',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'bytes20', type: 'bytes20' },
          { name: 'ordering', internalType: 'bytes12', type: 'bytes12' },
          { name: 'payload', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'signatureData',
        internalType: 'struct IWavsServiceHandler.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'referenceBlock', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'handleSignedEnvelope',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWavsServiceManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWavsServiceManagerAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'getAllocationManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDelegationManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'signingKeyAddress', internalType: 'address', type: 'address' },
    ],
    name: 'getLatestOperatorForSigningKey',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'getOperatorWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getServiceURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getStakeRegistry',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_serviceURI', internalType: 'string', type: 'string' }],
    name: 'setServiceURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'envelope',
        internalType: 'struct IWavsServiceHandler.Envelope',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'bytes20', type: 'bytes20' },
          { name: 'ordering', internalType: 'bytes12', type: 'bytes12' },
          { name: 'payload', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'signatureData',
        internalType: 'struct IWavsServiceHandler.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'referenceBlock', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'validate',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'numerator',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'denominator',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'QuorumThresholdUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceURI',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ServiceURIUpdated',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signerWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'thresholdWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'totalWeight', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientQuorum',
  },
  { type: 'error', inputs: [], name: 'InsufficientQuorumZero' },
  { type: 'error', inputs: [], name: 'InvalidQuorumParameters' },
  { type: 'error', inputs: [], name: 'InvalidSignature' },
  { type: 'error', inputs: [], name: 'InvalidSignatureBlock' },
  { type: 'error', inputs: [], name: 'InvalidSignatureLength' },
  { type: 'error', inputs: [], name: 'InvalidSignatureOrder' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initializable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const initializableAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MessageHashUtils
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const messageHashUtilsAbi = [
  { type: 'error', inputs: [], name: 'ERC5267ExtensionsNotSupported' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockDepositorVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockDepositorVaultAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_asset', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'claimYield',
    outputs: [{ name: 'withdrawn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'deregisterDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'distributeYield',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'pendingYield',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'appraisalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'shares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'sharesOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      {
        name: 'newAppraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'updateDepositor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorDeregistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'appraisalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldDistributed',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockNFTAppraisal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockNftAppraisalAbi = [
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'appraisalStatuses',
    outputs: [
      {
        name: '',
        internalType: 'enum MockNFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardAppraisals',
    outputs: [
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum MockNFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
      { name: 'firstTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      {
        name: 'canonicalContractAddress',
        internalType: 'address',
        type: 'address',
      },
      { name: 'canonicalTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAppraisedPrice',
    outputs: [
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum MockNFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardAppraisal',
    outputs: [
      {
        name: '',
        internalType: 'struct MockNFTAppraisal.CardAppraisal',
        type: 'tuple',
        components: [
          { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
          {
            name: 'status',
            internalType: 'enum MockNFTAppraisal.AppraisalStatus',
            type: 'uint8',
          },
          { name: 'firstTimestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
          {
            name: 'canonicalContractAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'canonicalTokenId',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardInstance',
    outputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' }],
    name: 'getCardInstances',
    outputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTokenCardId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'hasAppraisal',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMockAppraisal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMockAppraisalWithCardId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'setTokenCardId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenCardIds',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockProtocolTreasuryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'executeRedemption',
    outputs: [{ name: 'payout', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'onRevenueReceived',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_asset', internalType: 'contract IERC20', type: 'address' },
    ],
    name: 'setAsset',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferOut',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolRevenueReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolTransfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionExecuted',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockWavsServiceManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockWavsServiceManagerAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'getAllocationManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDelegationManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'getLatestOperatorForSigningKey',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'getOperatorWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getServiceURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getStakeRegistry',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'uri', internalType: 'string', type: 'string' }],
    name: 'setMockServiceURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'weight', internalType: 'uint256', type: 'uint256' }],
    name: 'setOperatorWeight',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'uri', internalType: 'string', type: 'string' }],
    name: 'setServiceURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'value', internalType: 'bool', type: 'bool' }],
    name: 'setShouldRevert',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'shouldRevert',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct IWavsServiceHandler.Envelope',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'bytes20', type: 'bytes20' },
          { name: 'ordering', internalType: 'bytes12', type: 'bytes12' },
          { name: 'payload', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct IWavsServiceHandler.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'referenceBlock', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'validate',
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'numerator',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'denominator',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'QuorumThresholdUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'serviceURI',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ServiceURIUpdated',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signerWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'thresholdWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'totalWeight', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientQuorum',
  },
  { type: 'error', inputs: [], name: 'InsufficientQuorumZero' },
  { type: 'error', inputs: [], name: 'InvalidQuorumParameters' },
  { type: 'error', inputs: [], name: 'InvalidSignature' },
  { type: 'error', inputs: [], name: 'InvalidSignatureBlock' },
  { type: 'error', inputs: [], name: 'InvalidSignatureLength' },
  { type: 'error', inputs: [], name: 'InvalidSignatureOrder' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTAppraisal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftAppraisalAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'appraisalFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardAppraisals',
    outputs: [
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum NFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
      { name: 'firstTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      {
        name: 'canonicalContractAddress',
        internalType: 'address',
        type: 'address',
      },
      { name: 'canonicalTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyPause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyUnpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAppraisal',
    outputs: [
      {
        name: 'appraisal',
        internalType: 'struct NFTAppraisal.Appraisal',
        type: 'tuple',
        components: [
          { name: 'requester', internalType: 'address', type: 'address' },
          { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
          {
            name: 'status',
            internalType: 'enum NFTAppraisal.AppraisalStatus',
            type: 'uint8',
          },
          { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAppraisedPrice',
    outputs: [
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum NFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'getBatchAppraisals',
    outputs: [
      { name: 'prices', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'statuses',
        internalType: 'enum NFTAppraisal.AppraisalStatus[]',
        type: 'uint8[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardAppraisal',
    outputs: [
      {
        name: '',
        internalType: 'struct NFTAppraisal.CardAppraisal',
        type: 'tuple',
        components: [
          { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
          {
            name: 'status',
            internalType: 'enum NFTAppraisal.AppraisalStatus',
            type: 'uint8',
          },
          { name: 'firstTimestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
          {
            name: 'canonicalContractAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'canonicalTokenId',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' }],
    name: 'getCardAppraisals',
    outputs: [
      {
        name: 'appraisals',
        internalType: 'struct NFTAppraisal.CardAppraisal[]',
        type: 'tuple[]',
        components: [
          { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
          {
            name: 'status',
            internalType: 'enum NFTAppraisal.AppraisalStatus',
            type: 'uint8',
          },
          { name: 'firstTimestamp', internalType: 'uint256', type: 'uint256' },
          { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
          {
            name: 'canonicalContractAddress',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'canonicalTokenId',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardInstance',
    outputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' }],
    name: 'getCardInstances',
    outputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getServiceHandler',
    outputs: [{ name: 'handler', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTokenCardId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelistedTreasuries',
    outputs: [
      { name: 'treasuries', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'hasAppraisal',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'hasBatchAppraisals',
    outputs: [
      { name: 'hasAppraisals', internalType: 'bool[]', type: 'bool[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_feeToken', internalType: 'address', type: 'address' },
      { name: '_appraisalFee', internalType: 'uint256', type: 'uint256' },
      { name: '_protocolAddress', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'handler', internalType: 'address', type: 'address' }],
    name: 'isServiceHandler',
    outputs: [{ name: 'isAuthorized', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'treasury', internalType: 'address', type: 'address' }],
    name: 'isTreasuryWhitelisted',
    outputs: [{ name: 'isWhitelisted', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'pricesUSD', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'ownerBatchSetAppraisalForTokensWithCards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ownerSetAppraisalForTokenWithCard',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'protocolAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'requestAppraisal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'requestBatchAppraisal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'serviceHandler',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newFee', internalType: 'uint256', type: 'uint256' }],
    name: 'setAppraisalFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setAppraisalForTokenWithCard',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newFeeToken', internalType: 'address', type: 'address' },
    ],
    name: 'setFeeToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newProtocolAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setProtocolAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_serviceHandler', internalType: 'address', type: 'address' },
    ],
    name: 'setServiceHandler',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenCardIds',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenRequests',
    outputs: [
      { name: 'requester', internalType: 'address', type: 'address' },
      {
        name: 'status',
        internalType: 'enum NFTAppraisal.AppraisalStatus',
        type: 'uint8',
      },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'treasuryList',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'treasury', internalType: 'address', type: 'address' }],
    name: 'unwhitelistTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'treasury', internalType: 'address', type: 'address' }],
    name: 'whitelistTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'whitelistedTreasuries',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'priceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'oracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AppraisalCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AppraisalFeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AppraisalOverridden',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nftContract',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'AppraisalRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldStatus',
        internalType: 'enum NFTAppraisal.AppraisalStatus',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newStatus',
        internalType: 'enum NFTAppraisal.AppraisalStatus',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AppraisalStatusChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'treasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'AutoMigrationTriggered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'priceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'oracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardAppraisalCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'oldPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardPriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FeeTokenUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PriceUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ProtocolAddressUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldHandler',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newHandler',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ServiceHandlerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'TokenLinkedToCard',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'treasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryUnwhitelisted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'treasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TreasuryWhitelisted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AppraisalAlreadyExists' },
  { type: 'error', inputs: [], name: 'AppraisalNotFound' },
  { type: 'error', inputs: [], name: 'CardIdMismatch' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidCollection' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidPrice' },
  { type: 'error', inputs: [], name: 'InvalidProtocolAddress' },
  { type: 'error', inputs: [], name: 'InvalidTokenId' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryAddress' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TreasuryAlreadyWhitelisted' },
  { type: 'error', inputs: [], name: 'TreasuryNotWhitelisted' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedServiceHandler' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTAppraisalServiceHandler
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftAppraisalServiceHandlerAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'serviceManager',
        internalType: 'contract IWavsServiceManager',
        type: 'address',
      },
      { name: 'appraisalContract', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'payload', internalType: 'bytes', type: 'bytes' }],
    name: '_decodeError',
    outputs: [
      {
        name: '',
        internalType: 'struct AppraisalError',
        type: 'tuple',
        components: [
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'groupId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'error', internalType: 'string', type: 'string' },
          { name: 'txHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'payload', internalType: 'bytes', type: 'bytes' }],
    name: '_decodeSuccess',
    outputs: [
      {
        name: '',
        internalType: 'struct AppraisalSuccess',
        type: 'tuple',
        components: [
          { name: 'chain', internalType: 'string', type: 'string' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'groupId', internalType: 'bytes32', type: 'bytes32' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'txHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'checkAppraisal',
    outputs: [
      { name: 'exists', internalType: 'bool', type: 'bool' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAppraisalContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getServiceManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'envelope',
        internalType: 'struct IWavsServiceHandler.Envelope',
        type: 'tuple',
        components: [
          { name: 'eventId', internalType: 'bytes20', type: 'bytes20' },
          { name: 'ordering', internalType: 'bytes12', type: 'bytes12' },
          { name: 'payload', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'signatureData',
        internalType: 'struct IWavsServiceHandler.SignatureData',
        type: 'tuple',
        components: [
          { name: 'signers', internalType: 'address[]', type: 'address[]' },
          { name: 'signatures', internalType: 'bytes[]', type: 'bytes[]' },
          { name: 'referenceBlock', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'handleSignedEnvelope',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'contractAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'error', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'txHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'AppraisalErrorReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'priceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'AppraisalProcessed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'contractAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'txHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'AppraisalSuccessReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operation',
        internalType: 'string',
        type: 'string',
        indexed: true,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ServiceHandlerStatusUpdate',
  },
  { type: 'error', inputs: [], name: 'AppraisalProcessingFailed' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalContract' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalData' },
  { type: 'error', inputs: [], name: 'InvalidServiceManager' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Nonces
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const noncesAbi = [
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OwnableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableUpgradeableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PausableUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pausableUpgradeableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const protocolTreasuryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'REDEMPTION_PAYOUT_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'appraisalOracle',
    outputs: [
      { name: '', internalType: 'contract NFTAppraisal', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'economyManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'executeRedemption',
    outputs: [{ name: 'payout', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gachaTreasury',
    outputs: [
      { name: '', internalType: 'contract GachaTreasury', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getRemainingRedemptionWindow',
    outputs: [
      { name: 'remainingTime', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'asset_', internalType: 'address', type: 'address' },
      { name: 'economyManager_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'appraisalOracle_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isRedemptionEligible',
    outputs: [{ name: 'isEligible', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'onRevenueReceived',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'redemptionWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOracle', internalType: 'address', type: 'address' }],
    name: 'setAppraisalOracle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newManager', internalType: 'address', type: 'address' }],
    name: 'setEconomyManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newTreasury', internalType: 'address', type: 'address' }],
    name: 'setGachaTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newWindow', internalType: 'uint256', type: 'uint256' }],
    name: 'setRedemptionWindow',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferOut',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'AppraisalOracleUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newManager',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'EconomyManagerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newTreasury',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GachaTreasuryUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolRevenueReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ProtocolTransfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'payout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'timeSinceWin',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionWindowEnforced',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldWindow',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newWindow',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'RedemptionWindowUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'AppraisalMissing' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InsufficientLiquidity' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidArrayLength' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'RedemptionWindowExpired' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedEconomyManager' },
  {
    type: 'error',
    inputs: [{ name: 'context', internalType: 'string', type: 'string' }],
    name: 'ZeroAddress',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proxy
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const proxyAbi = [
  { type: 'fallback', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RarityTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const rarityTrackerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'depositorTotalsUSD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardDepositors',
    outputs: [
      { name: 'depositors', internalType: 'address[]', type: 'address[]' },
      { name: 'counts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getCardInfo',
    outputs: [
      { name: 'appraisalUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCount', internalType: 'uint256', type: 'uint256' },
      { name: 'totalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'depositor', internalType: 'address', type: 'address' }],
    name: 'getDepositorValue',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getStatistics',
    outputs: [
      { name: 'totalWins_', internalType: 'uint256', type: 'uint256' },
      { name: 'totalRewards_', internalType: 'uint256', type: 'uint256' },
      { name: 'totalNftsWon_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTrackedCards',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'hasWon',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      { name: 'rarityName_', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rarityName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'winner', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordWin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'appraisalUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'removeDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAppraisedValueUSD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalDepositedCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalNftsWon',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalWins',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newAppraisalUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateCardAppraisal',
    outputs: [
      { name: 'rarityDeltaUSD', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'key', internalType: 'string', type: 'string' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateTracker',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userWins',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'totalCount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalValueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardAggregationUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'previousAppraisalUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newAppraisalUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rarityDeltaUSD',
        internalType: 'int256',
        type: 'int256',
        indexed: false,
      },
    ],
    name: 'CardAppraisalUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'valueUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositorPositionUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'totalWins',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NftWon',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TrackerUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReentrancyGuardTransient
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reentrancyGuardTransientAbi = [
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeCast
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeCastAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'bits', internalType: 'uint8', type: 'uint8' },
      { name: 'value', internalType: 'int256', type: 'int256' },
    ],
    name: 'SafeCastOverflowedIntDowncast',
  },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'int256', type: 'int256' }],
    name: 'SafeCastOverflowedIntToUint',
  },
  {
    type: 'error',
    inputs: [
      { name: 'bits', internalType: 'uint8', type: 'uint8' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SafeCastOverflowedUintDowncast',
  },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'SafeCastOverflowedUintToInt',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeErc20Abi = [
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'currentAllowance', internalType: 'uint256', type: 'uint256' },
      { name: 'requestedDecrease', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SafeERC20FailedDecreaseAllowance',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ShortStrings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const shortStringsAbi = [
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Strings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const stringsAbi = [
  {
    type: 'error',
    inputs: [
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'length', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'StringsInsufficientHexLength',
  },
  { type: 'error', inputs: [], name: 'StringsInvalidAddressFormat' },
  { type: 'error', inputs: [], name: 'StringsInvalidChar' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UUPSUpgradeable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uupsUpgradeableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ValidationLib
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const validationLibAbi = [
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'EmptyArrays' },
  {
    type: 'error',
    inputs: [{ name: 'addr', internalType: 'address', type: 'address' }],
    name: 'InvalidAddress',
  },
  { type: 'error', inputs: [], name: 'InvalidArrayLength' },
  {
    type: 'error',
    inputs: [
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidIndex',
  },
  { type: 'error', inputs: [], name: 'InvalidLength' },
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TooManyItems',
  },
  {
    type: 'error',
    inputs: [{ name: 'context', internalType: 'string', type: 'string' }],
    name: 'ZeroAddress',
  },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useReadBaseErc20Contract = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadBaseErc20DomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc20Abi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadBaseErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBaseErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadBaseErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadBaseErc20Eip712Domain = /*#__PURE__*/ createUseReadContract(
  { abi: baseErc20Abi, functionName: 'eip712Domain' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadBaseErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"nonces"`
 */
export const useReadBaseErc20Nonces = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"owner"`
 */
export const useReadBaseErc20Owner = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadBaseErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBaseErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: baseErc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useWriteBaseErc20Contract = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteBaseErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteBaseErc20Mint = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc20Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"permit"`
 */
export const useWriteBaseErc20Permit = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc20Abi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBaseErc20RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteBaseErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBaseErc20TransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBaseErc20TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useSimulateBaseErc20Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: baseErc20Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBaseErc20Approve =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBaseErc20Mint = /*#__PURE__*/ createUseSimulateContract(
  { abi: baseErc20Abi, functionName: 'mint' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"permit"`
 */
export const useSimulateBaseErc20Permit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBaseErc20RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateBaseErc20Transfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBaseErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBaseErc20TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__
 */
export const useWatchBaseErc20Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: baseErc20Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBaseErc20Approval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchBaseErc20Eip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBaseErc20OwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBaseErc20Transfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useReadBaseErc721Contract = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBaseErc721BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadBaseErc721GetApproved = /*#__PURE__*/ createUseReadContract(
  { abi: baseErc721Abi, functionName: 'getApproved' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadBaseErc721IsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc721Abi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"name"`
 */
export const useReadBaseErc721Name = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"owner"`
 */
export const useReadBaseErc721Owner = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadBaseErc721OwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadBaseErc721SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc721Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadBaseErc721Symbol = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadBaseErc721TokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc721Abi,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadBaseErc721TokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc721Abi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadBaseErc721TokenUri = /*#__PURE__*/ createUseReadContract({
  abi: baseErc721Abi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBaseErc721TotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: baseErc721Abi, functionName: 'totalSupply' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useWriteBaseErc721Contract = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc721Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteBaseErc721Approve = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc721Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useWriteBaseErc721BatchMint = /*#__PURE__*/ createUseWriteContract(
  { abi: baseErc721Abi, functionName: 'batchMint' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMintWithURIs"`
 */
export const useWriteBaseErc721BatchMintWithUrIs =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'batchMintWithURIs',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteBaseErc721Mint = /*#__PURE__*/ createUseWriteContract({
  abi: baseErc721Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mintWithURI"`
 */
export const useWriteBaseErc721MintWithUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'mintWithURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBaseErc721RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteBaseErc721SafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteBaseErc721SetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setBaseURI"`
 */
export const useWriteBaseErc721SetBaseUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'setBaseURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setTokenURI"`
 */
export const useWriteBaseErc721SetTokenUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'setTokenURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBaseErc721TransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBaseErc721TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useSimulateBaseErc721Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: baseErc721Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBaseErc721Approve =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useSimulateBaseErc721BatchMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'batchMint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"batchMintWithURIs"`
 */
export const useSimulateBaseErc721BatchMintWithUrIs =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'batchMintWithURIs',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBaseErc721Mint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"mintWithURI"`
 */
export const useSimulateBaseErc721MintWithUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'mintWithURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBaseErc721RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateBaseErc721SafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateBaseErc721SetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setBaseURI"`
 */
export const useSimulateBaseErc721SetBaseUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'setBaseURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"setTokenURI"`
 */
export const useSimulateBaseErc721SetTokenUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'setTokenURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBaseErc721TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBaseErc721TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__
 */
export const useWatchBaseErc721Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: baseErc721Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBaseErc721Approval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchBaseErc721ApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBaseErc721OwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBaseErc721Transfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link contextUpgradeableAbi}__
 */
export const useWatchContextUpgradeableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: contextUpgradeableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link contextUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchContextUpgradeableInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: contextUpgradeableAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__
 */
export const useReadDepositorVaultContract =
  /*#__PURE__*/ createUseReadContract({ abi: depositorVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadDepositorVaultUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"accYieldPerShare"`
 */
export const useReadDepositorVaultAccYieldPerShare =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'accYieldPerShare',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadDepositorVaultAsset = /*#__PURE__*/ createUseReadContract({
  abi: depositorVaultAbi,
  functionName: 'asset',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadDepositorVaultEconomyManager =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'economyManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadDepositorVaultOwner = /*#__PURE__*/ createUseReadContract({
  abi: depositorVaultAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadDepositorVaultPaused = /*#__PURE__*/ createUseReadContract({
  abi: depositorVaultAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadDepositorVaultPendingYield =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'pendingYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadDepositorVaultProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadDepositorVaultSharesOf =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'sharesOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadDepositorVaultTotalShares =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'totalShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"totalYieldClaimed"`
 */
export const useReadDepositorVaultTotalYieldClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'totalYieldClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"totalYieldDistributed"`
 */
export const useReadDepositorVaultTotalYieldDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'totalYieldDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadDepositorVaultTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: depositorVaultAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__
 */
export const useWriteDepositorVaultContract =
  /*#__PURE__*/ createUseWriteContract({ abi: depositorVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteDepositorVaultClaimYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useWriteDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteDepositorVaultInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteDepositorVaultPause = /*#__PURE__*/ createUseWriteContract(
  { abi: depositorVaultAbi, functionName: 'pause' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useWriteDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteDepositorVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteDepositorVaultSetEconomyManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useWriteDepositorVaultSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteDepositorVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteDepositorVaultUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useWriteDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteDepositorVaultUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: depositorVaultAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__
 */
export const useSimulateDepositorVaultContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: depositorVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateDepositorVaultClaimYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useSimulateDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateDepositorVaultInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateDepositorVaultPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useSimulateDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateDepositorVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateDepositorVaultSetEconomyManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useSimulateDepositorVaultSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateDepositorVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateDepositorVaultUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useSimulateDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link depositorVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateDepositorVaultUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: depositorVaultAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__
 */
export const useWatchDepositorVaultContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: depositorVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"DepositorDeregistered"`
 */
export const useWatchDepositorVaultDepositorDeregistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'DepositorDeregistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"DepositorRegistered"`
 */
export const useWatchDepositorVaultDepositorRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'DepositorRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"DepositorUpdated"`
 */
export const useWatchDepositorVaultDepositorUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'DepositorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchDepositorVaultEconomyManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'EconomyManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchDepositorVaultInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchDepositorVaultOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchDepositorVaultPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const useWatchDepositorVaultTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchDepositorVaultUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchDepositorVaultUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchDepositorVaultYieldClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'YieldClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link depositorVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchDepositorVaultYieldDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: depositorVaultAbi,
    eventName: 'YieldDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link eip712Abi}__
 */
export const useReadEip712Contract = /*#__PURE__*/ createUseReadContract({
  abi: eip712Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link eip712Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadEip712Eip712Domain = /*#__PURE__*/ createUseReadContract({
  abi: eip712Abi,
  functionName: 'eip712Domain',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link eip712Abi}__
 */
export const useWatchEip712Contract = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: eip712Abi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link eip712Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchEip712Eip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: eip712Abi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc165Abi}__
 */
export const useReadErc165Contract = /*#__PURE__*/ createUseReadContract({
  abi: erc165Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc165Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc165SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: erc165Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc1967ProxyAbi}__
 */
export const useWatchErc1967ProxyContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: erc1967ProxyAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc1967ProxyAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchErc1967ProxyUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc1967ProxyAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20Contract = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20Contract = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20Contract = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Contract = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20Approval = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20Transfer = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Transfer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__
 */
export const useReadErc20BatchQueryContract =
  /*#__PURE__*/ createUseReadContract({ abi: erc20BatchQueryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getBalanceAndAllowanceBatch"`
 */
export const useReadErc20BatchQueryGetBalanceAndAllowanceBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20BatchQueryAbi,
    functionName: 'getBalanceAndAllowanceBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getMultipleBalancesBatch"`
 */
export const useReadErc20BatchQueryGetMultipleBalancesBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20BatchQueryAbi,
    functionName: 'getMultipleBalancesBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20BatchQueryAbi}__ and `functionName` set to `"getTokenInfoBatch"`
 */
export const useReadErc20BatchQueryGetTokenInfoBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20BatchQueryAbi,
    functionName: 'getTokenInfoBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useReadErc20PermitContract = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadErc20PermitDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20PermitAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20PermitAllowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20PermitBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20PermitDecimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadErc20PermitEip712Domain =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20PermitAbi,
    functionName: 'eip712Domain',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"name"`
 */
export const useReadErc20PermitName = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadErc20PermitNonces = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20PermitSymbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20PermitAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20PermitTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: erc20PermitAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useWriteErc20PermitContract = /*#__PURE__*/ createUseWriteContract(
  { abi: erc20PermitAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20PermitApprove = /*#__PURE__*/ createUseWriteContract({
  abi: erc20PermitAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteErc20PermitPermit = /*#__PURE__*/ createUseWriteContract({
  abi: erc20PermitAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20PermitTransfer = /*#__PURE__*/ createUseWriteContract(
  { abi: erc20PermitAbi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20PermitTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc20PermitAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useSimulateErc20PermitContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: erc20PermitAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20PermitApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20PermitAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateErc20PermitPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20PermitAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20PermitTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20PermitAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20PermitAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20PermitTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20PermitAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__
 */
export const useWatchErc20PermitContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: erc20PermitAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20PermitApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20PermitAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchErc20PermitEip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20PermitAbi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20PermitAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20PermitTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20PermitAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useReadErc721Contract = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc721BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadErc721GetApproved = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadErc721IsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721Abi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc721Name = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadErc721OwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc721SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc721Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadErc721TokenUri = /*#__PURE__*/ createUseReadContract({
  abi: erc721Abi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useWriteErc721Contract = /*#__PURE__*/ createUseWriteContract({
  abi: erc721Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc721Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc721Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteErc721SafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteErc721SetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc721TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc721Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__
 */
export const useSimulateErc721Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: erc721Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc721Approve = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc721Abi, functionName: 'approve' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateErc721SafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateErc721SetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc721TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__
 */
export const useWatchErc721Contract = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: erc721Abi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc721Approval = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: erc721Abi, eventName: 'Approval' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchErc721ApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc721Abi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc721Transfer = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: erc721Abi, eventName: 'Transfer' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useReadErc721EnumerableContract =
  /*#__PURE__*/ createUseReadContract({ abi: erc721EnumerableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc721EnumerableBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadErc721EnumerableGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadErc721EnumerableIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"name"`
 */
export const useReadErc721EnumerableName = /*#__PURE__*/ createUseReadContract({
  abi: erc721EnumerableAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadErc721EnumerableOwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadErc721EnumerableSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc721EnumerableSymbol =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadErc721EnumerableTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadErc721EnumerableTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadErc721EnumerableTokenUri =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc721EnumerableTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: erc721EnumerableAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useWriteErc721EnumerableContract =
  /*#__PURE__*/ createUseWriteContract({ abi: erc721EnumerableAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc721EnumerableApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721EnumerableAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteErc721EnumerableSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721EnumerableAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteErc721EnumerableSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721EnumerableAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc721EnumerableTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc721EnumerableAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useSimulateErc721EnumerableContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: erc721EnumerableAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc721EnumerableApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721EnumerableAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateErc721EnumerableSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721EnumerableAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateErc721EnumerableSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721EnumerableAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc721EnumerableTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc721EnumerableAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__
 */
export const useWatchErc721EnumerableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: erc721EnumerableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc721EnumerableApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc721EnumerableAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchErc721EnumerableApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc721EnumerableAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc721EnumerableAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc721EnumerableTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc721EnumerableAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useReadGachaContract = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"SPIN_TIMEOUT"`
 */
export const useReadGachaSpinTimeout = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'SPIN_TIMEOUT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"TOTAL_WEIGHT"`
 */
export const useReadGachaTotalWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'TOTAL_WEIGHT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadGachaEconomyManager = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'economyManager',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaFeeToken = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'feeToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeTokenDecimals"`
 */
export const useReadGachaFeeTokenDecimals = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'feeTokenDecimals' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeTokenScalar"`
 */
export const useReadGachaFeeTokenScalar = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'feeTokenScalar',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"gachaServiceHandler"`
 */
export const useReadGachaGachaServiceHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'gachaServiceHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getAverageRarityValues"`
 */
export const useReadGachaGetAverageRarityValues =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getAverageRarityValues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getBatchSpinRequests"`
 */
export const useReadGachaGetBatchSpinRequests =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getBatchSpinRequests',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getCurrentRarityWeights"`
 */
export const useReadGachaGetCurrentRarityWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getCurrentRarityWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getCurrentSpinFee"`
 */
export const useReadGachaGetCurrentSpinFee =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getCurrentSpinFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getExpectedValueUSD"`
 */
export const useReadGachaGetExpectedValueUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getExpectedValueUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getGachaConfigBatch"`
 */
export const useReadGachaGetGachaConfigBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getGachaConfigBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getGlobalAnalytics"`
 */
export const useReadGachaGetGlobalAnalytics =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getGlobalAnalytics',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getNextTriggerId"`
 */
export const useReadGachaGetNextTriggerId = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'getNextTriggerId' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getSpinRequest"`
 */
export const useReadGachaGetSpinRequest = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'getSpinRequest',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTargetRarityBps"`
 */
export const useReadGachaGetTargetRarityBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getTargetRarityBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTotalValueLocked"`
 */
export const useReadGachaGetTotalValueLocked =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getTotalValueLocked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTreasuryAddress"`
 */
export const useReadGachaGetTreasuryAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getTreasuryAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTreasuryDistribution"`
 */
export const useReadGachaGetTreasuryDistribution =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getTreasuryDistribution',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserAnalytics"`
 */
export const useReadGachaGetUserAnalytics = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'getUserAnalytics' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserGachaBatch"`
 */
export const useReadGachaGetUserGachaBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getUserGachaBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserRarityWinCount"`
 */
export const useReadGachaGetUserRarityWinCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getUserRarityWinCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getUserSpinCount"`
 */
export const useReadGachaGetUserSpinCount = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'getUserSpinCount' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"globalRarityWins"`
 */
export const useReadGachaGlobalRarityWins = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'globalRarityWins' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"maxSpinFee"`
 */
export const useReadGachaMaxSpinFee = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'maxSpinFee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"minSpinFee"`
 */
export const useReadGachaMinSpinFee = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'minSpinFee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaOwner = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaPaused = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"pricingPremiumBps"`
 */
export const useReadGachaPricingPremiumBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'pricingPremiumBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinRequests"`
 */
export const useReadGachaSpinRequests = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'spinRequests',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"targetRarityBps"`
 */
export const useReadGachaTargetRarityBps = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'targetRarityBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalReclaimCount"`
 */
export const useReadGachaTotalReclaimCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'totalReclaimCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalRefundCount"`
 */
export const useReadGachaTotalRefundCount = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'totalRefundCount' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"totalSpinCount"`
 */
export const useReadGachaTotalSpinCount = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'totalSpinCount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasury = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userRarityWins"`
 */
export const useReadGachaUserRarityWins = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'userRarityWins',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userReclaimCount"`
 */
export const useReadGachaUserReclaimCount = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'userReclaimCount' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userRefundCount"`
 */
export const useReadGachaUserRefundCount = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'userRefundCount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"userSpinCount"`
 */
export const useReadGachaUserSpinCount = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'userSpinCount',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useWriteGachaContract = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaEmergencyPause = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaAbi, functionName: 'emergencyPause' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useWriteGachaFulfillRandomness =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"reclaimFailedSpin"`
 */
export const useWriteGachaReclaimFailedSpin =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'reclaimFailedSpin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useWriteGachaSetDynamicWeightsConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setDynamicWeightsConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteGachaSetEconomyManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useWriteGachaSetFeeTokenDecimals =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setFeeTokenDecimals',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useWriteGachaSetGachaServiceHandler =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useWriteGachaSetPricingConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setPricingConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spin"`
 */
export const useWriteGachaSpin = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useWriteGachaSpinWithPermit = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaAbi, functionName: 'spinWithPermit' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useSimulateGachaContract = /*#__PURE__*/ createUseSimulateContract(
  { abi: gachaAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useSimulateGachaFulfillRandomness =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"reclaimFailedSpin"`
 */
export const useSimulateGachaReclaimFailedSpin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'reclaimFailedSpin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useSimulateGachaSetDynamicWeightsConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setDynamicWeightsConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateGachaSetEconomyManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useSimulateGachaSetFeeTokenDecimals =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setFeeTokenDecimals',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useSimulateGachaSetGachaServiceHandler =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useSimulateGachaSetPricingConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setPricingConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spin"`
 */
export const useSimulateGachaSpin = /*#__PURE__*/ createUseSimulateContract({
  abi: gachaAbi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useSimulateGachaSpinWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'spinWithPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__
 */
export const useWatchGachaContract = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"DynamicWeightsUpdated"`
 */
export const useWatchGachaDynamicWeightsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'DynamicWeightsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchGachaEconomyManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'EconomyManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EmergencyPause"`
 */
export const useWatchGachaEmergencyPause =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'EmergencyPause',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"EmergencyUnpause"`
 */
export const useWatchGachaEmergencyUnpause =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'EmergencyUnpause',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"FeeTokenDecimalsUpdated"`
 */
export const useWatchGachaFeeTokenDecimalsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'FeeTokenDecimalsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"GachaServiceHandlerUpdated"`
 */
export const useWatchGachaGachaServiceHandlerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'GachaServiceHandlerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaPaused = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
  eventName: 'Paused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"PricingConfigUpdated"`
 */
export const useWatchGachaPricingConfigUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'PricingConfigUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"RandomnessRequested"`
 */
export const useWatchGachaRandomnessRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'RandomnessRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinCompleted"`
 */
export const useWatchGachaSpinCompleted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinReclaimed"`
 */
export const useWatchGachaSpinReclaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinReclaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinRefunded"`
 */
export const useWatchGachaSpinRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinRevenueForwarded"`
 */
export const useWatchGachaSpinRevenueForwarded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinRevenueForwarded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinStatusUpdate"`
 */
export const useWatchGachaSpinStatusUpdate =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinStatusUpdate',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaUnpaused = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
  eventName: 'Unpaused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaUpgraded = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
  eventName: 'Upgraded',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useReadGachaEconomyManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaEconomyManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"BPS_DENOMINATOR"`
 */
export const useReadGachaEconomyManagerBpsDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'BPS_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaEconomyManagerUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"depositorShareBps"`
 */
export const useReadGachaEconomyManagerDepositorShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'depositorShareBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"depositorVault"`
 */
export const useReadGachaEconomyManagerDepositorVault =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'depositorVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaEconomyManagerFeeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'feeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"gacha"`
 */
export const useReadGachaEconomyManagerGacha =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'gacha',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaEconomyManagerOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaEconomyManagerPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"protocolShareBps"`
 */
export const useReadGachaEconomyManagerProtocolShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'protocolShareBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"protocolTreasury"`
 */
export const useReadGachaEconomyManagerProtocolTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'protocolTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaEconomyManagerProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"queuedDepositorYield"`
 */
export const useReadGachaEconomyManagerQueuedDepositorYield =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'queuedDepositorYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"revenueByRarity"`
 */
export const useReadGachaEconomyManagerRevenueByRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'revenueByRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalRevenueProcessed"`
 */
export const useReadGachaEconomyManagerTotalRevenueProcessed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'totalRevenueProcessed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalToDepositors"`
 */
export const useReadGachaEconomyManagerTotalToDepositors =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'totalToDepositors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalToProtocol"`
 */
export const useReadGachaEconomyManagerTotalToProtocol =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'totalToProtocol',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useWriteGachaEconomyManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaEconomyManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaEconomyManagerInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useWriteGachaEconomyManagerOnSpinRevenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'onSpinRevenue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteGachaEconomyManagerPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaEconomyManagerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteGachaEconomyManagerSetFeeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setFeeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setGacha"`
 */
export const useWriteGachaEconomyManagerSetGacha =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setGacha',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setRevenueSplit"`
 */
export const useWriteGachaEconomyManagerSetRevenueSplit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setRevenueSplit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setVaults"`
 */
export const useWriteGachaEconomyManagerSetVaults =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setVaults',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaEconomyManagerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteGachaEconomyManagerUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaEconomyManagerUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useSimulateGachaEconomyManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaEconomyManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaEconomyManagerInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useSimulateGachaEconomyManagerOnSpinRevenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'onSpinRevenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateGachaEconomyManagerPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaEconomyManagerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateGachaEconomyManagerSetFeeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setFeeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setGacha"`
 */
export const useSimulateGachaEconomyManagerSetGacha =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setGacha',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setRevenueSplit"`
 */
export const useSimulateGachaEconomyManagerSetRevenueSplit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setRevenueSplit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"setVaults"`
 */
export const useSimulateGachaEconomyManagerSetVaults =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'setVaults',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaEconomyManagerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateGachaEconomyManagerUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaEconomyManagerUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__
 */
export const useWatchGachaEconomyManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaEconomyManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"DepositorVaultUpdated"`
 */
export const useWatchGachaEconomyManagerDepositorVaultUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'DepositorVaultUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"DepositorYieldQueued"`
 */
export const useWatchGachaEconomyManagerDepositorYieldQueued =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'DepositorYieldQueued',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchGachaEconomyManagerFeeTokenUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'FeeTokenUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"GachaUpdated"`
 */
export const useWatchGachaEconomyManagerGachaUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'GachaUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaEconomyManagerInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaEconomyManagerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaEconomyManagerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"ProtocolTreasuryUpdated"`
 */
export const useWatchGachaEconomyManagerProtocolTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'ProtocolTreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"QueuedDepositorYieldProcessed"`
 */
export const useWatchGachaEconomyManagerQueuedDepositorYieldProcessed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'QueuedDepositorYieldProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"RevenueSplitUpdated"`
 */
export const useWatchGachaEconomyManagerRevenueSplitUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'RevenueSplitUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"SpinRevenueReceived"`
 */
export const useWatchGachaEconomyManagerSpinRevenueReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'SpinRevenueReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaEconomyManagerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaEconomyManagerUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useReadGachaServiceHandlerContract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaServiceHandlerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getGacha"`
 */
export const useReadGachaServiceHandlerGetGacha =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerAbi,
    functionName: 'getGacha',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getGachaTreasury"`
 */
export const useReadGachaServiceHandlerGetGachaTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerAbi,
    functionName: 'getGachaTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadGachaServiceHandlerGetServiceManager =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerAbi,
    functionName: 'getServiceManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useWriteGachaServiceHandlerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaServiceHandlerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteGachaServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useSimulateGachaServiceHandlerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaServiceHandlerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateGachaServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerAbi}__
 */
export const useWatchGachaServiceHandlerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaServiceHandlerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerAbi}__ and `eventName` set to `"RandomnessReceived"`
 */
export const useWatchGachaServiceHandlerRandomnessReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaServiceHandlerAbi,
    eventName: 'RandomnessReceived',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useReadGachaTreasuryContract = /*#__PURE__*/ createUseReadContract(
  { abi: gachaTreasuryAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_BATCH_DEPOSIT"`
 */
export const useReadGachaTreasuryMaxBatchDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'MAX_BATCH_DEPOSIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_BATCH_WITHDRAW"`
 */
export const useReadGachaTreasuryMaxBatchWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'MAX_BATCH_WITHDRAW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"MAX_MIGRATION_BATCH"`
 */
export const useReadGachaTreasuryMaxMigrationBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'MAX_MIGRATION_BATCH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadGachaTreasuryUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadGachaTreasuryAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'appraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"cardTotalDeposits"`
 */
export const useReadGachaTreasuryCardTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'cardTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"commonMaxPrice"`
 */
export const useReadGachaTreasuryCommonMaxPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'commonMaxPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"commonMinPrice"`
 */
export const useReadGachaTreasuryCommonMinPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'commonMinPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositedNFTs"`
 */
export const useReadGachaTreasuryDepositedNfTs =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'depositedNFTs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositorVault"`
 */
export const useReadGachaTreasuryDepositorVault =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'depositorVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"epicMaxPrice"`
 */
export const useReadGachaTreasuryEpicMaxPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'epicMaxPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"epicMinPrice"`
 */
export const useReadGachaTreasuryEpicMinPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'epicMinPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"gachaContract"`
 */
export const useReadGachaTreasuryGachaContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'gachaContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllPriceRanges"`
 */
export const useReadGachaTreasuryGetAllPriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getAllPriceRanges',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllRarityCounts"`
 */
export const useReadGachaTreasuryGetAllRarityCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getAllRarityCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllRarityTotalValues"`
 */
export const useReadGachaTreasuryGetAllRarityTotalValues =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getAllRarityTotalValues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllUserCardDeposits"`
 */
export const useReadGachaTreasuryGetAllUserCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getAllUserCardDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getCardTotalDeposits"`
 */
export const useReadGachaTreasuryGetCardTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getCardTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getGlobalStats"`
 */
export const useReadGachaTreasuryGetGlobalStats =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getGlobalStats',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTCurrentRarity"`
 */
export const useReadGachaTreasuryGetNftCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getNFTCurrentRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTReceiveTime"`
 */
export const useReadGachaTreasuryGetNftReceiveTime =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getNFTReceiveTime',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPlatformOverviewBatch"`
 */
export const useReadGachaTreasuryGetPlatformOverviewBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getPlatformOverviewBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPriceRange"`
 */
export const useReadGachaTreasuryGetPriceRange =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getPriceRange',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityByPrice"`
 */
export const useReadGachaTreasuryGetRarityByPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getRarityByPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityCount"`
 */
export const useReadGachaTreasuryGetRarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getRarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityTotalValue"`
 */
export const useReadGachaTreasuryGetRarityTotalValue =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getRarityTotalValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTotalItemsCount"`
 */
export const useReadGachaTreasuryGetTotalItemsCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getTotalItemsCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTreasuryItem"`
 */
export const useReadGachaTreasuryGetTreasuryItem =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getTreasuryItem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTreasuryItems"`
 */
export const useReadGachaTreasuryGetTreasuryItems =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getTreasuryItems',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserAllDepositCounts"`
 */
export const useReadGachaTreasuryGetUserAllDepositCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserAllDepositCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserAllDepositValues"`
 */
export const useReadGachaTreasuryGetUserAllDepositValues =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserAllDepositValues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardDepositsPage"`
 */
export const useReadGachaTreasuryGetUserCardDepositsPage =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserCardDepositsPage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardIds"`
 */
export const useReadGachaTreasuryGetUserCardIds =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserCardIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardIdsLength"`
 */
export const useReadGachaTreasuryGetUserCardIdsLength =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserCardIdsLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositCount"`
 */
export const useReadGachaTreasuryGetUserDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserDepositCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositValue"`
 */
export const useReadGachaTreasuryGetUserDepositValue =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserDepositValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositedNFTs"`
 */
export const useReadGachaTreasuryGetUserDepositedNfTs =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserDepositedNFTs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositedNFTsByCardId"`
 */
export const useReadGachaTreasuryGetUserDepositedNfTsByCardId =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserDepositedNFTsByCardId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeClaimed"`
 */
export const useReadGachaTreasuryGetUserLifetimeClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserLifetimeClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeDeposited"`
 */
export const useReadGachaTreasuryGetUserLifetimeDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserLifetimeDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeStats"`
 */
export const useReadGachaTreasuryGetUserLifetimeStats =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserLifetimeStats',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserLifetimeWithdrawn"`
 */
export const useReadGachaTreasuryGetUserLifetimeWithdrawn =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserLifetimeWithdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserProfileBatch"`
 */
export const useReadGachaTreasuryGetUserProfileBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserProfileBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserTotalDepositCount"`
 */
export const useReadGachaTreasuryGetUserTotalDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserTotalDepositCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getWhitelistLength"`
 */
export const useReadGachaTreasuryGetWhitelistLength =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getWhitelistLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getWhitelistedCollections"`
 */
export const useReadGachaTreasuryGetWhitelistedCollections =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getWhitelistedCollections',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"globalLifetimeClaimed"`
 */
export const useReadGachaTreasuryGlobalLifetimeClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'globalLifetimeClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"globalLifetimeDeposited"`
 */
export const useReadGachaTreasuryGlobalLifetimeDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'globalLifetimeDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isCollectionWhitelisted"`
 */
export const useReadGachaTreasuryIsCollectionWhitelisted =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'isCollectionWhitelisted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isGachaAvailable"`
 */
export const useReadGachaTreasuryIsGachaAvailable =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'isGachaAvailable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isNFTDeposited"`
 */
export const useReadGachaTreasuryIsNftDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'isNFTDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"legendaryMaxPrice"`
 */
export const useReadGachaTreasuryLegendaryMaxPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'legendaryMaxPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"legendaryMinPrice"`
 */
export const useReadGachaTreasuryLegendaryMinPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'legendaryMinPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftCurrentRarity"`
 */
export const useReadGachaTreasuryNftCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftCurrentRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftReceiveTimes"`
 */
export const useReadGachaTreasuryNftReceiveTimes =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftReceiveTimes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftToTreasuryIndex"`
 */
export const useReadGachaTreasuryNftToTreasuryIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftToTreasuryIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadGachaTreasuryOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaTreasuryOwner = /*#__PURE__*/ createUseReadContract({
  abi: gachaTreasuryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaTreasuryPaused = /*#__PURE__*/ createUseReadContract({
  abi: gachaTreasuryAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"priceRangesSet"`
 */
export const useReadGachaTreasuryPriceRangesSet =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'priceRangesSet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"protocolTreasury"`
 */
export const useReadGachaTreasuryProtocolTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'protocolTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadGachaTreasuryProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rareMaxPrice"`
 */
export const useReadGachaTreasuryRareMaxPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'rareMaxPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rareMinPrice"`
 */
export const useReadGachaTreasuryRareMinPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'rareMinPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rarityCount"`
 */
export const useReadGachaTreasuryRarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'rarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"totalRarityValue"`
 */
export const useReadGachaTreasuryTotalRarityValue =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'totalRarityValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasuryTreasury = /*#__PURE__*/ createUseReadContract(
  { abi: gachaTreasuryAbi, functionName: 'treasury' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"uncommonMaxPrice"`
 */
export const useReadGachaTreasuryUncommonMaxPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'uncommonMaxPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"uncommonMinPrice"`
 */
export const useReadGachaTreasuryUncommonMinPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'uncommonMinPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userActiveDepositValueUSD"`
 */
export const useReadGachaTreasuryUserActiveDepositValueUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userActiveDepositValueUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userCardDeposits"`
 */
export const useReadGachaTreasuryUserCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userCardDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userDepositCounts"`
 */
export const useReadGachaTreasuryUserDepositCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userDepositCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userDepositValues"`
 */
export const useReadGachaTreasuryUserDepositValues =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userDepositValues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeClaimed"`
 */
export const useReadGachaTreasuryUserLifetimeClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userLifetimeClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeDeposited"`
 */
export const useReadGachaTreasuryUserLifetimeDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userLifetimeDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userLifetimeWithdrawn"`
 */
export const useReadGachaTreasuryUserLifetimeWithdrawn =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userLifetimeWithdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userTotalDeposits"`
 */
export const useReadGachaTreasuryUserTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"whitelistedCollections"`
 */
export const useReadGachaTreasuryWhitelistedCollections =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'whitelistedCollections',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"whitelistedCollectionsList"`
 */
export const useReadGachaTreasuryWhitelistedCollectionsList =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'whitelistedCollectionsList',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useWriteGachaTreasuryContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaTreasuryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useWriteGachaTreasuryAddToWhitelist =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'addToWhitelist',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchDepositNFT"`
 */
export const useWriteGachaTreasuryBatchDepositNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchDepositNFT',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositNFT"`
 */
export const useWriteGachaTreasuryDepositNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'depositNFT',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaTreasuryEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaTreasuryEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"handleRedemptionReturn"`
 */
export const useWriteGachaTreasuryHandleRedemptionReturn =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'handleRedemptionReturn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteGachaTreasuryInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useWriteGachaTreasuryMigrateNftRarity =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'migrateNFTRarity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useWriteGachaTreasuryRecordYieldClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'recordYieldClaim',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useWriteGachaTreasuryRemoveFromWhitelist =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'removeFromWhitelist',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaTreasuryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendNFTToWinner"`
 */
export const useWriteGachaTreasurySendNftToWinner =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'sendNFTToWinner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendRandomNFTToWinner"`
 */
export const useWriteGachaTreasurySendRandomNftToWinner =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'sendRandomNFTToWinner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useWriteGachaTreasurySetAppraisalContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setAppraisalContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setDepositorVault"`
 */
export const useWriteGachaTreasurySetDepositorVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setDepositorVault',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useWriteGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setProtocolTreasury"`
 */
export const useWriteGachaTreasurySetProtocolTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setProtocolTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"syncDepositorValue"`
 */
export const useWriteGachaTreasurySyncDepositorValue =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'syncDepositorValue',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaTreasuryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteGachaTreasuryUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawMyNFT"`
 */
export const useWriteGachaTreasuryWithdrawMyNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'withdrawMyNFT',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useSimulateGachaTreasuryContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaTreasuryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useSimulateGachaTreasuryAddToWhitelist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'addToWhitelist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchDepositNFT"`
 */
export const useSimulateGachaTreasuryBatchDepositNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchDepositNFT',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositNFT"`
 */
export const useSimulateGachaTreasuryDepositNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'depositNFT',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaTreasuryEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaTreasuryEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"handleRedemptionReturn"`
 */
export const useSimulateGachaTreasuryHandleRedemptionReturn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'handleRedemptionReturn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateGachaTreasuryInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useSimulateGachaTreasuryMigrateNftRarity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'migrateNFTRarity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useSimulateGachaTreasuryRecordYieldClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'recordYieldClaim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useSimulateGachaTreasuryRemoveFromWhitelist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'removeFromWhitelist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaTreasuryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendNFTToWinner"`
 */
export const useSimulateGachaTreasurySendNftToWinner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'sendNFTToWinner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"sendRandomNFTToWinner"`
 */
export const useSimulateGachaTreasurySendRandomNftToWinner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'sendRandomNFTToWinner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useSimulateGachaTreasurySetAppraisalContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setAppraisalContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setDepositorVault"`
 */
export const useSimulateGachaTreasurySetDepositorVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setDepositorVault',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useSimulateGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setProtocolTreasury"`
 */
export const useSimulateGachaTreasurySetProtocolTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setProtocolTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"syncDepositorValue"`
 */
export const useSimulateGachaTreasurySyncDepositorValue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'syncDepositorValue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaTreasuryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateGachaTreasuryUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawMyNFT"`
 */
export const useSimulateGachaTreasuryWithdrawMyNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'withdrawMyNFT',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useWatchGachaTreasuryContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaTreasuryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"AppraisalContractUpdated"`
 */
export const useWatchGachaTreasuryAppraisalContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'AppraisalContractUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"BatchDeposited"`
 */
export const useWatchGachaTreasuryBatchDeposited =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'BatchDeposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"BatchWithdrawn"`
 */
export const useWatchGachaTreasuryBatchWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'BatchWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CollectionRemovedFromWhitelist"`
 */
export const useWatchGachaTreasuryCollectionRemovedFromWhitelist =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'CollectionRemovedFromWhitelist',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CollectionWhitelisted"`
 */
export const useWatchGachaTreasuryCollectionWhitelisted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'CollectionWhitelisted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"DepositorVaultUpdated"`
 */
export const useWatchGachaTreasuryDepositorVaultUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'DepositorVaultUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"GachaContractUpdated"`
 */
export const useWatchGachaTreasuryGachaContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'GachaContractUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaTreasuryInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"NFTDeposited"`
 */
export const useWatchGachaTreasuryNftDeposited =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'NFTDeposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"NFTWithdrawn"`
 */
export const useWatchGachaTreasuryNftWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'NFTWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaTreasuryOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaTreasuryPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"ProtocolTreasuryUpdated"`
 */
export const useWatchGachaTreasuryProtocolTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'ProtocolTreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RarityMigrated"`
 */
export const useWatchGachaTreasuryRarityMigrated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'RarityMigrated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RedemptionRestocked"`
 */
export const useWatchGachaTreasuryRedemptionRestocked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'RedemptionRestocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaTreasuryUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchGachaTreasuryUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iBeaconAbi}__
 */
export const useReadIBeaconContract = /*#__PURE__*/ createUseReadContract({
  abi: iBeaconAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iBeaconAbi}__ and `functionName` set to `"implementation"`
 */
export const useReadIBeaconImplementation = /*#__PURE__*/ createUseReadContract(
  { abi: iBeaconAbi, functionName: 'implementation' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iDepositorVaultAbi}__
 */
export const useReadIDepositorVaultContract =
  /*#__PURE__*/ createUseReadContract({ abi: iDepositorVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadIDepositorVaultAsset = /*#__PURE__*/ createUseReadContract({
  abi: iDepositorVaultAbi,
  functionName: 'asset',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadIDepositorVaultPendingYield =
  /*#__PURE__*/ createUseReadContract({
    abi: iDepositorVaultAbi,
    functionName: 'pendingYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadIDepositorVaultSharesOf =
  /*#__PURE__*/ createUseReadContract({
    abi: iDepositorVaultAbi,
    functionName: 'sharesOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadIDepositorVaultTotalShares =
  /*#__PURE__*/ createUseReadContract({
    abi: iDepositorVaultAbi,
    functionName: 'totalShares',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__
 */
export const useWriteIDepositorVaultContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iDepositorVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteIDepositorVaultClaimYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: iDepositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useWriteIDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: iDepositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteIDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: iDepositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useWriteIDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: iDepositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useWriteIDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: iDepositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__
 */
export const useSimulateIDepositorVaultContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iDepositorVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateIDepositorVaultClaimYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iDepositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useSimulateIDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iDepositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateIDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iDepositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useSimulateIDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iDepositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useSimulateIDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iDepositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__
 */
export const useWatchIDepositorVaultContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iDepositorVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `eventName` set to `"DepositorDeregistered"`
 */
export const useWatchIDepositorVaultDepositorDeregistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iDepositorVaultAbi,
    eventName: 'DepositorDeregistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `eventName` set to `"DepositorRegistered"`
 */
export const useWatchIDepositorVaultDepositorRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iDepositorVaultAbi,
    eventName: 'DepositorRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `eventName` set to `"DepositorUpdated"`
 */
export const useWatchIDepositorVaultDepositorUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iDepositorVaultAbi,
    eventName: 'DepositorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchIDepositorVaultYieldClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iDepositorVaultAbi,
    eventName: 'YieldClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iDepositorVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchIDepositorVaultYieldDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iDepositorVaultAbi,
    eventName: 'YieldDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useReadIerc1363Contract = /*#__PURE__*/ createUseReadContract({
  abi: ierc1363Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadIerc1363Allowance = /*#__PURE__*/ createUseReadContract({
  abi: ierc1363Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc1363BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ierc1363Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc1363SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc1363Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc1363TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ierc1363Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useWriteIerc1363Contract = /*#__PURE__*/ createUseWriteContract({
  abi: ierc1363Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc1363Approve = /*#__PURE__*/ createUseWriteContract({
  abi: ierc1363Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approveAndCall"`
 */
export const useWriteIerc1363ApproveAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc1363Abi,
    functionName: 'approveAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIerc1363Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: ierc1363Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferAndCall"`
 */
export const useWriteIerc1363TransferAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc1363Abi,
    functionName: 'transferAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc1363TransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc1363Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFromAndCall"`
 */
export const useWriteIerc1363TransferFromAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc1363Abi,
    functionName: 'transferFromAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useSimulateIerc1363Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc1363Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc1363Approve =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"approveAndCall"`
 */
export const useSimulateIerc1363ApproveAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'approveAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIerc1363Transfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferAndCall"`
 */
export const useSimulateIerc1363TransferAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'transferAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc1363TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc1363Abi}__ and `functionName` set to `"transferFromAndCall"`
 */
export const useSimulateIerc1363TransferFromAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc1363Abi,
    functionName: 'transferFromAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__
 */
export const useWatchIerc1363Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc1363Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc1363Approval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc1363Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1363Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc1363Transfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc1363Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1822ProxiableAbi}__
 */
export const useReadIerc1822ProxiableContract =
  /*#__PURE__*/ createUseReadContract({ abi: ierc1822ProxiableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc1822ProxiableAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadIerc1822ProxiableProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc1822ProxiableAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__
 */
export const useWatchIerc1967Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc1967Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"AdminChanged"`
 */
export const useWatchIerc1967AdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc1967Abi,
    eventName: 'AdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"BeaconUpgraded"`
 */
export const useWatchIerc1967BeaconUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc1967Abi,
    eventName: 'BeaconUpgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc1967Abi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchIerc1967Upgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc1967Abi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useReadIerc20MetadataContract =
  /*#__PURE__*/ createUseReadContract({ abi: ierc20MetadataAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadIerc20MetadataAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc20MetadataAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc20MetadataBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc20MetadataAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadIerc20MetadataDecimals =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc20MetadataAbi,
    functionName: 'decimals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"name"`
 */
export const useReadIerc20MetadataName = /*#__PURE__*/ createUseReadContract({
  abi: ierc20MetadataAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIerc20MetadataSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ierc20MetadataAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc20MetadataTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc20MetadataAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useWriteIerc20MetadataContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ierc20MetadataAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc20MetadataApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc20MetadataAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteIerc20MetadataTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc20MetadataAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc20MetadataTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc20MetadataAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useSimulateIerc20MetadataContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc20MetadataAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc20MetadataApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc20MetadataAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateIerc20MetadataTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc20MetadataAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc20MetadataTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc20MetadataAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__
 */
export const useWatchIerc20MetadataContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc20MetadataAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc20MetadataApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc20MetadataAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20MetadataAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc20MetadataTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc20MetadataAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useReadIerc20PermitContract = /*#__PURE__*/ createUseReadContract({
  abi: ierc20PermitAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadIerc20PermitDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc20PermitAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadIerc20PermitNonces = /*#__PURE__*/ createUseReadContract({
  abi: ierc20PermitAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useWriteIerc20PermitContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ierc20PermitAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteIerc20PermitPermit = /*#__PURE__*/ createUseWriteContract({
  abi: ierc20PermitAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20PermitAbi}__
 */
export const useSimulateIerc20PermitContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc20PermitAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc20PermitAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateIerc20PermitPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc20PermitAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc5267Abi}__
 */
export const useReadIerc5267Contract = /*#__PURE__*/ createUseReadContract({
  abi: ierc5267Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc5267Abi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadIerc5267Eip712Domain = /*#__PURE__*/ createUseReadContract({
  abi: ierc5267Abi,
  functionName: 'eip712Domain',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc5267Abi}__
 */
export const useWatchIerc5267Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc5267Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc5267Abi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchIerc5267Eip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc5267Abi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useReadIerc721EnumerableContract =
  /*#__PURE__*/ createUseReadContract({ abi: ierc721EnumerableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc721EnumerableBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIerc721EnumerableGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIerc721EnumerableIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIerc721EnumerableOwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc721EnumerableSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadIerc721EnumerableTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadIerc721EnumerableTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadIerc721EnumerableTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721EnumerableAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useWriteIerc721EnumerableContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ierc721EnumerableAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc721EnumerableApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721EnumerableAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIerc721EnumerableSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721EnumerableAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIerc721EnumerableSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721EnumerableAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc721EnumerableTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721EnumerableAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useSimulateIerc721EnumerableContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc721EnumerableAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc721EnumerableApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721EnumerableAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIerc721EnumerableSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721EnumerableAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIerc721EnumerableSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721EnumerableAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc721EnumerableTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721EnumerableAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__
 */
export const useWatchIerc721EnumerableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc721EnumerableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc721EnumerableApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721EnumerableAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIerc721EnumerableApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721EnumerableAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721EnumerableAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc721EnumerableTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721EnumerableAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useReadIerc721MetadataContract =
  /*#__PURE__*/ createUseReadContract({ abi: ierc721MetadataAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIerc721MetadataBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadIerc721MetadataGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadIerc721MetadataIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"name"`
 */
export const useReadIerc721MetadataName = /*#__PURE__*/ createUseReadContract({
  abi: ierc721MetadataAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadIerc721MetadataOwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadIerc721MetadataSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadIerc721MetadataSymbol = /*#__PURE__*/ createUseReadContract(
  { abi: ierc721MetadataAbi, functionName: 'symbol' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadIerc721MetadataTokenUri =
  /*#__PURE__*/ createUseReadContract({
    abi: ierc721MetadataAbi,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useWriteIerc721MetadataContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ierc721MetadataAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteIerc721MetadataApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721MetadataAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteIerc721MetadataSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721MetadataAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteIerc721MetadataSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721MetadataAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteIerc721MetadataTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721MetadataAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useSimulateIerc721MetadataContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc721MetadataAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateIerc721MetadataApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721MetadataAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateIerc721MetadataSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721MetadataAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateIerc721MetadataSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721MetadataAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateIerc721MetadataTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721MetadataAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__
 */
export const useWatchIerc721MetadataContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc721MetadataAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchIerc721MetadataApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721MetadataAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchIerc721MetadataApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721MetadataAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc721MetadataAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc721MetadataTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc721MetadataAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__
 */
export const useWriteIerc721ReceiverContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ierc721ReceiverAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useWriteIerc721ReceiverOnErc721Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: ierc721ReceiverAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__
 */
export const useSimulateIerc721ReceiverContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ierc721ReceiverAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ierc721ReceiverAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useSimulateIerc721ReceiverOnErc721Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ierc721ReceiverAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useReadIFundsDistributionTokenContract =
  /*#__PURE__*/ createUseReadContract({ abi: iFundsDistributionTokenAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawableFundsOf"`
 */
export const useReadIFundsDistributionTokenWithdrawableFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: iFundsDistributionTokenAbi,
    functionName: 'withdrawableFundsOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useWriteIFundsDistributionTokenContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iFundsDistributionTokenAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useWriteIFundsDistributionTokenWithdrawFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: iFundsDistributionTokenAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useSimulateIFundsDistributionTokenContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iFundsDistributionTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useSimulateIFundsDistributionTokenWithdrawFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iFundsDistributionTokenAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__
 */
export const useWatchIFundsDistributionTokenContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iFundsDistributionTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `eventName` set to `"FundsDistributed"`
 */
export const useWatchIFundsDistributionTokenFundsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iFundsDistributionTokenAbi,
    eventName: 'FundsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iFundsDistributionTokenAbi}__ and `eventName` set to `"FundsWithdrawn"`
 */
export const useWatchIFundsDistributionTokenFundsWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iFundsDistributionTokenAbi,
    eventName: 'FundsWithdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useReadIGachaContract = /*#__PURE__*/ createUseReadContract({
  abi: iGachaAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadIGachaFeeToken = /*#__PURE__*/ createUseReadContract({
  abi: iGachaAbi,
  functionName: 'feeToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getCurrentRarityWeights"`
 */
export const useReadIGachaGetCurrentRarityWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaAbi,
    functionName: 'getCurrentRarityWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getCurrentSpinFee"`
 */
export const useReadIGachaGetCurrentSpinFee =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaAbi,
    functionName: 'getCurrentSpinFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getExpectedValueUSD"`
 */
export const useReadIGachaGetExpectedValueUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaAbi,
    functionName: 'getExpectedValueUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"getTargetRarityBps"`
 */
export const useReadIGachaGetTargetRarityBps =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaAbi,
    functionName: 'getTargetRarityBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useWriteIGachaContract = /*#__PURE__*/ createUseWriteContract({
  abi: iGachaAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useWriteIGachaFulfillRandomness =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useWriteIGachaSetDynamicWeightsConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'setDynamicWeightsConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useWriteIGachaSetFeeTokenDecimals =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'setFeeTokenDecimals',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useWriteIGachaSetGachaServiceHandler =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useWriteIGachaSetPricingConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'setPricingConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spin"`
 */
export const useWriteIGachaSpin = /*#__PURE__*/ createUseWriteContract({
  abi: iGachaAbi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useWriteIGachaSpinWithPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaAbi,
    functionName: 'spinWithPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__
 */
export const useSimulateIGachaContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iGachaAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useSimulateIGachaFulfillRandomness =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setDynamicWeightsConfig"`
 */
export const useSimulateIGachaSetDynamicWeightsConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'setDynamicWeightsConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setFeeTokenDecimals"`
 */
export const useSimulateIGachaSetFeeTokenDecimals =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'setFeeTokenDecimals',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useSimulateIGachaSetGachaServiceHandler =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"setPricingConfig"`
 */
export const useSimulateIGachaSetPricingConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'setPricingConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spin"`
 */
export const useSimulateIGachaSpin = /*#__PURE__*/ createUseSimulateContract({
  abi: iGachaAbi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaAbi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useSimulateIGachaSpinWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaAbi,
    functionName: 'spinWithPermit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useReadIGachaEconomyManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: iGachaEconomyManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"depositorShareBps"`
 */
export const useReadIGachaEconomyManagerDepositorShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaEconomyManagerAbi,
    functionName: 'depositorShareBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"protocolShareBps"`
 */
export const useReadIGachaEconomyManagerProtocolShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaEconomyManagerAbi,
    functionName: 'protocolShareBps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useWriteIGachaEconomyManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iGachaEconomyManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useWriteIGachaEconomyManagerOnSpinRevenue =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaEconomyManagerAbi,
    functionName: 'onSpinRevenue',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useSimulateIGachaEconomyManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iGachaEconomyManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `functionName` set to `"onSpinRevenue"`
 */
export const useSimulateIGachaEconomyManagerOnSpinRevenue =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaEconomyManagerAbi,
    functionName: 'onSpinRevenue',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__
 */
export const useWatchIGachaEconomyManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iGachaEconomyManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `eventName` set to `"RevenueSplitUpdated"`
 */
export const useWatchIGachaEconomyManagerRevenueSplitUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iGachaEconomyManagerAbi,
    eventName: 'RevenueSplitUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iGachaEconomyManagerAbi}__ and `eventName` set to `"SpinRevenueReceived"`
 */
export const useWatchIGachaEconomyManagerSpinRevenueReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iGachaEconomyManagerAbi,
    eventName: 'SpinRevenueReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__
 */
export const useWriteIGachaTreasuryYieldTrackerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iGachaTreasuryYieldTrackerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useWriteIGachaTreasuryYieldTrackerRecordYieldClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaTreasuryYieldTrackerAbi,
    functionName: 'recordYieldClaim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__
 */
export const useSimulateIGachaTreasuryYieldTrackerContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaTreasuryYieldTrackerAbi,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaTreasuryYieldTrackerAbi}__ and `functionName` set to `"recordYieldClaim"`
 */
export const useSimulateIGachaTreasuryYieldTrackerRecordYieldClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaTreasuryYieldTrackerAbi,
    functionName: 'recordYieldClaim',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useReadIMulticall3Contract = /*#__PURE__*/ createUseReadContract({
  abi: iMulticall3Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBasefee"`
 */
export const useReadIMulticall3GetBasefee = /*#__PURE__*/ createUseReadContract(
  { abi: iMulticall3Abi, functionName: 'getBasefee' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBlockHash"`
 */
export const useReadIMulticall3GetBlockHash =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getBlockHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getBlockNumber"`
 */
export const useReadIMulticall3GetBlockNumber =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getBlockNumber',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getChainId"`
 */
export const useReadIMulticall3GetChainId = /*#__PURE__*/ createUseReadContract(
  { abi: iMulticall3Abi, functionName: 'getChainId' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockCoinbase"`
 */
export const useReadIMulticall3GetCurrentBlockCoinbase =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getCurrentBlockCoinbase',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockDifficulty"`
 */
export const useReadIMulticall3GetCurrentBlockDifficulty =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getCurrentBlockDifficulty',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockGasLimit"`
 */
export const useReadIMulticall3GetCurrentBlockGasLimit =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getCurrentBlockGasLimit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getCurrentBlockTimestamp"`
 */
export const useReadIMulticall3GetCurrentBlockTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getCurrentBlockTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getEthBalance"`
 */
export const useReadIMulticall3GetEthBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getEthBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"getLastBlockHash"`
 */
export const useReadIMulticall3GetLastBlockHash =
  /*#__PURE__*/ createUseReadContract({
    abi: iMulticall3Abi,
    functionName: 'getLastBlockHash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useWriteIMulticall3Contract = /*#__PURE__*/ createUseWriteContract(
  { abi: iMulticall3Abi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate"`
 */
export const useWriteIMulticall3Aggregate =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3"`
 */
export const useWriteIMulticall3Aggregate3 =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate3',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3Value"`
 */
export const useWriteIMulticall3Aggregate3Value =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate3Value',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"blockAndAggregate"`
 */
export const useWriteIMulticall3BlockAndAggregate =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'blockAndAggregate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryAggregate"`
 */
export const useWriteIMulticall3TryAggregate =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'tryAggregate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryBlockAndAggregate"`
 */
export const useWriteIMulticall3TryBlockAndAggregate =
  /*#__PURE__*/ createUseWriteContract({
    abi: iMulticall3Abi,
    functionName: 'tryBlockAndAggregate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__
 */
export const useSimulateIMulticall3Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iMulticall3Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate"`
 */
export const useSimulateIMulticall3Aggregate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3"`
 */
export const useSimulateIMulticall3Aggregate3 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate3',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"aggregate3Value"`
 */
export const useSimulateIMulticall3Aggregate3Value =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'aggregate3Value',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"blockAndAggregate"`
 */
export const useSimulateIMulticall3BlockAndAggregate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'blockAndAggregate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryAggregate"`
 */
export const useSimulateIMulticall3TryAggregate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'tryAggregate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iMulticall3Abi}__ and `functionName` set to `"tryBlockAndAggregate"`
 */
export const useSimulateIMulticall3TryBlockAndAggregate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iMulticall3Abi,
    functionName: 'tryBlockAndAggregate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useReadIProtocolTreasuryContract =
  /*#__PURE__*/ createUseReadContract({ abi: iProtocolTreasuryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"asset"`
 */
export const useReadIProtocolTreasuryAsset =
  /*#__PURE__*/ createUseReadContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'asset',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useWriteIProtocolTreasuryContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iProtocolTreasuryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useWriteIProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseWriteContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useWriteIProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useWriteIProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseWriteContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useSimulateIProtocolTreasuryContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iProtocolTreasuryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useSimulateIProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useSimulateIProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useSimulateIProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iProtocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__
 */
export const useWatchIProtocolTreasuryContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iProtocolTreasuryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolRevenueReceived"`
 */
export const useWatchIProtocolTreasuryProtocolRevenueReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iProtocolTreasuryAbi,
    eventName: 'ProtocolRevenueReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolTransfer"`
 */
export const useWatchIProtocolTreasuryProtocolTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iProtocolTreasuryAbi,
    eventName: 'ProtocolTransfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iProtocolTreasuryAbi}__ and `eventName` set to `"RedemptionExecuted"`
 */
export const useWatchIProtocolTreasuryRedemptionExecuted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iProtocolTreasuryAbi,
    eventName: 'RedemptionExecuted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useReadIWavsServiceHandlerContract =
  /*#__PURE__*/ createUseReadContract({ abi: iWavsServiceHandlerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadIWavsServiceHandlerGetServiceManager =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceHandlerAbi,
    functionName: 'getServiceManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useWriteIWavsServiceHandlerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iWavsServiceHandlerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteIWavsServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseWriteContract({
    abi: iWavsServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__
 */
export const useSimulateIWavsServiceHandlerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iWavsServiceHandlerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateIWavsServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iWavsServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useReadIWavsServiceManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: iWavsServiceManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getAllocationManager"`
 */
export const useReadIWavsServiceManagerGetAllocationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getAllocationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getDelegationManager"`
 */
export const useReadIWavsServiceManagerGetDelegationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getDelegationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getLatestOperatorForSigningKey"`
 */
export const useReadIWavsServiceManagerGetLatestOperatorForSigningKey =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getLatestOperatorForSigningKey',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getOperatorWeight"`
 */
export const useReadIWavsServiceManagerGetOperatorWeight =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getOperatorWeight',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getServiceURI"`
 */
export const useReadIWavsServiceManagerGetServiceUri =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getServiceURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"getStakeRegistry"`
 */
export const useReadIWavsServiceManagerGetStakeRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'getStakeRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"validate"`
 */
export const useReadIWavsServiceManagerValidate =
  /*#__PURE__*/ createUseReadContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'validate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useWriteIWavsServiceManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iWavsServiceManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useWriteIWavsServiceManagerSetServiceUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'setServiceURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useSimulateIWavsServiceManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iWavsServiceManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useSimulateIWavsServiceManagerSetServiceUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iWavsServiceManagerAbi,
    functionName: 'setServiceURI',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__
 */
export const useWatchIWavsServiceManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iWavsServiceManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `eventName` set to `"QuorumThresholdUpdated"`
 */
export const useWatchIWavsServiceManagerQuorumThresholdUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iWavsServiceManagerAbi,
    eventName: 'QuorumThresholdUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iWavsServiceManagerAbi}__ and `eventName` set to `"ServiceURIUpdated"`
 */
export const useWatchIWavsServiceManagerServiceUriUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iWavsServiceManagerAbi,
    eventName: 'ServiceURIUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link initializableAbi}__
 */
export const useWatchInitializableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: initializableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link initializableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchInitializableInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: initializableAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__
 */
export const useReadMockDepositorVaultContract =
  /*#__PURE__*/ createUseReadContract({ abi: mockDepositorVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadMockDepositorVaultAsset =
  /*#__PURE__*/ createUseReadContract({
    abi: mockDepositorVaultAbi,
    functionName: 'asset',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadMockDepositorVaultPendingYield =
  /*#__PURE__*/ createUseReadContract({
    abi: mockDepositorVaultAbi,
    functionName: 'pendingYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"shares"`
 */
export const useReadMockDepositorVaultShares =
  /*#__PURE__*/ createUseReadContract({
    abi: mockDepositorVaultAbi,
    functionName: 'shares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadMockDepositorVaultSharesOf =
  /*#__PURE__*/ createUseReadContract({
    abi: mockDepositorVaultAbi,
    functionName: 'sharesOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadMockDepositorVaultTotalShares =
  /*#__PURE__*/ createUseReadContract({
    abi: mockDepositorVaultAbi,
    functionName: 'totalShares',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__
 */
export const useWriteMockDepositorVaultContract =
  /*#__PURE__*/ createUseWriteContract({ abi: mockDepositorVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteMockDepositorVaultClaimYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockDepositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useWriteMockDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockDepositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteMockDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockDepositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useWriteMockDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockDepositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useWriteMockDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockDepositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__
 */
export const useSimulateMockDepositorVaultContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: mockDepositorVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateMockDepositorVaultClaimYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockDepositorVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"deregisterDepositor"`
 */
export const useSimulateMockDepositorVaultDeregisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockDepositorVaultAbi,
    functionName: 'deregisterDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateMockDepositorVaultDistributeYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockDepositorVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"registerDepositor"`
 */
export const useSimulateMockDepositorVaultRegisterDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockDepositorVaultAbi,
    functionName: 'registerDepositor',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `functionName` set to `"updateDepositor"`
 */
export const useSimulateMockDepositorVaultUpdateDepositor =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockDepositorVaultAbi,
    functionName: 'updateDepositor',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__
 */
export const useWatchMockDepositorVaultContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: mockDepositorVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `eventName` set to `"DepositorDeregistered"`
 */
export const useWatchMockDepositorVaultDepositorDeregistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockDepositorVaultAbi,
    eventName: 'DepositorDeregistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `eventName` set to `"DepositorRegistered"`
 */
export const useWatchMockDepositorVaultDepositorRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockDepositorVaultAbi,
    eventName: 'DepositorRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `eventName` set to `"DepositorUpdated"`
 */
export const useWatchMockDepositorVaultDepositorUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockDepositorVaultAbi,
    eventName: 'DepositorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchMockDepositorVaultYieldClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockDepositorVaultAbi,
    eventName: 'YieldClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockDepositorVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchMockDepositorVaultYieldDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockDepositorVaultAbi,
    eventName: 'YieldDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__
 */
export const useReadMockNftAppraisalContract =
  /*#__PURE__*/ createUseReadContract({ abi: mockNftAppraisalAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"appraisalStatuses"`
 */
export const useReadMockNftAppraisalAppraisalStatuses =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'appraisalStatuses',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"cardAppraisals"`
 */
export const useReadMockNftAppraisalCardAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'cardAppraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"getAppraisedPrice"`
 */
export const useReadMockNftAppraisalGetAppraisedPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'getAppraisedPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"getCardAppraisal"`
 */
export const useReadMockNftAppraisalGetCardAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'getCardAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"getCardInstance"`
 */
export const useReadMockNftAppraisalGetCardInstance =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'getCardInstance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"getCardInstances"`
 */
export const useReadMockNftAppraisalGetCardInstances =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'getCardInstances',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"getTokenCardId"`
 */
export const useReadMockNftAppraisalGetTokenCardId =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'getTokenCardId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"hasAppraisal"`
 */
export const useReadMockNftAppraisalHasAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'hasAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"tokenCardIds"`
 */
export const useReadMockNftAppraisalTokenCardIds =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'tokenCardIds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__
 */
export const useWriteMockNftAppraisalContract =
  /*#__PURE__*/ createUseWriteContract({ abi: mockNftAppraisalAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setMockAppraisal"`
 */
export const useWriteMockNftAppraisalSetMockAppraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setMockAppraisal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setMockAppraisalWithCardId"`
 */
export const useWriteMockNftAppraisalSetMockAppraisalWithCardId =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setMockAppraisalWithCardId',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setTokenCardId"`
 */
export const useWriteMockNftAppraisalSetTokenCardId =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setTokenCardId',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__
 */
export const useSimulateMockNftAppraisalContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: mockNftAppraisalAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setMockAppraisal"`
 */
export const useSimulateMockNftAppraisalSetMockAppraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setMockAppraisal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setMockAppraisalWithCardId"`
 */
export const useSimulateMockNftAppraisalSetMockAppraisalWithCardId =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setMockAppraisalWithCardId',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"setTokenCardId"`
 */
export const useSimulateMockNftAppraisalSetTokenCardId =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockNftAppraisalAbi,
    functionName: 'setTokenCardId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__
 */
export const useReadMockProtocolTreasuryContract =
  /*#__PURE__*/ createUseReadContract({ abi: mockProtocolTreasuryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"asset"`
 */
export const useReadMockProtocolTreasuryAsset =
  /*#__PURE__*/ createUseReadContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'asset',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMockProtocolTreasuryOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__
 */
export const useWriteMockProtocolTreasuryContract =
  /*#__PURE__*/ createUseWriteContract({ abi: mockProtocolTreasuryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useWriteMockProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useWriteMockProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"setAsset"`
 */
export const useWriteMockProtocolTreasurySetAsset =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'setAsset',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useWriteMockProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__
 */
export const useSimulateMockProtocolTreasuryContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: mockProtocolTreasuryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useSimulateMockProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useSimulateMockProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"setAsset"`
 */
export const useSimulateMockProtocolTreasurySetAsset =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'setAsset',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useSimulateMockProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockProtocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__
 */
export const useWatchMockProtocolTreasuryContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: mockProtocolTreasuryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolRevenueReceived"`
 */
export const useWatchMockProtocolTreasuryProtocolRevenueReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockProtocolTreasuryAbi,
    eventName: 'ProtocolRevenueReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `eventName` set to `"ProtocolTransfer"`
 */
export const useWatchMockProtocolTreasuryProtocolTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockProtocolTreasuryAbi,
    eventName: 'ProtocolTransfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockProtocolTreasuryAbi}__ and `eventName` set to `"RedemptionExecuted"`
 */
export const useWatchMockProtocolTreasuryRedemptionExecuted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockProtocolTreasuryAbi,
    eventName: 'RedemptionExecuted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__
 */
export const useReadMockWavsServiceManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: mockWavsServiceManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getAllocationManager"`
 */
export const useReadMockWavsServiceManagerGetAllocationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getAllocationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getDelegationManager"`
 */
export const useReadMockWavsServiceManagerGetDelegationManager =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getDelegationManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getLatestOperatorForSigningKey"`
 */
export const useReadMockWavsServiceManagerGetLatestOperatorForSigningKey =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getLatestOperatorForSigningKey',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getOperatorWeight"`
 */
export const useReadMockWavsServiceManagerGetOperatorWeight =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getOperatorWeight',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getServiceURI"`
 */
export const useReadMockWavsServiceManagerGetServiceUri =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getServiceURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"getStakeRegistry"`
 */
export const useReadMockWavsServiceManagerGetStakeRegistry =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'getStakeRegistry',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"shouldRevert"`
 */
export const useReadMockWavsServiceManagerShouldRevert =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'shouldRevert',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"validate"`
 */
export const useReadMockWavsServiceManagerValidate =
  /*#__PURE__*/ createUseReadContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'validate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__
 */
export const useWriteMockWavsServiceManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: mockWavsServiceManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setMockServiceURI"`
 */
export const useWriteMockWavsServiceManagerSetMockServiceUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setMockServiceURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setOperatorWeight"`
 */
export const useWriteMockWavsServiceManagerSetOperatorWeight =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setOperatorWeight',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useWriteMockWavsServiceManagerSetServiceUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setServiceURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setShouldRevert"`
 */
export const useWriteMockWavsServiceManagerSetShouldRevert =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setShouldRevert',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__
 */
export const useSimulateMockWavsServiceManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: mockWavsServiceManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setMockServiceURI"`
 */
export const useSimulateMockWavsServiceManagerSetMockServiceUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setMockServiceURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setOperatorWeight"`
 */
export const useSimulateMockWavsServiceManagerSetOperatorWeight =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setOperatorWeight',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setServiceURI"`
 */
export const useSimulateMockWavsServiceManagerSetServiceUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setServiceURI',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `functionName` set to `"setShouldRevert"`
 */
export const useSimulateMockWavsServiceManagerSetShouldRevert =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockWavsServiceManagerAbi,
    functionName: 'setShouldRevert',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__
 */
export const useWatchMockWavsServiceManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: mockWavsServiceManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `eventName` set to `"QuorumThresholdUpdated"`
 */
export const useWatchMockWavsServiceManagerQuorumThresholdUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockWavsServiceManagerAbi,
    eventName: 'QuorumThresholdUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockWavsServiceManagerAbi}__ and `eventName` set to `"ServiceURIUpdated"`
 */
export const useWatchMockWavsServiceManagerServiceUriUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockWavsServiceManagerAbi,
    eventName: 'ServiceURIUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useReadNftAppraisalContract = /*#__PURE__*/ createUseReadContract({
  abi: nftAppraisalAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadNftAppraisalUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"appraisalFee"`
 */
export const useReadNftAppraisalAppraisalFee =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'appraisalFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"cardAppraisals"`
 */
export const useReadNftAppraisalCardAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'cardAppraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadNftAppraisalFeeToken = /*#__PURE__*/ createUseReadContract({
  abi: nftAppraisalAbi,
  functionName: 'feeToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getAppraisal"`
 */
export const useReadNftAppraisalGetAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getAppraisedPrice"`
 */
export const useReadNftAppraisalGetAppraisedPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getAppraisedPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getBatchAppraisals"`
 */
export const useReadNftAppraisalGetBatchAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getBatchAppraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardAppraisal"`
 */
export const useReadNftAppraisalGetCardAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getCardAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardAppraisals"`
 */
export const useReadNftAppraisalGetCardAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getCardAppraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardInstance"`
 */
export const useReadNftAppraisalGetCardInstance =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getCardInstance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getCardInstances"`
 */
export const useReadNftAppraisalGetCardInstances =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getCardInstances',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getServiceHandler"`
 */
export const useReadNftAppraisalGetServiceHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getServiceHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getTokenCardId"`
 */
export const useReadNftAppraisalGetTokenCardId =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getTokenCardId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getWhitelistedTreasuries"`
 */
export const useReadNftAppraisalGetWhitelistedTreasuries =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getWhitelistedTreasuries',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"hasAppraisal"`
 */
export const useReadNftAppraisalHasAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'hasAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"hasBatchAppraisals"`
 */
export const useReadNftAppraisalHasBatchAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'hasBatchAppraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"isServiceHandler"`
 */
export const useReadNftAppraisalIsServiceHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'isServiceHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"isTreasuryWhitelisted"`
 */
export const useReadNftAppraisalIsTreasuryWhitelisted =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'isTreasuryWhitelisted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"owner"`
 */
export const useReadNftAppraisalOwner = /*#__PURE__*/ createUseReadContract({
  abi: nftAppraisalAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"paused"`
 */
export const useReadNftAppraisalPaused = /*#__PURE__*/ createUseReadContract({
  abi: nftAppraisalAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"protocolAddress"`
 */
export const useReadNftAppraisalProtocolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'protocolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadNftAppraisalProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"serviceHandler"`
 */
export const useReadNftAppraisalServiceHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'serviceHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"tokenCardIds"`
 */
export const useReadNftAppraisalTokenCardIds =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'tokenCardIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"tokenRequests"`
 */
export const useReadNftAppraisalTokenRequests =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'tokenRequests',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"treasuryList"`
 */
export const useReadNftAppraisalTreasuryList =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'treasuryList',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistedTreasuries"`
 */
export const useReadNftAppraisalWhitelistedTreasuries =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'whitelistedTreasuries',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useWriteNftAppraisalContract =
  /*#__PURE__*/ createUseWriteContract({ abi: nftAppraisalAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteNftAppraisalEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteNftAppraisalEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteNftAppraisalInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerBatchSetAppraisalForTokensWithCards"`
 */
export const useWriteNftAppraisalOwnerBatchSetAppraisalForTokensWithCards =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'ownerBatchSetAppraisalForTokensWithCards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerSetAppraisalForTokenWithCard"`
 */
export const useWriteNftAppraisalOwnerSetAppraisalForTokenWithCard =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'ownerSetAppraisalForTokenWithCard',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteNftAppraisalRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestAppraisal"`
 */
export const useWriteNftAppraisalRequestAppraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'requestAppraisal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestBatchAppraisal"`
 */
export const useWriteNftAppraisalRequestBatchAppraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'requestBatchAppraisal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalFee"`
 */
export const useWriteNftAppraisalSetAppraisalFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisalFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalForTokenWithCard"`
 */
export const useWriteNftAppraisalSetAppraisalForTokenWithCard =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisalForTokenWithCard',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteNftAppraisalSetFeeToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setFeeToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useWriteNftAppraisalSetProtocolAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setServiceHandler"`
 */
export const useWriteNftAppraisalSetServiceHandler =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setServiceHandler',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteNftAppraisalTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"unwhitelistTreasury"`
 */
export const useWriteNftAppraisalUnwhitelistTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'unwhitelistTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteNftAppraisalUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistTreasury"`
 */
export const useWriteNftAppraisalWhitelistTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'whitelistTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useSimulateNftAppraisalContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: nftAppraisalAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateNftAppraisalEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateNftAppraisalEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateNftAppraisalInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerBatchSetAppraisalForTokensWithCards"`
 */
export const useSimulateNftAppraisalOwnerBatchSetAppraisalForTokensWithCards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'ownerBatchSetAppraisalForTokensWithCards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"ownerSetAppraisalForTokenWithCard"`
 */
export const useSimulateNftAppraisalOwnerSetAppraisalForTokenWithCard =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'ownerSetAppraisalForTokenWithCard',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateNftAppraisalRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestAppraisal"`
 */
export const useSimulateNftAppraisalRequestAppraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'requestAppraisal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"requestBatchAppraisal"`
 */
export const useSimulateNftAppraisalRequestBatchAppraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'requestBatchAppraisal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalFee"`
 */
export const useSimulateNftAppraisalSetAppraisalFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisalFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisalForTokenWithCard"`
 */
export const useSimulateNftAppraisalSetAppraisalForTokenWithCard =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisalForTokenWithCard',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateNftAppraisalSetFeeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setFeeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useSimulateNftAppraisalSetProtocolAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setServiceHandler"`
 */
export const useSimulateNftAppraisalSetServiceHandler =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setServiceHandler',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateNftAppraisalTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"unwhitelistTreasury"`
 */
export const useSimulateNftAppraisalUnwhitelistTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'unwhitelistTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateNftAppraisalUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"whitelistTreasury"`
 */
export const useSimulateNftAppraisalWhitelistTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'whitelistTreasury',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useWatchNftAppraisalContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: nftAppraisalAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalCompleted"`
 */
export const useWatchNftAppraisalAppraisalCompleted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AppraisalCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalFeeUpdated"`
 */
export const useWatchNftAppraisalAppraisalFeeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AppraisalFeeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalOverridden"`
 */
export const useWatchNftAppraisalAppraisalOverridden =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AppraisalOverridden',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalRequested"`
 */
export const useWatchNftAppraisalAppraisalRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AppraisalRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AppraisalStatusChanged"`
 */
export const useWatchNftAppraisalAppraisalStatusChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AppraisalStatusChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AutoMigrationTriggered"`
 */
export const useWatchNftAppraisalAutoMigrationTriggered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AutoMigrationTriggered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"CardAppraisalCompleted"`
 */
export const useWatchNftAppraisalCardAppraisalCompleted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'CardAppraisalCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"CardPriceUpdated"`
 */
export const useWatchNftAppraisalCardPriceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'CardPriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchNftAppraisalFeeTokenUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'FeeTokenUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchNftAppraisalInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchNftAppraisalOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchNftAppraisalPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"PriceUpdated"`
 */
export const useWatchNftAppraisalPriceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'PriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"ProtocolAddressUpdated"`
 */
export const useWatchNftAppraisalProtocolAddressUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'ProtocolAddressUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"ServiceHandlerUpdated"`
 */
export const useWatchNftAppraisalServiceHandlerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'ServiceHandlerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TokenLinkedToCard"`
 */
export const useWatchNftAppraisalTokenLinkedToCard =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'TokenLinkedToCard',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TreasuryUnwhitelisted"`
 */
export const useWatchNftAppraisalTreasuryUnwhitelisted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'TreasuryUnwhitelisted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"TreasuryWhitelisted"`
 */
export const useWatchNftAppraisalTreasuryWhitelisted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'TreasuryWhitelisted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchNftAppraisalUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchNftAppraisalUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useReadNftAppraisalServiceHandlerContract =
  /*#__PURE__*/ createUseReadContract({ abi: nftAppraisalServiceHandlerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"_decodeError"`
 */
export const useReadNftAppraisalServiceHandlerDecodeError =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: '_decodeError',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"_decodeSuccess"`
 */
export const useReadNftAppraisalServiceHandlerDecodeSuccess =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: '_decodeSuccess',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"checkAppraisal"`
 */
export const useReadNftAppraisalServiceHandlerCheckAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'checkAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"getAppraisalContract"`
 */
export const useReadNftAppraisalServiceHandlerGetAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'getAppraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadNftAppraisalServiceHandlerGetServiceManager =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'getServiceManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useWriteNftAppraisalServiceHandlerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: nftAppraisalServiceHandlerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteNftAppraisalServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useSimulateNftAppraisalServiceHandlerContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalServiceHandlerAbi,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateNftAppraisalServiceHandlerHandleSignedEnvelope =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__
 */
export const useWatchNftAppraisalServiceHandlerContract =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalErrorReceived"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalErrorReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'AppraisalErrorReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalProcessed"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalProcessed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'AppraisalProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalSuccessReceived"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalSuccessReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'AppraisalSuccessReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"ServiceHandlerStatusUpdate"`
 */
export const useWatchNftAppraisalServiceHandlerServiceHandlerStatusUpdate =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'ServiceHandlerStatusUpdate',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link noncesAbi}__
 */
export const useReadNoncesContract = /*#__PURE__*/ createUseReadContract({
  abi: noncesAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link noncesAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadNoncesNonces = /*#__PURE__*/ createUseReadContract({
  abi: noncesAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useReadOwnableContract = /*#__PURE__*/ createUseReadContract({
  abi: ownableAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOwnableOwner = /*#__PURE__*/ createUseReadContract({
  abi: ownableAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useWriteOwnableContract = /*#__PURE__*/ createUseWriteContract({
  abi: ownableAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOwnableRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ownableAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOwnableTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ownableAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__
 */
export const useSimulateOwnableContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ownableAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOwnableRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ownableAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOwnableTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ownableAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableAbi}__
 */
export const useWatchOwnableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ownableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOwnableOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ownableAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useReadOwnableUpgradeableContract =
  /*#__PURE__*/ createUseReadContract({ abi: ownableUpgradeableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOwnableUpgradeableOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: ownableUpgradeableAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useWriteOwnableUpgradeableContract =
  /*#__PURE__*/ createUseWriteContract({ abi: ownableUpgradeableAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOwnableUpgradeableRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ownableUpgradeableAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOwnableUpgradeableTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ownableUpgradeableAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useSimulateOwnableUpgradeableContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: ownableUpgradeableAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOwnableUpgradeableRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ownableUpgradeableAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOwnableUpgradeableTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ownableUpgradeableAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__
 */
export const useWatchOwnableUpgradeableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ownableUpgradeableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchOwnableUpgradeableInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ownableUpgradeableAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ownableUpgradeableAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOwnableUpgradeableOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ownableUpgradeableAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableUpgradeableAbi}__
 */
export const useReadPausableUpgradeableContract =
  /*#__PURE__*/ createUseReadContract({ abi: pausableUpgradeableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `functionName` set to `"paused"`
 */
export const useReadPausableUpgradeablePaused =
  /*#__PURE__*/ createUseReadContract({
    abi: pausableUpgradeableAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__
 */
export const useWatchPausableUpgradeableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pausableUpgradeableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchPausableUpgradeableInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pausableUpgradeableAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchPausableUpgradeablePaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pausableUpgradeableAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableUpgradeableAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchPausableUpgradeableUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pausableUpgradeableAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useReadProtocolTreasuryContract =
  /*#__PURE__*/ createUseReadContract({ abi: protocolTreasuryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEMPTION_PAYOUT_BPS"`
 */
export const useReadProtocolTreasuryRedemptionPayoutBps =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEMPTION_PAYOUT_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadProtocolTreasuryUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"appraisalOracle"`
 */
export const useReadProtocolTreasuryAppraisalOracle =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'appraisalOracle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"asset"`
 */
export const useReadProtocolTreasuryAsset = /*#__PURE__*/ createUseReadContract(
  { abi: protocolTreasuryAbi, functionName: 'asset' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadProtocolTreasuryEconomyManager =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'economyManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"gachaTreasury"`
 */
export const useReadProtocolTreasuryGachaTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'gachaTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"getRemainingRedemptionWindow"`
 */
export const useReadProtocolTreasuryGetRemainingRedemptionWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'getRemainingRedemptionWindow',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"isRedemptionEligible"`
 */
export const useReadProtocolTreasuryIsRedemptionEligible =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'isRedemptionEligible',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadProtocolTreasuryOwner = /*#__PURE__*/ createUseReadContract(
  { abi: protocolTreasuryAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"paused"`
 */
export const useReadProtocolTreasuryPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadProtocolTreasuryProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"redemptionWindow"`
 */
export const useReadProtocolTreasuryRedemptionWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'redemptionWindow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useWriteProtocolTreasuryContract =
  /*#__PURE__*/ createUseWriteContract({ abi: protocolTreasuryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useWriteProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteProtocolTreasuryInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useWriteProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteProtocolTreasuryPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteProtocolTreasuryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setAppraisalOracle"`
 */
export const useWriteProtocolTreasurySetAppraisalOracle =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'setAppraisalOracle',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteProtocolTreasurySetEconomyManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setGachaTreasury"`
 */
export const useWriteProtocolTreasurySetGachaTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'setGachaTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setRedemptionWindow"`
 */
export const useWriteProtocolTreasurySetRedemptionWindow =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'setRedemptionWindow',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useWriteProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteProtocolTreasuryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteProtocolTreasuryUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteProtocolTreasuryUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useSimulateProtocolTreasuryContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: protocolTreasuryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"executeRedemption"`
 */
export const useSimulateProtocolTreasuryExecuteRedemption =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'executeRedemption',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateProtocolTreasuryInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"onRevenueReceived"`
 */
export const useSimulateProtocolTreasuryOnRevenueReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'onRevenueReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateProtocolTreasuryPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateProtocolTreasuryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setAppraisalOracle"`
 */
export const useSimulateProtocolTreasurySetAppraisalOracle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'setAppraisalOracle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateProtocolTreasurySetEconomyManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setGachaTreasury"`
 */
export const useSimulateProtocolTreasurySetGachaTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'setGachaTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setRedemptionWindow"`
 */
export const useSimulateProtocolTreasurySetRedemptionWindow =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'setRedemptionWindow',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOut"`
 */
export const useSimulateProtocolTreasuryTransferOut =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'transferOut',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateProtocolTreasuryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateProtocolTreasuryUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateProtocolTreasuryUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useWatchProtocolTreasuryContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: protocolTreasuryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"AppraisalOracleUpdated"`
 */
export const useWatchProtocolTreasuryAppraisalOracleUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'AppraisalOracleUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchProtocolTreasuryEconomyManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'EconomyManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"GachaTreasuryUpdated"`
 */
export const useWatchProtocolTreasuryGachaTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'GachaTreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchProtocolTreasuryInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchProtocolTreasuryOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchProtocolTreasuryPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"ProtocolRevenueReceived"`
 */
export const useWatchProtocolTreasuryProtocolRevenueReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'ProtocolRevenueReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"ProtocolTransfer"`
 */
export const useWatchProtocolTreasuryProtocolTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'ProtocolTransfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionExecuted"`
 */
export const useWatchProtocolTreasuryRedemptionExecuted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'RedemptionExecuted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionWindowEnforced"`
 */
export const useWatchProtocolTreasuryRedemptionWindowEnforced =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'RedemptionWindowEnforced',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"RedemptionWindowUpdated"`
 */
export const useWatchProtocolTreasuryRedemptionWindowUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'RedemptionWindowUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchProtocolTreasuryUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchProtocolTreasuryUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__
 */
export const useReadRarityTrackerContract = /*#__PURE__*/ createUseReadContract(
  { abi: rarityTrackerAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadRarityTrackerUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"depositorTotalsUSD"`
 */
export const useReadRarityTrackerDepositorTotalsUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'depositorTotalsUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"getCardDepositors"`
 */
export const useReadRarityTrackerGetCardDepositors =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'getCardDepositors',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"getCardInfo"`
 */
export const useReadRarityTrackerGetCardInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'getCardInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"getDepositorValue"`
 */
export const useReadRarityTrackerGetDepositorValue =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'getDepositorValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"getStatistics"`
 */
export const useReadRarityTrackerGetStatistics =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'getStatistics',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"getTrackedCards"`
 */
export const useReadRarityTrackerGetTrackedCards =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'getTrackedCards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"hasWon"`
 */
export const useReadRarityTrackerHasWon = /*#__PURE__*/ createUseReadContract({
  abi: rarityTrackerAbi,
  functionName: 'hasWon',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadRarityTrackerOwner = /*#__PURE__*/ createUseReadContract({
  abi: rarityTrackerAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadRarityTrackerPaused = /*#__PURE__*/ createUseReadContract({
  abi: rarityTrackerAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadRarityTrackerProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"rarityName"`
 */
export const useReadRarityTrackerRarityName =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'rarityName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"totalAppraisedValueUSD"`
 */
export const useReadRarityTrackerTotalAppraisedValueUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'totalAppraisedValueUSD',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"totalDepositedCount"`
 */
export const useReadRarityTrackerTotalDepositedCount =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'totalDepositedCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"totalNftsWon"`
 */
export const useReadRarityTrackerTotalNftsWon =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'totalNftsWon',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"totalRewards"`
 */
export const useReadRarityTrackerTotalRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'totalRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"totalWins"`
 */
export const useReadRarityTrackerTotalWins =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'totalWins',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"userRewards"`
 */
export const useReadRarityTrackerUserRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityTrackerAbi,
    functionName: 'userRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"userWins"`
 */
export const useReadRarityTrackerUserWins = /*#__PURE__*/ createUseReadContract(
  { abi: rarityTrackerAbi, functionName: 'userWins' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__
 */
export const useWriteRarityTrackerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: rarityTrackerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteRarityTrackerInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteRarityTrackerPause = /*#__PURE__*/ createUseWriteContract({
  abi: rarityTrackerAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"recordReward"`
 */
export const useWriteRarityTrackerRecordReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'recordReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"recordWin"`
 */
export const useWriteRarityTrackerRecordWin =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'recordWin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"registerDeposit"`
 */
export const useWriteRarityTrackerRegisterDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'registerDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"removeDeposit"`
 */
export const useWriteRarityTrackerRemoveDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'removeDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteRarityTrackerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteRarityTrackerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteRarityTrackerUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"updateCardAppraisal"`
 */
export const useWriteRarityTrackerUpdateCardAppraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'updateCardAppraisal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"updateTracker"`
 */
export const useWriteRarityTrackerUpdateTracker =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'updateTracker',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteRarityTrackerUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityTrackerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__
 */
export const useSimulateRarityTrackerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: rarityTrackerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateRarityTrackerInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateRarityTrackerPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"recordReward"`
 */
export const useSimulateRarityTrackerRecordReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'recordReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"recordWin"`
 */
export const useSimulateRarityTrackerRecordWin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'recordWin',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"registerDeposit"`
 */
export const useSimulateRarityTrackerRegisterDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'registerDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"removeDeposit"`
 */
export const useSimulateRarityTrackerRemoveDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'removeDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateRarityTrackerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateRarityTrackerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateRarityTrackerUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"updateCardAppraisal"`
 */
export const useSimulateRarityTrackerUpdateCardAppraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'updateCardAppraisal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"updateTracker"`
 */
export const useSimulateRarityTrackerUpdateTracker =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'updateTracker',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityTrackerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateRarityTrackerUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityTrackerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__
 */
export const useWatchRarityTrackerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: rarityTrackerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"CardAggregationUpdated"`
 */
export const useWatchRarityTrackerCardAggregationUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'CardAggregationUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"CardAppraisalUpdated"`
 */
export const useWatchRarityTrackerCardAppraisalUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'CardAppraisalUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"DepositorPositionUpdated"`
 */
export const useWatchRarityTrackerDepositorPositionUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'DepositorPositionUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchRarityTrackerInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"NftWon"`
 */
export const useWatchRarityTrackerNftWon =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'NftWon',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchRarityTrackerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchRarityTrackerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"RewardClaimed"`
 */
export const useWatchRarityTrackerRewardClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'RewardClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"TrackerUpdated"`
 */
export const useWatchRarityTrackerTrackerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'TrackerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchRarityTrackerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityTrackerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchRarityTrackerUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityTrackerAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useReadUupsUpgradeableContract =
  /*#__PURE__*/ createUseReadContract({ abi: uupsUpgradeableAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadUupsUpgradeableUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: uupsUpgradeableAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadUupsUpgradeableProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: uupsUpgradeableAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useWriteUupsUpgradeableContract =
  /*#__PURE__*/ createUseWriteContract({ abi: uupsUpgradeableAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteUupsUpgradeableUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: uupsUpgradeableAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useSimulateUupsUpgradeableContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: uupsUpgradeableAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateUupsUpgradeableUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: uupsUpgradeableAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link uupsUpgradeableAbi}__
 */
export const useWatchUupsUpgradeableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: uupsUpgradeableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link uupsUpgradeableAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchUupsUpgradeableUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: uupsUpgradeableAbi,
    eventName: 'Upgraded',
  })
