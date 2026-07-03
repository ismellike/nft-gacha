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
    name: 'cancelOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'completeOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
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
    outputs: [{ name: 'result', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'ownershipHandoverExpiresAt',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
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
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'requestOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
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
    stateMutability: 'payable',
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
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldOwner',
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
  { type: 'error', inputs: [], name: 'AlreadyInitialized' },
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
  { type: 'error', inputs: [], name: 'NewOwnerIsZeroAddress' },
  { type: 'error', inputs: [], name: 'NoHandoverRequest' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
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
    inputs: [],
    name: 'cancelOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'completeOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
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
    outputs: [{ name: 'result', internalType: 'address', type: 'address' }],
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
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    name: 'ownershipHandoverExpiresAt',
    outputs: [{ name: 'result', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'requestOwnershipHandover',
    outputs: [],
    stateMutability: 'payable',
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
    stateMutability: 'payable',
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
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipHandoverRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldOwner',
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
  { type: 'error', inputs: [], name: 'AlreadyInitialized' },
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
  { type: 'error', inputs: [], name: 'InvalidCount' },
  { type: 'error', inputs: [], name: 'NewOwnerIsZeroAddress' },
  { type: 'error', inputs: [], name: 'NoHandoverRequest' },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'TokenDoesNotExist',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CardGroupedVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cardGroupedVaultAbi = [
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
    name: 'accruedYield',
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
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardNodes',
    outputs: [
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
      { name: 'cardPriceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCount', internalType: 'uint256', type: 'uint256' },
      { name: 'correctionPerUnit', internalType: 'int256', type: 'int256' },
      { name: 'settledYieldPerUnit', internalType: 'uint256', type: 'uint256' },
      { name: 'baseAcc', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'cardIds', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'claimYieldForCards',
    outputs: [{ name: 'withdrawn', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimYieldPaginated',
    outputs: [
      { name: 'withdrawn', internalType: 'uint256', type: 'uint256' },
      { name: 'nextOffset', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
    ],
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getDepositorCardCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'depositor', internalType: 'address', type: 'address' }],
    name: 'getDepositorCards',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      { name: 'asset_', internalType: 'address', type: 'address' },
      { name: 'treasury_', internalType: 'address', type: 'address' },
      { name: 'economyManager_', internalType: 'address', type: 'address' },
      { name: 'numRarities_', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newRarity', internalType: 'uint8', type: 'uint8' },
      { name: 'newPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'migrateCardRarity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
    outputs: [{ name: 'total', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'pendingYieldPaginated',
    outputs: [
      { name: 'total', internalType: 'uint256', type: 'uint256' },
      { name: 'nextOffset', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'positions',
    outputs: [
      { name: 'count', internalType: 'uint256', type: 'uint256' },
      { name: 'rewardDebt', internalType: 'uint256', type: 'uint256' },
      { name: 'correctionDebt', internalType: 'int256', type: 'int256' },
      { name: 'settledDebt', internalType: 'uint256', type: 'uint256' },
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
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'rarityPools',
    outputs: [
      { name: 'accYieldPerUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'totalValueUSD', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    name: 'rarityTotalValue',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
      { name: 'count', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registerCardDeposit',
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
    name: 'removeCardDeposit',
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
    outputs: [{ name: 'total', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sharesOfPaginated',
    outputs: [
      { name: 'total', internalType: 'uint256', type: 'uint256' },
      { name: 'nextOffset', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: 'total', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateCardPrice',
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
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'priceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardDepositRegistered',
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
        name: 'depositor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'count',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardDepositRemoved',
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
        name: 'cardId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'oldRarity',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newRarity',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newPriceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CardRarityMigrated',
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'YieldDistributed',
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
      { name: 'reason', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'YieldTrackingFailed',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'CallerNotManager' },
  { type: 'error', inputs: [], name: 'CallerNotTreasury' },
  { type: 'error', inputs: [], name: 'CardNotRegistered' },
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
  { type: 'error', inputs: [], name: 'InsufficientPosition' },
  { type: 'error', inputs: [], name: 'InsufficientVaultBalance' },
  { type: 'error', inputs: [], name: 'Int256Overflow' },
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidNumRarities' },
  { type: 'error', inputs: [], name: 'InvalidRarity' },
  { type: 'error', inputs: [], name: 'NoValueInPool' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NothingToClaim' },
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
  { type: 'error', inputs: [], name: 'Reentrancy' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedClaim' },
  { type: 'error', inputs: [], name: 'YieldTooSmall' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroAmount' },
  { type: 'error', inputs: [], name: 'ZeroPrice' },
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
// Gacha
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_PRICING_PREMIUM_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_SPIN_TIMEOUT',
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
      { name: 'averageValues', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'weights', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'rarityWeights', internalType: 'uint256[]', type: 'uint256[]' },
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
        internalType: 'uint256[]',
        type: 'uint256[]',
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
      { name: 'distribution', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'rarityWins', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'rarityWins', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'spinCount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
    inputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
    name: 'numRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
    inputs: [
      { name: '_spinTimeout', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setSpinTimeout',
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
    inputs: [],
    name: 'spinTimeout',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: '', internalType: 'uint8', type: 'uint8' },
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
        indexed: false,
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
        internalType: 'uint8',
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
        name: 'oldTimeout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newTimeout',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SpinTimeoutUpdated',
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
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidPricingConfig' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidServiceHandler' },
  { type: 'error', inputs: [], name: 'InvalidSpinTimeout' },
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
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
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
  { type: 'error', inputs: [], name: 'Reentrancy' },
  { type: 'error', inputs: [], name: 'SpinAlreadyReclaimed' },
  { type: 'error', inputs: [], name: 'SpinRequestNotExpired' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedServiceHandler' },
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
    name: 'DEFAULT_DEPOSITOR_SHARE_BPS',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_PROTOCOL_SHARE_BPS',
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
    name: 'cardGroupedVault',
    outputs: [
      { name: '', internalType: 'contract ICardGroupedVault', type: 'address' },
    ],
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
      { name: 'cardGroupedVault_', internalType: 'address', type: 'address' },
      { name: 'protocolTreasury_', internalType: 'address', type: 'address' },
      { name: 'numRarities_', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'numRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usdcAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'hitRarity', internalType: 'uint8', type: 'uint8' },
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
    inputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    name: 'queuedYieldByRarity',
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
    inputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
      { name: 'cardGroupedVault_', internalType: 'address', type: 'address' },
      { name: 'protocolTreasury_', internalType: 'address', type: 'address' },
    ],
    name: 'setVaults',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalQueuedYield',
    outputs: [{ name: 'total', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalQueuedYieldReleased',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    name: 'CardGroupedVaultUpdated',
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
  { type: 'error', inputs: [], name: 'CallerNotGacha' },
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
  { type: 'error', inputs: [], name: 'InvalidConfiguration' },
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidNumRarities' },
  { type: 'error', inputs: [], name: 'InvalidRevenueSplit' },
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
  { type: 'error', inputs: [], name: 'Reentrancy' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
  { type: 'error', inputs: [], name: 'ZeroRevenue' },
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
// GachaTimelock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTimelockAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'minDelay', internalType: 'uint256', type: 'uint256' },
      { name: 'proposers', internalType: 'address[]', type: 'address[]' },
      { name: 'executors', internalType: 'address[]', type: 'address[]' },
      {
        name: 'emergencyAccounts',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'CANCELLER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EMERGENCY_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EXECUTOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_DELAY_FLOOR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PROPOSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'payload', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getOperationState',
    outputs: [
      {
        name: '',
        internalType: 'enum TimelockController.OperationState',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'hashOperation',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'hashOperationBatch',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationDone',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationPending',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationReady',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'propose',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'schedule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'scheduleBatch',
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
    inputs: [{ name: 'newDelay', internalType: 'uint256', type: 'uint256' }],
    name: 'updateDelay',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'CallExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'salt',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'CallSalt',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'predecessor',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'delay',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CallScheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'Cancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinDelayChange',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'provided', internalType: 'uint256', type: 'uint256' },
      { name: 'minimum', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DelayTooShort',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
      { name: 'minDelay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TimelockInsufficientDelay',
  },
  {
    type: 'error',
    inputs: [
      { name: 'targets', internalType: 'uint256', type: 'uint256' },
      { name: 'payloads', internalType: 'uint256', type: 'uint256' },
      { name: 'values', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TimelockInvalidOperationLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'TimelockUnauthorizedCaller',
  },
  {
    type: 'error',
    inputs: [
      { name: 'predecessorId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'TimelockUnexecutedPredecessor',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operationId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'expectedStates', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'TimelockUnexpectedOperationState',
  },
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
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'batchMigrateNFTRarity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardCurrentRarity',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cardGroupedVault',
    outputs: [
      { name: '', internalType: 'contract ICardGroupedVault', type: 'address' },
    ],
    stateMutability: 'view',
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
        internalType: 'struct GachaTreasury.PriceRange[]',
        type: 'tuple[]',
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
    outputs: [{ name: 'counts', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllRarityTotalValues',
    outputs: [{ name: 'values', internalType: 'uint256[]', type: 'uint256[]' }],
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
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNFTCurrentRarity',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNFTRedemptionDeadline',
    outputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNFTRedemptionPriceSnapshot',
    outputs: [{ name: 'priceUSD', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNumRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
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
    outputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    name: 'getRarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    name: 'getRarityName',
    outputs: [{ name: 'name', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRarityNames',
    outputs: [{ name: 'names', internalType: 'string[]', type: 'string[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
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
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
    outputs: [{ name: 'counts', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAllDepositValues',
    outputs: [{ name: 'values', internalType: 'uint256[]', type: 'uint256[]' }],
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'getUserDepositCount',
    outputs: [{ name: 'count', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
      { name: '_numRarities', internalType: 'uint8', type: 'uint8' },
      { name: '_rarityNames', internalType: 'string[]', type: 'string[]' },
      { name: 'minPrices', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'maxPrices', internalType: 'uint256[]', type: 'uint256[]' },
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
    name: 'maxDepositsPerCard',
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
    inputs: [],
    name: 'minDepositAppraisalUSD',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nftCurrentRarity',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
    name: 'nftRedemptionDeadlines',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nftRedemptionPriceSnapshots',
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
    inputs: [],
    name: 'numRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'newPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'onCardPriceUpdated',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'priceRanges',
    outputs: [
      { name: 'minPriceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'maxPriceUSD', internalType: 'uint256', type: 'uint256' },
    ],
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
    inputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    name: 'rarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'rarityNames',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
      { name: '_cardGroupedVault', internalType: 'address', type: 'address' },
    ],
    name: 'setCardGroupedVault',
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
      { name: '_maxDepositsPerCard', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxDepositsPerCard',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_minDepositAppraisalUSD',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    name: 'setMinDepositAppraisalUSD',
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
    inputs: [{ name: 'scalar', internalType: 'uint256', type: 'uint256' }],
    name: 'setYieldClaimDecimalScalar',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
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
      { name: '', internalType: 'uint8', type: 'uint8' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'treasury',
    outputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
      { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
      { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
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
      { name: '', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'userDepositCounts',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
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
    type: 'function',
    inputs: [],
    name: 'yieldClaimDecimalScalar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    ],
    name: 'BatchDeposited',
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
    name: 'CardGroupedVaultUpdated',
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
        name: 'oldMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newMax',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MaxDepositsPerCardUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldMin',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newMin',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinDepositAppraisalUpdated',
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newRarity',
        internalType: 'uint8',
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
        name: 'priceUSD',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedemptionPriceSnapshotted',
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8', indexed: false },
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
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldScalar',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newScalar',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'YieldClaimDecimalScalarUpdated',
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
    name: 'YieldClaimRecorded',
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
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
      { name: 'minRequired', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DepositBelowMinAppraisal',
  },
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
  { type: 'error', inputs: [], name: 'InvalidCardGroupedVault' },
  { type: 'error', inputs: [], name: 'InvalidCollectionAddress' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
  { type: 'error', inputs: [], name: 'InvalidIndex' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidLimit' },
  { type: 'error', inputs: [], name: 'InvalidNFTContract' },
  { type: 'error', inputs: [], name: 'InvalidNumRarities' },
  { type: 'error', inputs: [], name: 'InvalidPriceRange' },
  { type: 'error', inputs: [], name: 'InvalidProtocolTreasury' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'MaxCardDepositsReached' },
  { type: 'error', inputs: [], name: 'NFTAlreadyDeposited' },
  { type: 'error', inputs: [], name: 'NFTNotAppraised' },
  { type: 'error', inputs: [], name: 'NFTNotDeposited' },
  {
    type: 'error',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
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
  { type: 'error', inputs: [], name: 'Reentrancy' },
  { type: 'error', inputs: [], name: 'TooManyItems' },
  { type: 'error', inputs: [], name: 'TreasuryRotationBlocked' },
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
// GachaTreasuryReader
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTreasuryReaderAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_treasury', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGlobalStats',
    outputs: [
      { name: 'totalDeposited', internalType: 'uint256', type: 'uint256' },
      { name: 'totalClaimed', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPlatformOverviewBatch',
    outputs: [
      { name: 'rarityCounts', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserCardDepositsPage',
    outputs: [
      {
        name: 'deposits',
        internalType: 'struct IGachaTreasuryRead.UserCardDeposit[]',
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
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserDepositedNFTs',
    outputs: [
      {
        name: 'items',
        internalType: 'struct IGachaTreasuryRead.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserDepositedNFTsByCardIdPaginated',
    outputs: [
      {
        name: 'items',
        internalType: 'struct IGachaTreasuryRead.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
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
    name: 'getUserDepositedNFTsPaginated',
    outputs: [
      {
        name: 'items',
        internalType: 'struct IGachaTreasuryRead.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
          { name: 'depositTime', internalType: 'uint256', type: 'uint256' },
          { name: 'receiveTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'total', internalType: 'uint256', type: 'uint256' },
      { name: 'hasMore', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserProfileBatch',
    outputs: [
      { name: 'depositCounts', internalType: 'uint256[]', type: 'uint256[]' },
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
    inputs: [],
    name: 'treasury',
    outputs: [
      {
        name: '',
        internalType: 'contract IGachaTreasuryRead',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  { type: 'error', inputs: [], name: 'InvalidLimit' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IGachaTreasuryRead
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iGachaTreasuryReadAbi = [
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
    inputs: [{ name: 'cardId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cardTotalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNumRarities',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    name: 'getRarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'rarity', internalType: 'uint8', type: 'uint8' }],
    name: 'getTreasuryItems',
    outputs: [
      {
        name: '',
        internalType: 'struct IGachaTreasuryRead.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'rarity', internalType: 'uint8', type: 'uint8' },
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
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'getUserDepositCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelistLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'cardId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'userCardDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'userLifetimeClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'userLifetimeDeposited',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'userLifetimeWithdrawn',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'userTotalDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
// IRedemptionWindow
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRedemptionWindowAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'redemptionWindow',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'feeExemptCollections',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'exempt', internalType: 'bool', type: 'bool' },
    ],
    name: 'setFeeExemption',
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
      { name: 'reason', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'AutoMigrationFailed',
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
        name: 'collection',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'exempt', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'FeeExemptionUpdated',
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
  { type: 'error', inputs: [], name: 'AppraisalNotFound' },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'CardIdMismatch' },
  { type: 'error', inputs: [], name: 'CollectionAlreadyExempt' },
  { type: 'error', inputs: [], name: 'CollectionNotExempt' },
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
  { type: 'error', inputs: [], name: 'InvalidCollection' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
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
  { type: 'error', inputs: [], name: 'Reentrancy' },
  { type: 'error', inputs: [], name: 'TooManyItems' },
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
    inputs: [{ name: 'payload', internalType: 'bytes', type: 'bytes' }],
    name: 'decodeError',
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
    name: 'decodeSuccess',
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
    name: 'PermanentAppraisalFailure',
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
// ProtocolTreasury
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const protocolTreasuryAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'REDEEM_APPRAISAL_MISSING',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REDEEM_EXCEEDS_CAP',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REDEEM_INSUFFICIENT_LIQUIDITY',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REDEEM_OK',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REDEEM_WINDOW_EXPIRED',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
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
    name: 'isRedeemable',
    outputs: [
      { name: 'ok', internalType: 'bool', type: 'bool' },
      { name: 'reason', internalType: 'uint8', type: 'uint8' },
      { name: 'payout', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
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
    inputs: [],
    name: 'maxPayoutBps',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'newBps', internalType: 'uint256', type: 'uint256' }],
    name: 'setMaxPayoutBps',
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
        name: 'oldBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newBps',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'MaxPayoutBpsUpdated',
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
  { type: 'error', inputs: [], name: 'InvalidImplementation' },
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
  { type: 'error', inputs: [], name: 'PayoutExceedsTreasuryCap' },
  { type: 'error', inputs: [], name: 'RedemptionWindowExpired' },
  { type: 'error', inputs: [], name: 'Reentrancy' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"ownershipHandoverExpiresAt"`
 */
export const useReadBaseErc20OwnershipHandoverExpiresAt =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc20Abi,
    functionName: 'ownershipHandoverExpiresAt',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useWriteBaseErc20CancelOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useWriteBaseErc20CompleteOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'completeOwnershipHandover',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useWriteBaseErc20RequestOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc20Abi,
    functionName: 'requestOwnershipHandover',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useSimulateBaseErc20CancelOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useSimulateBaseErc20CompleteOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'completeOwnershipHandover',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc20Abi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useSimulateBaseErc20RequestOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc20Abi,
    functionName: 'requestOwnershipHandover',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"OwnershipHandoverCanceled"`
 */
export const useWatchBaseErc20OwnershipHandoverCanceled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'OwnershipHandoverCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc20Abi}__ and `eventName` set to `"OwnershipHandoverRequested"`
 */
export const useWatchBaseErc20OwnershipHandoverRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc20Abi,
    eventName: 'OwnershipHandoverRequested',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"ownershipHandoverExpiresAt"`
 */
export const useReadBaseErc721OwnershipHandoverExpiresAt =
  /*#__PURE__*/ createUseReadContract({
    abi: baseErc721Abi,
    functionName: 'ownershipHandoverExpiresAt',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useWriteBaseErc721CancelOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useWriteBaseErc721CompleteOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'completeOwnershipHandover',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useWriteBaseErc721RequestOwnershipHandover =
  /*#__PURE__*/ createUseWriteContract({
    abi: baseErc721Abi,
    functionName: 'requestOwnershipHandover',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"cancelOwnershipHandover"`
 */
export const useSimulateBaseErc721CancelOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'cancelOwnershipHandover',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"completeOwnershipHandover"`
 */
export const useSimulateBaseErc721CompleteOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'completeOwnershipHandover',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link baseErc721Abi}__ and `functionName` set to `"requestOwnershipHandover"`
 */
export const useSimulateBaseErc721RequestOwnershipHandover =
  /*#__PURE__*/ createUseSimulateContract({
    abi: baseErc721Abi,
    functionName: 'requestOwnershipHandover',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"OwnershipHandoverCanceled"`
 */
export const useWatchBaseErc721OwnershipHandoverCanceled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'OwnershipHandoverCanceled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link baseErc721Abi}__ and `eventName` set to `"OwnershipHandoverRequested"`
 */
export const useWatchBaseErc721OwnershipHandoverRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: baseErc721Abi,
    eventName: 'OwnershipHandoverRequested',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useReadCardGroupedVaultContract =
  /*#__PURE__*/ createUseReadContract({ abi: cardGroupedVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadCardGroupedVaultUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"accruedYield"`
 */
export const useReadCardGroupedVaultAccruedYield =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'accruedYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadCardGroupedVaultAsset = /*#__PURE__*/ createUseReadContract(
  { abi: cardGroupedVaultAbi, functionName: 'asset' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"cardNodes"`
 */
export const useReadCardGroupedVaultCardNodes =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'cardNodes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"economyManager"`
 */
export const useReadCardGroupedVaultEconomyManager =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'economyManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"getDepositorCardCount"`
 */
export const useReadCardGroupedVaultGetDepositorCardCount =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'getDepositorCardCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"getDepositorCards"`
 */
export const useReadCardGroupedVaultGetDepositorCards =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'getDepositorCards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadCardGroupedVaultNumRarities =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'numRarities',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCardGroupedVaultOwner = /*#__PURE__*/ createUseReadContract(
  { abi: cardGroupedVaultAbi, functionName: 'owner' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadCardGroupedVaultPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pendingYield"`
 */
export const useReadCardGroupedVaultPendingYield =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'pendingYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pendingYieldPaginated"`
 */
export const useReadCardGroupedVaultPendingYieldPaginated =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'pendingYieldPaginated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"positions"`
 */
export const useReadCardGroupedVaultPositions =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'positions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadCardGroupedVaultProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"rarityPools"`
 */
export const useReadCardGroupedVaultRarityPools =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'rarityPools',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"rarityTotalValue"`
 */
export const useReadCardGroupedVaultRarityTotalValue =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'rarityTotalValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"sharesOf"`
 */
export const useReadCardGroupedVaultSharesOf =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'sharesOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"sharesOfPaginated"`
 */
export const useReadCardGroupedVaultSharesOfPaginated =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'sharesOfPaginated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalShares"`
 */
export const useReadCardGroupedVaultTotalShares =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'totalShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalYieldClaimed"`
 */
export const useReadCardGroupedVaultTotalYieldClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'totalYieldClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"totalYieldDistributed"`
 */
export const useReadCardGroupedVaultTotalYieldDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'totalYieldDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadCardGroupedVaultTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: cardGroupedVaultAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useWriteCardGroupedVaultContract =
  /*#__PURE__*/ createUseWriteContract({ abi: cardGroupedVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteCardGroupedVaultClaimYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldForCards"`
 */
export const useWriteCardGroupedVaultClaimYieldForCards =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYieldForCards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldPaginated"`
 */
export const useWriteCardGroupedVaultClaimYieldPaginated =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYieldPaginated',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useWriteCardGroupedVaultDistributeYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteCardGroupedVaultInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useWriteCardGroupedVaultMigrateCardRarity =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'migrateCardRarity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteCardGroupedVaultPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useWriteCardGroupedVaultRegisterCardDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'registerCardDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useWriteCardGroupedVaultRemoveCardDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'removeCardDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCardGroupedVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useWriteCardGroupedVaultSetEconomyManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useWriteCardGroupedVaultSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCardGroupedVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteCardGroupedVaultUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useWriteCardGroupedVaultUpdateCardPrice =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'updateCardPrice',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteCardGroupedVaultUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: cardGroupedVaultAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useSimulateCardGroupedVaultContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: cardGroupedVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateCardGroupedVaultClaimYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldForCards"`
 */
export const useSimulateCardGroupedVaultClaimYieldForCards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYieldForCards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"claimYieldPaginated"`
 */
export const useSimulateCardGroupedVaultClaimYieldPaginated =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'claimYieldPaginated',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"distributeYield"`
 */
export const useSimulateCardGroupedVaultDistributeYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'distributeYield',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateCardGroupedVaultInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"migrateCardRarity"`
 */
export const useSimulateCardGroupedVaultMigrateCardRarity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'migrateCardRarity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateCardGroupedVaultPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"registerCardDeposit"`
 */
export const useSimulateCardGroupedVaultRegisterCardDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'registerCardDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"removeCardDeposit"`
 */
export const useSimulateCardGroupedVaultRemoveCardDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'removeCardDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCardGroupedVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setEconomyManager"`
 */
export const useSimulateCardGroupedVaultSetEconomyManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'setEconomyManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useSimulateCardGroupedVaultSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCardGroupedVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateCardGroupedVaultUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"updateCardPrice"`
 */
export const useSimulateCardGroupedVaultUpdateCardPrice =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'updateCardPrice',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateCardGroupedVaultUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cardGroupedVaultAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__
 */
export const useWatchCardGroupedVaultContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: cardGroupedVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRegistered"`
 */
export const useWatchCardGroupedVaultCardDepositRegistered =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'CardDepositRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardDepositRemoved"`
 */
export const useWatchCardGroupedVaultCardDepositRemoved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'CardDepositRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardPriceUpdated"`
 */
export const useWatchCardGroupedVaultCardPriceUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'CardPriceUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"CardRarityMigrated"`
 */
export const useWatchCardGroupedVaultCardRarityMigrated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'CardRarityMigrated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"EconomyManagerUpdated"`
 */
export const useWatchCardGroupedVaultEconomyManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'EconomyManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchCardGroupedVaultInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCardGroupedVaultOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchCardGroupedVaultPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"TreasuryUpdated"`
 */
export const useWatchCardGroupedVaultTreasuryUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'TreasuryUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchCardGroupedVaultUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchCardGroupedVaultUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchCardGroupedVaultYieldClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'YieldClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"YieldDistributed"`
 */
export const useWatchCardGroupedVaultYieldDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'YieldDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cardGroupedVaultAbi}__ and `eventName` set to `"YieldTrackingFailed"`
 */
export const useWatchCardGroupedVaultYieldTrackingFailed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cardGroupedVaultAbi,
    eventName: 'YieldTrackingFailed',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__
 */
export const useReadGachaContract = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"DEFAULT_PRICING_PREMIUM_BPS"`
 */
export const useReadGachaDefaultPricingPremiumBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'DEFAULT_PRICING_PREMIUM_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"DEFAULT_SPIN_TIMEOUT"`
 */
export const useReadGachaDefaultSpinTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'DEFAULT_SPIN_TIMEOUT',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaNumRarities = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'numRarities',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"spinTimeout"`
 */
export const useReadGachaSpinTimeout = /*#__PURE__*/ createUseReadContract({
  abi: gachaAbi,
  functionName: 'spinTimeout',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinTimeout"`
 */
export const useWriteGachaSetSpinTimeout = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaAbi, functionName: 'setSpinTimeout' },
)

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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"setSpinTimeout"`
 */
export const useSimulateGachaSetSpinTimeout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaAbi,
    functionName: 'setSpinTimeout',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinTimeoutUpdated"`
 */
export const useWatchGachaSpinTimeoutUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinTimeoutUpdated',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"DEFAULT_DEPOSITOR_SHARE_BPS"`
 */
export const useReadGachaEconomyManagerDefaultDepositorShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'DEFAULT_DEPOSITOR_SHARE_BPS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"DEFAULT_PROTOCOL_SHARE_BPS"`
 */
export const useReadGachaEconomyManagerDefaultProtocolShareBps =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'DEFAULT_PROTOCOL_SHARE_BPS',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"cardGroupedVault"`
 */
export const useReadGachaEconomyManagerCardGroupedVault =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'cardGroupedVault',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaEconomyManagerNumRarities =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'numRarities',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"queuedYieldByRarity"`
 */
export const useReadGachaEconomyManagerQueuedYieldByRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'queuedYieldByRarity',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalQueuedYield"`
 */
export const useReadGachaEconomyManagerTotalQueuedYield =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'totalQueuedYield',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `functionName` set to `"totalQueuedYieldReleased"`
 */
export const useReadGachaEconomyManagerTotalQueuedYieldReleased =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaEconomyManagerAbi,
    functionName: 'totalQueuedYieldReleased',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaEconomyManagerAbi}__ and `eventName` set to `"CardGroupedVaultUpdated"`
 */
export const useWatchGachaEconomyManagerCardGroupedVaultUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaEconomyManagerAbi,
    eventName: 'CardGroupedVaultUpdated',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__
 */
export const useReadGachaTimelockContract = /*#__PURE__*/ createUseReadContract(
  { abi: gachaTimelockAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"CANCELLER_ROLE"`
 */
export const useReadGachaTimelockCancellerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'CANCELLER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadGachaTimelockDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"EMERGENCY_ROLE"`
 */
export const useReadGachaTimelockEmergencyRole =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'EMERGENCY_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"EXECUTOR_ROLE"`
 */
export const useReadGachaTimelockExecutorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'EXECUTOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"MIN_DELAY_FLOOR"`
 */
export const useReadGachaTimelockMinDelayFloor =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'MIN_DELAY_FLOOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"PROPOSER_ROLE"`
 */
export const useReadGachaTimelockProposerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'PROPOSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"getMinDelay"`
 */
export const useReadGachaTimelockGetMinDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'getMinDelay',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"getOperationState"`
 */
export const useReadGachaTimelockGetOperationState =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'getOperationState',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadGachaTimelockGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"getTimestamp"`
 */
export const useReadGachaTimelockGetTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'getTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadGachaTimelockHasRole = /*#__PURE__*/ createUseReadContract({
  abi: gachaTimelockAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"hashOperation"`
 */
export const useReadGachaTimelockHashOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'hashOperation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"hashOperationBatch"`
 */
export const useReadGachaTimelockHashOperationBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'hashOperationBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"isOperation"`
 */
export const useReadGachaTimelockIsOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'isOperation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"isOperationDone"`
 */
export const useReadGachaTimelockIsOperationDone =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'isOperationDone',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"isOperationPending"`
 */
export const useReadGachaTimelockIsOperationPending =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'isOperationPending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"isOperationReady"`
 */
export const useReadGachaTimelockIsOperationReady =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'isOperationReady',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadGachaTimelockSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTimelockAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__
 */
export const useWriteGachaTimelockContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaTimelockAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteGachaTimelockCancel = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaTimelockAbi, functionName: 'cancel' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteGachaTimelockExecute =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteGachaTimelockExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"executeProposal"`
 */
export const useWriteGachaTimelockExecuteProposal =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'executeProposal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteGachaTimelockGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteGachaTimelockOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWriteGachaTimelockOnErc1155Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useWriteGachaTimelockOnErc721Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"propose"`
 */
export const useWriteGachaTimelockPropose =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'propose',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteGachaTimelockRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteGachaTimelockRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"schedule"`
 */
export const useWriteGachaTimelockSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'schedule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useWriteGachaTimelockScheduleBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'scheduleBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useWriteGachaTimelockUpdateDelay =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTimelockAbi,
    functionName: 'updateDelay',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__
 */
export const useSimulateGachaTimelockContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaTimelockAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateGachaTimelockCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateGachaTimelockExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateGachaTimelockExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"executeProposal"`
 */
export const useSimulateGachaTimelockExecuteProposal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'executeProposal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateGachaTimelockGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulateGachaTimelockOnErc1155BatchReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulateGachaTimelockOnErc1155Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useSimulateGachaTimelockOnErc721Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"propose"`
 */
export const useSimulateGachaTimelockPropose =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'propose',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateGachaTimelockRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateGachaTimelockRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"schedule"`
 */
export const useSimulateGachaTimelockSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'schedule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useSimulateGachaTimelockScheduleBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'scheduleBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTimelockAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useSimulateGachaTimelockUpdateDelay =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTimelockAbi,
    functionName: 'updateDelay',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__
 */
export const useWatchGachaTimelockContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaTimelockAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"CallExecuted"`
 */
export const useWatchGachaTimelockCallExecuted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'CallExecuted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"CallSalt"`
 */
export const useWatchGachaTimelockCallSalt =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'CallSalt',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"CallScheduled"`
 */
export const useWatchGachaTimelockCallScheduled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'CallScheduled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"Cancelled"`
 */
export const useWatchGachaTimelockCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'Cancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"MinDelayChange"`
 */
export const useWatchGachaTimelockMinDelayChange =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'MinDelayChange',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchGachaTimelockRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchGachaTimelockRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTimelockAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchGachaTimelockRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTimelockAbi,
    eventName: 'RoleRevoked',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"cardCurrentRarity"`
 */
export const useReadGachaTreasuryCardCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'cardCurrentRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"cardGroupedVault"`
 */
export const useReadGachaTreasuryCardGroupedVault =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'cardGroupedVault',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTRedemptionDeadline"`
 */
export const useReadGachaTreasuryGetNftRedemptionDeadline =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getNFTRedemptionDeadline',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNFTRedemptionPriceSnapshot"`
 */
export const useReadGachaTreasuryGetNftRedemptionPriceSnapshot =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getNFTRedemptionPriceSnapshot',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getNumRarities"`
 */
export const useReadGachaTreasuryGetNumRarities =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getNumRarities',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityName"`
 */
export const useReadGachaTreasuryGetRarityName =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getRarityName',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getRarityNames"`
 */
export const useReadGachaTreasuryGetRarityNames =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getRarityNames',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"maxDepositsPerCard"`
 */
export const useReadGachaTreasuryMaxDepositsPerCard =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'maxDepositsPerCard',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"minDepositAppraisalUSD"`
 */
export const useReadGachaTreasuryMinDepositAppraisalUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'minDepositAppraisalUSD',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftRedemptionDeadlines"`
 */
export const useReadGachaTreasuryNftRedemptionDeadlines =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftRedemptionDeadlines',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nftRedemptionPriceSnapshots"`
 */
export const useReadGachaTreasuryNftRedemptionPriceSnapshots =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nftRedemptionPriceSnapshots',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"numRarities"`
 */
export const useReadGachaTreasuryNumRarities =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'numRarities',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rarityCount"`
 */
export const useReadGachaTreasuryRarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'rarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"rarityNames"`
 */
export const useReadGachaTreasuryRarityNames =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'rarityNames',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"yieldClaimDecimalScalar"`
 */
export const useReadGachaTreasuryYieldClaimDecimalScalar =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'yieldClaimDecimalScalar',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useWriteGachaTreasuryBatchMigrateNftRarity =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchMigrateNFTRarity',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onCardPriceUpdated"`
 */
export const useWriteGachaTreasuryOnCardPriceUpdated =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'onCardPriceUpdated',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setCardGroupedVault"`
 */
export const useWriteGachaTreasurySetCardGroupedVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setCardGroupedVault',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMaxDepositsPerCard"`
 */
export const useWriteGachaTreasurySetMaxDepositsPerCard =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setMaxDepositsPerCard',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMinDepositAppraisalUSD"`
 */
export const useWriteGachaTreasurySetMinDepositAppraisalUsd =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setMinDepositAppraisalUSD',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setYieldClaimDecimalScalar"`
 */
export const useWriteGachaTreasurySetYieldClaimDecimalScalar =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setYieldClaimDecimalScalar',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useSimulateGachaTreasuryBatchMigrateNftRarity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchMigrateNFTRarity',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"onCardPriceUpdated"`
 */
export const useSimulateGachaTreasuryOnCardPriceUpdated =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'onCardPriceUpdated',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setCardGroupedVault"`
 */
export const useSimulateGachaTreasurySetCardGroupedVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setCardGroupedVault',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMaxDepositsPerCard"`
 */
export const useSimulateGachaTreasurySetMaxDepositsPerCard =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setMaxDepositsPerCard',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setMinDepositAppraisalUSD"`
 */
export const useSimulateGachaTreasurySetMinDepositAppraisalUsd =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setMinDepositAppraisalUSD',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setYieldClaimDecimalScalar"`
 */
export const useSimulateGachaTreasurySetYieldClaimDecimalScalar =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setYieldClaimDecimalScalar',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"CardGroupedVaultUpdated"`
 */
export const useWatchGachaTreasuryCardGroupedVaultUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'CardGroupedVaultUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchGachaTreasuryInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"MaxDepositsPerCardUpdated"`
 */
export const useWatchGachaTreasuryMaxDepositsPerCardUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'MaxDepositsPerCardUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"MinDepositAppraisalUpdated"`
 */
export const useWatchGachaTreasuryMinDepositAppraisalUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'MinDepositAppraisalUpdated',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"RedemptionPriceSnapshotted"`
 */
export const useWatchGachaTreasuryRedemptionPriceSnapshotted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'RedemptionPriceSnapshotted',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"YieldClaimDecimalScalarUpdated"`
 */
export const useWatchGachaTreasuryYieldClaimDecimalScalarUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'YieldClaimDecimalScalarUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"YieldClaimRecorded"`
 */
export const useWatchGachaTreasuryYieldClaimRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'YieldClaimRecorded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__
 */
export const useReadGachaTreasuryReaderContract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaTreasuryReaderAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getGlobalStats"`
 */
export const useReadGachaTreasuryReaderGetGlobalStats =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getGlobalStats',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getPlatformOverviewBatch"`
 */
export const useReadGachaTreasuryReaderGetPlatformOverviewBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getPlatformOverviewBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getUserCardDepositsPage"`
 */
export const useReadGachaTreasuryReaderGetUserCardDepositsPage =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getUserCardDepositsPage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getUserDepositedNFTs"`
 */
export const useReadGachaTreasuryReaderGetUserDepositedNfTs =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getUserDepositedNFTs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getUserDepositedNFTsByCardIdPaginated"`
 */
export const useReadGachaTreasuryReaderGetUserDepositedNfTsByCardIdPaginated =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getUserDepositedNFTsByCardIdPaginated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getUserDepositedNFTsPaginated"`
 */
export const useReadGachaTreasuryReaderGetUserDepositedNfTsPaginated =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getUserDepositedNFTsPaginated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"getUserProfileBatch"`
 */
export const useReadGachaTreasuryReaderGetUserProfileBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'getUserProfileBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryReaderAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasuryReaderTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryReaderAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__
 */
export const useReadIGachaTreasuryReadContract =
  /*#__PURE__*/ createUseReadContract({ abi: iGachaTreasuryReadAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadIGachaTreasuryReadAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'appraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"cardTotalDeposits"`
 */
export const useReadIGachaTreasuryReadCardTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'cardTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getNumRarities"`
 */
export const useReadIGachaTreasuryReadGetNumRarities =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getNumRarities',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getRarityCount"`
 */
export const useReadIGachaTreasuryReadGetRarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getRarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getTreasuryItems"`
 */
export const useReadIGachaTreasuryReadGetTreasuryItems =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getTreasuryItems',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getUserCardIds"`
 */
export const useReadIGachaTreasuryReadGetUserCardIds =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getUserCardIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getUserCardIdsLength"`
 */
export const useReadIGachaTreasuryReadGetUserCardIdsLength =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getUserCardIdsLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getUserDepositCount"`
 */
export const useReadIGachaTreasuryReadGetUserDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getUserDepositCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"getWhitelistLength"`
 */
export const useReadIGachaTreasuryReadGetWhitelistLength =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'getWhitelistLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"globalLifetimeClaimed"`
 */
export const useReadIGachaTreasuryReadGlobalLifetimeClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'globalLifetimeClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"globalLifetimeDeposited"`
 */
export const useReadIGachaTreasuryReadGlobalLifetimeDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'globalLifetimeDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"userCardDeposits"`
 */
export const useReadIGachaTreasuryReadUserCardDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'userCardDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"userLifetimeClaimed"`
 */
export const useReadIGachaTreasuryReadUserLifetimeClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'userLifetimeClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"userLifetimeDeposited"`
 */
export const useReadIGachaTreasuryReadUserLifetimeDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'userLifetimeDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"userLifetimeWithdrawn"`
 */
export const useReadIGachaTreasuryReadUserLifetimeWithdrawn =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'userLifetimeWithdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iGachaTreasuryReadAbi}__ and `functionName` set to `"userTotalDeposits"`
 */
export const useReadIGachaTreasuryReadUserTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: iGachaTreasuryReadAbi,
    functionName: 'userTotalDeposits',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRedemptionWindowAbi}__
 */
export const useReadIRedemptionWindowContract =
  /*#__PURE__*/ createUseReadContract({ abi: iRedemptionWindowAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRedemptionWindowAbi}__ and `functionName` set to `"redemptionWindow"`
 */
export const useReadIRedemptionWindowRedemptionWindow =
  /*#__PURE__*/ createUseReadContract({
    abi: iRedemptionWindowAbi,
    functionName: 'redemptionWindow',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"feeExemptCollections"`
 */
export const useReadNftAppraisalFeeExemptCollections =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'feeExemptCollections',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeExemption"`
 */
export const useWriteNftAppraisalSetFeeExemption =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setFeeExemption',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setFeeExemption"`
 */
export const useSimulateNftAppraisalSetFeeExemption =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setFeeExemption',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"AutoMigrationFailed"`
 */
export const useWatchNftAppraisalAutoMigrationFailed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'AutoMigrationFailed',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"FeeExemptionUpdated"`
 */
export const useWatchNftAppraisalFeeExemptionUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'FeeExemptionUpdated',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"checkAppraisal"`
 */
export const useReadNftAppraisalServiceHandlerCheckAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'checkAppraisal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"decodeError"`
 */
export const useReadNftAppraisalServiceHandlerDecodeError =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'decodeError',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `functionName` set to `"decodeSuccess"`
 */
export const useReadNftAppraisalServiceHandlerDecodeSuccess =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalServiceHandlerAbi,
    functionName: 'decodeSuccess',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"PermanentAppraisalFailure"`
 */
export const useWatchNftAppraisalServiceHandlerPermanentAppraisalFailure =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'PermanentAppraisalFailure',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__
 */
export const useReadProtocolTreasuryContract =
  /*#__PURE__*/ createUseReadContract({ abi: protocolTreasuryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEEM_APPRAISAL_MISSING"`
 */
export const useReadProtocolTreasuryRedeemAppraisalMissing =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEEM_APPRAISAL_MISSING',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEEM_EXCEEDS_CAP"`
 */
export const useReadProtocolTreasuryRedeemExceedsCap =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEEM_EXCEEDS_CAP',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEEM_INSUFFICIENT_LIQUIDITY"`
 */
export const useReadProtocolTreasuryRedeemInsufficientLiquidity =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEEM_INSUFFICIENT_LIQUIDITY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEEM_OK"`
 */
export const useReadProtocolTreasuryRedeemOk =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEEM_OK',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"REDEEM_WINDOW_EXPIRED"`
 */
export const useReadProtocolTreasuryRedeemWindowExpired =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'REDEEM_WINDOW_EXPIRED',
  })

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"isRedeemable"`
 */
export const useReadProtocolTreasuryIsRedeemable =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'isRedeemable',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"maxPayoutBps"`
 */
export const useReadProtocolTreasuryMaxPayoutBps =
  /*#__PURE__*/ createUseReadContract({
    abi: protocolTreasuryAbi,
    functionName: 'maxPayoutBps',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setMaxPayoutBps"`
 */
export const useWriteProtocolTreasurySetMaxPayoutBps =
  /*#__PURE__*/ createUseWriteContract({
    abi: protocolTreasuryAbi,
    functionName: 'setMaxPayoutBps',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `functionName` set to `"setMaxPayoutBps"`
 */
export const useSimulateProtocolTreasurySetMaxPayoutBps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: protocolTreasuryAbi,
    functionName: 'setMaxPayoutBps',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link protocolTreasuryAbi}__ and `eventName` set to `"MaxPayoutBpsUpdated"`
 */
export const useWatchProtocolTreasuryMaxPayoutBpsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: protocolTreasuryAbi,
    eventName: 'MaxPayoutBpsUpdated',
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
