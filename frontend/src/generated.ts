import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

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
// CardDividendTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cardDividendTrackerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_fundsToken', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
      {
        name: '_rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: '_cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'accumulativeFundsOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    inputs: [],
    name: 'cardId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'distributeFunds',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'fundsToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCardAppraisalPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalCardDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalFundsDistributed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getUserCardDeposits',
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
    name: 'rarity',
    outputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recoverToken',
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
    name: 'rewardsManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
    ],
    name: 'setRewardsManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFundsDistributed',
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'updateCorrection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
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
        name: 'amount',
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
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsWithdrawn',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'CalculationOverflow' },
  { type: 'error', inputs: [], name: 'CardNotFound' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalContract' },
  { type: 'error', inputs: [], name: 'NoDeposits' },
  { type: 'error', inputs: [], name: 'NoFundsToWithdraw' },
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
  { type: 'error', inputs: [], name: 'PrecisionLoss' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'UnauthorizedCaller' },
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
// Gacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      {
        name: '_gachaServiceHandler',
        internalType: 'address',
        type: 'address',
      },
      { name: '_feeToken', internalType: 'address', type: 'address' },
      { name: '_spinFee', internalType: 'uint256', type: 'uint256' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
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
    name: 'commonWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'epicWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
          { name: 'requester', internalType: 'address', type: 'address' },
          { name: 'fulfilled', internalType: 'bool', type: 'bool' },
        ],
      },
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
    inputs: [],
    name: 'getRarityWeights',
    outputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSpinRequest',
    outputs: [
      { name: 'requester', internalType: 'address', type: 'address' },
      { name: 'fulfilled', internalType: 'bool', type: 'bool' },
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
    inputs: [],
    name: 'legendaryWeight',
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
    name: 'rareWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'rewardsManager',
    outputs: [
      {
        name: '',
        internalType: 'contract GachaRewardsManager',
        type: 'address',
      },
    ],
    stateMutability: 'view',
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
      { name: '_commonWeight', internalType: 'uint256', type: 'uint256' },
      { name: '_uncommonWeight', internalType: 'uint256', type: 'uint256' },
      { name: '_rareWeight', internalType: 'uint256', type: 'uint256' },
      { name: '_epicWeight', internalType: 'uint256', type: 'uint256' },
      { name: '_legendaryWeight', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setRarityWeights',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
    ],
    name: 'setRewardsManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newFee', internalType: 'uint256', type: 'uint256' }],
    name: 'setSpinFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'spin',
    outputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'spinFee',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'spinRequests',
    outputs: [
      { name: 'requester', internalType: 'address', type: 'address' },
      { name: 'fulfilled', internalType: 'bool', type: 'bool' },
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
    ],
    name: 'spinWithPermit',
    outputs: [{ name: 'triggerId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'uncommonWeight',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'FeeUpdated',
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
        name: 'common',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'uncommon',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'epic',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'legendary',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RarityWeightsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rewardsAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsDistributed',
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
  { type: 'error', inputs: [], name: 'AlreadyFulfilled' },
  { type: 'error', inputs: [], name: 'CannotReclaimFulfilledSpin' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FeePaymentFailed' },
  { type: 'error', inputs: [], name: 'FeeWithdrawalFailed' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidRewardsManager' },
  { type: 'error', inputs: [], name: 'InvalidServiceHandler' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryContract' },
  { type: 'error', inputs: [], name: 'InvalidTriggerId' },
  { type: 'error', inputs: [], name: 'NoFeesToWithdraw' },
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
  { type: 'error', inputs: [], name: 'RefundFailed' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedServiceHandler' },
  { type: 'error', inputs: [], name: 'WeightsMustSumToTotal' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaRewardsManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaRewardsManagerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_gachaContract', internalType: 'address', type: 'address' },
      { name: '_treasuryContract', internalType: 'address', type: 'address' },
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
      { name: '_protocolAddress', internalType: 'address', type: 'address' },
      { name: '_feeToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'GAMMA_PRECISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PERCENTAGE_DENOMINATOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PRECISION',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PROTOCOL_PERCENTAGE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'cardExists',
    outputs: [{ name: 'exists', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'cardTrackers',
    outputs: [
      { name: 'perUnitMeter', internalType: 'uint256', type: 'uint256' },
      { name: 'raritySnapshot', internalType: 'uint256', type: 'uint256' },
      { name: 'totalUnits', internalType: 'uint256', type: 'uint256' },
      { name: 'cardWeight', internalType: 'uint256', type: 'uint256' },
      { name: 'lastPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'exists', internalType: 'bool', type: 'bool' },
      { name: 'stashedBonus', internalType: 'uint256', type: 'uint256' },
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'claimCardRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'delta',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyRecoverTokens',
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
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'findActiveCardRarity',
    outputs: [
      {
        name: 'activeRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'found', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gachaContract',
    outputs: [{ name: '', internalType: 'contract Gacha', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'gamma',
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getCardTracker',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaRewardsManager.CardTracker',
        type: 'tuple',
        components: [
          { name: 'perUnitMeter', internalType: 'uint256', type: 'uint256' },
          { name: 'raritySnapshot', internalType: 'uint256', type: 'uint256' },
          { name: 'totalUnits', internalType: 'uint256', type: 'uint256' },
          { name: 'cardWeight', internalType: 'uint256', type: 'uint256' },
          { name: 'lastPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'exists', internalType: 'bool', type: 'bool' },
          { name: 'stashedBonus', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTreasuryBalance',
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getUserCardClaimable',
    outputs: [{ name: 'claimable', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getUserSnapshot',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaRewardsManager.UserSnapshot',
        type: 'tuple',
        components: [
          { name: 'perUnitSnapshot', internalType: 'uint256', type: 'uint256' },
          { name: 'units', internalType: 'uint256', type: 'uint256' },
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newPrice', internalType: 'uint256', type: 'uint256' },
      {
        name: 'newRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'handleReappraisal',
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
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'totalFeeAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'hitRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'processSpinRewards',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'rarityMeters',
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
    inputs: [{ name: '_delta', internalType: 'uint256', type: 'uint256' }],
    name: 'setDelta',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_gamma', internalType: 'uint256', type: 'uint256' }],
    name: 'setGamma',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_protocolAddress', internalType: 'address', type: 'address' },
    ],
    name: 'setProtocolAddress',
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'settleCard',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAccrued',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'totalCardWeights',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalProtocolFees',
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
    name: 'treasuryContract',
    outputs: [
      { name: '', internalType: 'contract GachaTreasury', type: 'address' },
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'userAddress', internalType: 'address', type: 'address' },
      { name: 'unitsDelta', internalType: 'int256', type: 'int256' },
    ],
    name: 'updateUserUnits',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'userSnapshots',
    outputs: [
      { name: 'perUnitSnapshot', internalType: 'uint256', type: 'uint256' },
      { name: 'units', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BonusDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BonusStashed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'fromRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'toRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'CardMigrated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'oldWeight',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newWeight',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardReappraised',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'initialWeight',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardTrackerCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldDelta',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newDelta',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeltaUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldGamma',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newGamma',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GammaUpdated',
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
        name: 'oldProtocol',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newProtocol',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ProtocolAddressUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RewardsAccrued',
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
    name: 'RewardsClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'depositorShare',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinProcessed',
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
  { type: 'error', inputs: [], name: 'CalculationOverflow' },
  { type: 'error', inputs: [], name: 'CardNotFound' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidDelta' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidProtocolAddress' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryContract' },
  { type: 'error', inputs: [], name: 'NoFundsToWithdraw' },
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
  { type: 'error', inputs: [], name: 'UnauthorizedGachaContract' },
  { type: 'error', inputs: [], name: 'UnauthorizedTreasuryContract' },
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
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_gachaContract', internalType: 'address', type: 'address' },
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
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
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'cardTotalDeposits',
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
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getCardTotalDeposits',
    outputs: [{ name: 'totalCount', internalType: 'uint256', type: 'uint256' }],
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
    name: 'getMigrationBatchInfo',
    outputs: [
      { name: 'maxSafeBatch', internalType: 'uint256', type: 'uint256' },
      { name: 'totalBatches', internalType: 'uint256', type: 'uint256' },
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
    inputs: [],
    name: 'getTreasuryGasStatus',
    outputs: [
      { name: 'sizes', internalType: 'uint256[5]', type: 'uint256[5]' },
      { name: 'totalSize', internalType: 'uint256', type: 'uint256' },
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getUserCardDeposits',
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
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'startIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'endIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'migrateBatchNFTValues',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'priceRanges',
    outputs: [
      { name: 'minPriceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'maxPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
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
      { name: '_gachaContract', internalType: 'address', type: 'address' },
    ],
    name: 'setGachaContract',
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
      { name: 'minPriceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'maxPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setPriceRange',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_treasuryRewardsManager',
        internalType: 'address',
        type: 'address',
      },
    ],
    name: 'setTreasuryRewardsManager',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasuryRewardsManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
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
    name: 'userTotalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'validatePriceRanges',
    outputs: [{ name: 'isValid', internalType: 'bool', type: 'bool' }],
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
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: true,
      },
      {
        name: 'oldMinPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'oldMaxPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newMinPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newMaxPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PriceRangeUpdated',
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
        name: 'oldRewards',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newRewards',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RewardsManagerUpdated',
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
  { type: 'error', inputs: [], name: 'AppraisalRequired' },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'CannotDepositSameNFTTwice' },
  { type: 'error', inputs: [], name: 'CollectionAlreadyWhitelisted' },
  { type: 'error', inputs: [], name: 'CollectionNotInWhitelist' },
  { type: 'error', inputs: [], name: 'CollectionNotWhitelisted' },
  { type: 'error', inputs: [], name: 'EmptyArrays' },
  { type: 'error', inputs: [], name: 'EmptyWhitelist' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalContract' },
  { type: 'error', inputs: [], name: 'InvalidCollectionAddress' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidIndex' },
  { type: 'error', inputs: [], name: 'InvalidNFTContract' },
  { type: 'error', inputs: [], name: 'InvalidPriceRange' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidRewardsManager' },
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
  { type: 'error', inputs: [], name: 'NotNFTDepositor' },
  { type: 'error', inputs: [], name: 'NotNFTOwner' },
  { type: 'error', inputs: [], name: 'OverlappingPriceRanges' },
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
  { type: 'error', inputs: [], name: 'PendingDepositAlreadyProcessed' },
  { type: 'error', inputs: [], name: 'PendingDepositNotFound' },
  { type: 'error', inputs: [], name: 'RarityMigrationFailed' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TooManyItems' },
  { type: 'error', inputs: [], name: 'UnauthorizedGachaContract' },
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
// IGachaRewardsManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaRewardsManagerAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recordUserRewardClaim',
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
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'appraisedPrices',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenCardIds',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NFTAppraisal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const nftAppraisalAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_feeToken', internalType: 'address', type: 'address' },
      { name: '_appraisalFee', internalType: 'uint256', type: 'uint256' },
      { name: '_protocolAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
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
        ],
      },
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
        name: 'requester',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'fee', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
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
  { type: 'error', inputs: [], name: 'AppraisalAlreadyExists' },
  { type: 'error', inputs: [], name: 'AppraisalNotFound' },
  { type: 'error', inputs: [], name: 'AppraisalNotPending' },
  { type: 'error', inputs: [], name: 'CardIdMismatch' },
  { type: 'error', inputs: [], name: 'CardIdRequired' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidCollection' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidPrice' },
  { type: 'error', inputs: [], name: 'InvalidProtocolAddress' },
  { type: 'error', inputs: [], name: 'InvalidTokenId' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryAddress' },
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
          { name: 'chain', internalType: 'string', type: 'string' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
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
          { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
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
      { name: 'chain', internalType: 'string', type: 'string', indexed: true },
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
      { name: 'chain', internalType: 'string', type: 'string', indexed: true },
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
// Pausable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pausableAbi = [
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
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReentrancyGuard
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reentrancyGuardAbi = [
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
// UserDividendTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const userDividendTrackerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_fundsToken', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      {
        name: '_rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'accumulativeFundsOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'distributeFunds',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'fundsToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalFundsDistributed',
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
    name: 'rarity',
    outputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recoverToken',
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
    name: 'rewardsManager',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_rewardsManager', internalType: 'address', type: 'address' },
    ],
    name: 'setRewardsManager',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFundsDistributed',
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'updateCorrection',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
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
    name: 'RewardsManagerUpdated',
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
  { type: 'error', inputs: [], name: 'CalculationOverflow' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
  { type: 'error', inputs: [], name: 'InvalidFundsToken' },
  { type: 'error', inputs: [], name: 'InvalidTreasury' },
  { type: 'error', inputs: [], name: 'NoDeposits' },
  { type: 'error', inputs: [], name: 'NoFundsToWithdraw' },
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
  { type: 'error', inputs: [], name: 'PrecisionLoss' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'UnauthorizedCaller' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__
 */
export const useReadCardDividendTrackerContract =
  /*#__PURE__*/ createUseReadContract({ abi: cardDividendTrackerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"accumulativeFundsOf"`
 */
export const useReadCardDividendTrackerAccumulativeFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'accumulativeFundsOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadCardDividendTrackerAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'appraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"cardId"`
 */
export const useReadCardDividendTrackerCardId =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'cardId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"fundsToken"`
 */
export const useReadCardDividendTrackerFundsToken =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'fundsToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"getCardAppraisalPrice"`
 */
export const useReadCardDividendTrackerGetCardAppraisalPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'getCardAppraisalPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"getTotalCardDeposits"`
 */
export const useReadCardDividendTrackerGetTotalCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'getTotalCardDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"getTotalFundsDistributed"`
 */
export const useReadCardDividendTrackerGetTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'getTotalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"getUserCardDeposits"`
 */
export const useReadCardDividendTrackerGetUserCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'getUserCardDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCardDividendTrackerOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadCardDividendTrackerPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"rarity"`
 */
export const useReadCardDividendTrackerRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'rarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"rewardsManager"`
 */
export const useReadCardDividendTrackerRewardsManager =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'rewardsManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"totalFundsDistributed"`
 */
export const useReadCardDividendTrackerTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'totalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadCardDividendTrackerTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"withdrawableFundsOf"`
 */
export const useReadCardDividendTrackerWithdrawableFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: cardDividendTrackerAbi,
    functionName: 'withdrawableFundsOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__
 */
export const useWriteCardDividendTrackerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: cardDividendTrackerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useWriteCardDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteCardDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteCardDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useWriteCardDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCardDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useWriteCardDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCardDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useWriteCardDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useWriteCardDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__
 */
export const useSimulateCardDividendTrackerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: cardDividendTrackerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useSimulateCardDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateCardDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateCardDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useSimulateCardDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCardDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useSimulateCardDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCardDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useSimulateCardDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useSimulateCardDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__
 */
export const useWatchCardDividendTrackerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: cardDividendTrackerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `eventName` set to `"FundsDistributed"`
 */
export const useWatchCardDividendTrackerFundsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardDividendTrackerAbi,
    eventName: 'FundsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `eventName` set to `"FundsWithdrawn"`
 */
export const useWatchCardDividendTrackerFundsWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardDividendTrackerAbi,
    eventName: 'FundsWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCardDividendTrackerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardDividendTrackerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchCardDividendTrackerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardDividendTrackerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardDividendTrackerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchCardDividendTrackerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardDividendTrackerAbi,
    eventName: 'Unpaused',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"TOTAL_WEIGHT"`
 */
export const useReadGachaTotalWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'TOTAL_WEIGHT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"commonWeight"`
 */
export const useReadGachaCommonWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'commonWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"epicWeight"`
 */
export const useReadGachaEpicWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'epicWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaFeeToken = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'feeToken',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getRarityWeights"`
 */
export const useReadGachaGetRarityWeights = /*#__PURE__*/ createUseReadContract(
  { abi: gachaAbi, functionName: 'getRarityWeights' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getSpinRequest"`
 */
export const useReadGachaGetSpinRequest = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'getSpinRequest',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"legendaryWeight"`
 */
export const useReadGachaLegendaryWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'legendaryWeight',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"rareWeight"`
 */
export const useReadGachaRareWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'rareWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"rewardsManager"`
 */
export const useReadGachaRewardsManager = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'rewardsManager',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinFee"`
 */
export const useReadGachaSpinFee = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'spinFee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinRequests"`
 */
export const useReadGachaSpinRequests = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'spinRequests',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"uncommonWeight"`
 */
export const useReadGachaUncommonWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'uncommonWeight',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteGachaSetFeeToken = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
  functionName: 'setFeeToken',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setRarityWeights"`
 */
export const useWriteGachaSetRarityWeights =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setRarityWeights',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useWriteGachaSetRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinFee"`
 */
export const useWriteGachaSetSpinFee = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
  functionName: 'setSpinFee',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const useWriteGachaWithdrawFees = /*#__PURE__*/ createUseWriteContract({
  abi: gachaAbi,
  functionName: 'withdrawFees',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateGachaSetFeeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setFeeToken',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setRarityWeights"`
 */
export const useSimulateGachaSetRarityWeights =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setRarityWeights',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useSimulateGachaSetRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinFee"`
 */
export const useSimulateGachaSetSpinFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setSpinFee',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const useSimulateGachaWithdrawFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'withdrawFees',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__
 */
export const useWatchGachaContract = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchGachaFeeTokenUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'FeeTokenUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"FeeUpdated"`
 */
export const useWatchGachaFeeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'FeeUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"RandomnessRequested"`
 */
export const useWatchGachaRandomnessRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'RandomnessRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"RarityWeightsUpdated"`
 */
export const useWatchGachaRarityWeightsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'RarityWeightsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"RewardsDistributed"`
 */
export const useWatchGachaRewardsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'RewardsDistributed',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useReadGachaRewardsManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"GAMMA_PRECISION"`
 */
export const useReadGachaRewardsManagerGammaPrecision =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'GAMMA_PRECISION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"PERCENTAGE_DENOMINATOR"`
 */
export const useReadGachaRewardsManagerPercentageDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'PERCENTAGE_DENOMINATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"PRECISION"`
 */
export const useReadGachaRewardsManagerPrecision =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'PRECISION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"PROTOCOL_PERCENTAGE"`
 */
export const useReadGachaRewardsManagerProtocolPercentage =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'PROTOCOL_PERCENTAGE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadGachaRewardsManagerAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'appraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"cardExists"`
 */
export const useReadGachaRewardsManagerCardExists =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'cardExists',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"cardTrackers"`
 */
export const useReadGachaRewardsManagerCardTrackers =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'cardTrackers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"delta"`
 */
export const useReadGachaRewardsManagerDelta =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'delta',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaRewardsManagerFeeToken =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'feeToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"findActiveCardRarity"`
 */
export const useReadGachaRewardsManagerFindActiveCardRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'findActiveCardRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"gachaContract"`
 */
export const useReadGachaRewardsManagerGachaContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'gachaContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"gamma"`
 */
export const useReadGachaRewardsManagerGamma =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'gamma',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getCardTracker"`
 */
export const useReadGachaRewardsManagerGetCardTracker =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getCardTracker',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getTreasuryBalance"`
 */
export const useReadGachaRewardsManagerGetTreasuryBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getTreasuryBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getUserCardClaimable"`
 */
export const useReadGachaRewardsManagerGetUserCardClaimable =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getUserCardClaimable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getUserSnapshot"`
 */
export const useReadGachaRewardsManagerGetUserSnapshot =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getUserSnapshot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaRewardsManagerOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaRewardsManagerPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"protocolAddress"`
 */
export const useReadGachaRewardsManagerProtocolAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'protocolAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"rarityMeters"`
 */
export const useReadGachaRewardsManagerRarityMeters =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'rarityMeters',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalAccrued"`
 */
export const useReadGachaRewardsManagerTotalAccrued =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalAccrued',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalCardWeights"`
 */
export const useReadGachaRewardsManagerTotalCardWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalCardWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalClaimed"`
 */
export const useReadGachaRewardsManagerTotalClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalProtocolFees"`
 */
export const useReadGachaRewardsManagerTotalProtocolFees =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalProtocolFees',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"treasuryContract"`
 */
export const useReadGachaRewardsManagerTreasuryContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'treasuryContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"userSnapshots"`
 */
export const useReadGachaRewardsManagerUserSnapshots =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'userSnapshots',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useWriteGachaRewardsManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"claimCardRewards"`
 */
export const useWriteGachaRewardsManagerClaimCardRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'claimCardRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaRewardsManagerEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyRecoverTokens"`
 */
export const useWriteGachaRewardsManagerEmergencyRecoverTokens =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyRecoverTokens',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaRewardsManagerEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"handleReappraisal"`
 */
export const useWriteGachaRewardsManagerHandleReappraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'handleReappraisal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"processSpinRewards"`
 */
export const useWriteGachaRewardsManagerProcessSpinRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'processSpinRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaRewardsManagerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setDelta"`
 */
export const useWriteGachaRewardsManagerSetDelta =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setDelta',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setGamma"`
 */
export const useWriteGachaRewardsManagerSetGamma =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setGamma',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useWriteGachaRewardsManagerSetProtocolAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"settleCard"`
 */
export const useWriteGachaRewardsManagerSettleCard =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'settleCard',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaRewardsManagerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"updateUserUnits"`
 */
export const useWriteGachaRewardsManagerUpdateUserUnits =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'updateUserUnits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useSimulateGachaRewardsManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"claimCardRewards"`
 */
export const useSimulateGachaRewardsManagerClaimCardRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'claimCardRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaRewardsManagerEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyRecoverTokens"`
 */
export const useSimulateGachaRewardsManagerEmergencyRecoverTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyRecoverTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaRewardsManagerEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"handleReappraisal"`
 */
export const useSimulateGachaRewardsManagerHandleReappraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'handleReappraisal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"processSpinRewards"`
 */
export const useSimulateGachaRewardsManagerProcessSpinRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'processSpinRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaRewardsManagerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setDelta"`
 */
export const useSimulateGachaRewardsManagerSetDelta =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setDelta',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setGamma"`
 */
export const useSimulateGachaRewardsManagerSetGamma =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setGamma',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useSimulateGachaRewardsManagerSetProtocolAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"settleCard"`
 */
export const useSimulateGachaRewardsManagerSettleCard =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'settleCard',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaRewardsManagerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"updateUserUnits"`
 */
export const useSimulateGachaRewardsManagerUpdateUserUnits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'updateUserUnits',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useWatchGachaRewardsManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"BonusDistributed"`
 */
export const useWatchGachaRewardsManagerBonusDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'BonusDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"BonusStashed"`
 */
export const useWatchGachaRewardsManagerBonusStashed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'BonusStashed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"CardMigrated"`
 */
export const useWatchGachaRewardsManagerCardMigrated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'CardMigrated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"CardReappraised"`
 */
export const useWatchGachaRewardsManagerCardReappraised =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'CardReappraised',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"CardTrackerCreated"`
 */
export const useWatchGachaRewardsManagerCardTrackerCreated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'CardTrackerCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"DeltaUpdated"`
 */
export const useWatchGachaRewardsManagerDeltaUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'DeltaUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"GammaUpdated"`
 */
export const useWatchGachaRewardsManagerGammaUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'GammaUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaRewardsManagerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaRewardsManagerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"ProtocolAddressUpdated"`
 */
export const useWatchGachaRewardsManagerProtocolAddressUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'ProtocolAddressUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"RewardsAccrued"`
 */
export const useWatchGachaRewardsManagerRewardsAccrued =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'RewardsAccrued',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"RewardsClaimed"`
 */
export const useWatchGachaRewardsManagerRewardsClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'RewardsClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"SpinProcessed"`
 */
export const useWatchGachaRewardsManagerSpinProcessed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'SpinProcessed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaRewardsManagerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'Unpaused',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"depositedNFTs"`
 */
export const useReadGachaTreasuryDepositedNfTs =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'depositedNFTs',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getCardTotalDeposits"`
 */
export const useReadGachaTreasuryGetCardTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getCardTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getMigrationBatchInfo"`
 */
export const useReadGachaTreasuryGetMigrationBatchInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getMigrationBatchInfo',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getTreasuryGasStatus"`
 */
export const useReadGachaTreasuryGetTreasuryGasStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getTreasuryGasStatus',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserCardDeposits"`
 */
export const useReadGachaTreasuryGetUserCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserCardDeposits',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftCurrentRarity"`
 */
export const useReadGachaTreasuryNftCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftCurrentRarity',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"priceRanges"`
 */
export const useReadGachaTreasuryPriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'priceRanges',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"treasuryRewardsManager"`
 */
export const useReadGachaTreasuryTreasuryRewardsManager =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'treasuryRewardsManager',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userTotalDeposits"`
 */
export const useReadGachaTreasuryUserTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"validatePriceRanges"`
 */
export const useReadGachaTreasuryValidatePriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'validatePriceRanges',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateBatchNFTValues"`
 */
export const useWriteGachaTreasuryMigrateBatchNftValues =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'migrateBatchNFTValues',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useWriteGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setPriceRange"`
 */
export const useWriteGachaTreasurySetPriceRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setPriceRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setTreasuryRewardsManager"`
 */
export const useWriteGachaTreasurySetTreasuryRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setTreasuryRewardsManager',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"migrateBatchNFTValues"`
 */
export const useSimulateGachaTreasuryMigrateBatchNftValues =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'migrateBatchNFTValues',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useSimulateGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setPriceRange"`
 */
export const useSimulateGachaTreasurySetPriceRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setPriceRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setTreasuryRewardsManager"`
 */
export const useSimulateGachaTreasurySetTreasuryRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setTreasuryRewardsManager',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"GachaContractUpdated"`
 */
export const useWatchGachaTreasuryGachaContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'GachaContractUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"PriceRangeUpdated"`
 */
export const useWatchGachaTreasuryPriceRangeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'PriceRangeUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RewardsManagerUpdated"`
 */
export const useWatchGachaTreasuryRewardsManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'RewardsManagerUpdated',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaRewardsManagerAbi}__
 */
export const useWriteIGachaRewardsManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: iGachaRewardsManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iGachaRewardsManagerAbi}__ and `functionName` set to `"recordUserRewardClaim"`
 */
export const useWriteIGachaRewardsManagerRecordUserRewardClaim =
  /*#__PURE__*/ createUseWriteContract({
    abi: iGachaRewardsManagerAbi,
    functionName: 'recordUserRewardClaim',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaRewardsManagerAbi}__
 */
export const useSimulateIGachaRewardsManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: iGachaRewardsManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iGachaRewardsManagerAbi}__ and `functionName` set to `"recordUserRewardClaim"`
 */
export const useSimulateIGachaRewardsManagerRecordUserRewardClaim =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iGachaRewardsManagerAbi,
    functionName: 'recordUserRewardClaim',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"appraisedPrices"`
 */
export const useReadMockNftAppraisalAppraisedPrices =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'appraisedPrices',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useReadNftAppraisalContract = /*#__PURE__*/ createUseReadContract({
  abi: nftAppraisalAbi,
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableAbi}__
 */
export const useReadPausableContract = /*#__PURE__*/ createUseReadContract({
  abi: pausableAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pausableAbi}__ and `functionName` set to `"paused"`
 */
export const useReadPausablePaused = /*#__PURE__*/ createUseReadContract({
  abi: pausableAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableAbi}__
 */
export const useWatchPausableContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pausableAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchPausablePaused = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: pausableAbi, eventName: 'Paused' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pausableAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchPausableUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pausableAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__
 */
export const useReadUserDividendTrackerContract =
  /*#__PURE__*/ createUseReadContract({ abi: userDividendTrackerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"accumulativeFundsOf"`
 */
export const useReadUserDividendTrackerAccumulativeFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'accumulativeFundsOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"fundsToken"`
 */
export const useReadUserDividendTrackerFundsToken =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'fundsToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"getTotalFundsDistributed"`
 */
export const useReadUserDividendTrackerGetTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'getTotalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadUserDividendTrackerOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadUserDividendTrackerPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"rarity"`
 */
export const useReadUserDividendTrackerRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'rarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"rewardsManager"`
 */
export const useReadUserDividendTrackerRewardsManager =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'rewardsManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"totalFundsDistributed"`
 */
export const useReadUserDividendTrackerTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'totalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadUserDividendTrackerTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"withdrawableFundsOf"`
 */
export const useReadUserDividendTrackerWithdrawableFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: userDividendTrackerAbi,
    functionName: 'withdrawableFundsOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__
 */
export const useWriteUserDividendTrackerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: userDividendTrackerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useWriteUserDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteUserDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteUserDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useWriteUserDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteUserDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useWriteUserDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteUserDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useWriteUserDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useWriteUserDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: userDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__
 */
export const useSimulateUserDividendTrackerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: userDividendTrackerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useSimulateUserDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateUserDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateUserDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useSimulateUserDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateUserDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useSimulateUserDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateUserDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useSimulateUserDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useSimulateUserDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: userDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__
 */
export const useWatchUserDividendTrackerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: userDividendTrackerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"FundsDistributed"`
 */
export const useWatchUserDividendTrackerFundsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'FundsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"FundsWithdrawn"`
 */
export const useWatchUserDividendTrackerFundsWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'FundsWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchUserDividendTrackerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchUserDividendTrackerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"RewardsManagerUpdated"`
 */
export const useWatchUserDividendTrackerRewardsManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'RewardsManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link userDividendTrackerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchUserDividendTrackerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: userDividendTrackerAbi,
    eventName: 'Unpaused',
  })
