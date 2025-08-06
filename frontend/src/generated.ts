import {
  createUseReadContract,
  createUseWatchContractEvent,
  createUseWriteContract,
  createUseSimulateContract,
} from 'wagmi/codegen'

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
// ERC20Mock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20MockAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
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
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'AlreadyFulfilled' },
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
// GachaConfig
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaConfigAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_owner', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllPriceRanges',
    outputs: [
      {
        name: 'ranges',
        internalType: 'struct GachaConfig.PriceRange[5]',
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
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaConfig.Rarity',
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
        internalType: 'enum GachaConfig.Rarity',
        type: 'uint8',
      },
    ],
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
      { name: '', internalType: 'enum GachaConfig.Rarity', type: 'uint8' },
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
        internalType: 'enum GachaConfig.Rarity',
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
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'validatePriceRanges',
    outputs: [{ name: 'isValid', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
        name: 'rarity',
        internalType: 'enum GachaConfig.Rarity',
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
  { type: 'error', inputs: [], name: 'InvalidPriceRange' },
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
      { name: '_protocolAddress', internalType: 'address', type: 'address' },
      { name: '_feeToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
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
    name: 'PROTOCOL_PERCENTAGE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'REWARDS_PERCENTAGE',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimAllRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deployAllRarityTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'totalFeeAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'distributeSpinRewards',
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
    inputs: [],
    name: 'gachaContract',
    outputs: [{ name: '', internalType: 'contract Gacha', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllRarityTokens',
    outputs: [
      { name: 'tokens', internalType: 'address[5]', type: 'address[5]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getGlobalAnalytics',
    outputs: [
      { name: 'totalSpins', internalType: 'uint256', type: 'uint256' },
      { name: 'totalFees', internalType: 'uint256', type: 'uint256' },
      { name: 'protocolFees', internalType: 'uint256', type: 'uint256' },
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
    name: 'getRarityToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserAnalytics',
    outputs: [
      { name: 'totalClaimed', internalType: 'uint256', type: 'uint256' },
      { name: 'totalClaimable', internalType: 'uint256', type: 'uint256' },
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
    name: 'getUserRarityClaimableRewards',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserTotalClaimableRewards',
    outputs: [
      { name: 'totalClaimable', internalType: 'uint256', type: 'uint256' },
    ],
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
    name: 'protocolAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'rarityMultipliers',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasury.Rarity', type: 'uint8' },
    ],
    name: 'rarityTokens',
    outputs: [
      {
        name: '',
        internalType: 'contract RarityDividendTracker',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'recordApprovedDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'depositor', internalType: 'address', type: 'address' },
      { name: 'rarity', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'recordNFTWon',
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
      { name: 'multiplierBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setRarityMultiplier',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalFeesDistributed',
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
    name: 'treasuryContract',
    outputs: [
      { name: '', internalType: 'contract GachaTreasury', type: 'address' },
    ],
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userTotalRewardsClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: true,
      },
    ],
    name: 'DepositRecorded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'totalAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rewardsAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'protocolAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeesDistributed',
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
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: true,
      },
    ],
    name: 'NFTWonRecorded',
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RarityFundsDistributed',
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
        name: 'tokenAddress',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RarityTokenDeployed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'SpinRecorded',
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
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UserRewardsClaimed',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidProtocolAddress' },
  { type: 'error', inputs: [], name: 'InvalidTreasuryContract' },
  { type: 'error', inputs: [], name: 'InvalidWeights' },
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
  { type: 'error', inputs: [], name: 'TokenNotDeployed' },
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
// GachaServiceHandlerV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaServiceHandlerV2Abi = [
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'indices', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'batchWithdrawNFT',
    outputs: [],
    stateMutability: 'nonpayable',
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
    ],
    name: 'userDepositCounts',
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawNFT',
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
// GachaTreasuryV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaTreasuryV2Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_gachaContract', internalType: 'address', type: 'address' },
      { name: '_appraisalContract', internalType: 'address', type: 'address' },
      { name: '_configContract', internalType: 'address', type: 'address' },
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
    name: 'batchMigrateNFTRarity',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'configContract',
    outputs: [
      { name: '', internalType: 'contract GachaConfig', type: 'address' },
    ],
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
    name: 'getAllRarityCounts',
    outputs: [
      { name: 'counts', internalType: 'uint256[5]', type: 'uint256[5]' },
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
      { name: '', internalType: 'enum GachaTreasuryV2.Rarity', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'rarity',
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getRarityCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTreasuryItem',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaTreasuryV2.NFTItem',
        type: 'tuple',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasuryV2.Rarity',
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
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getTreasuryItems',
    outputs: [
      {
        name: '',
        internalType: 'struct GachaTreasuryV2.NFTItem[]',
        type: 'tuple[]',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasuryV2.Rarity',
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
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
    ],
    name: 'getUserDepositCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getUserTotalDepositCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelistedCollections',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'collection', internalType: 'address', type: 'address' }],
    name: 'isCollectionWhitelisted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isGachaAvailable',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
      { name: '', internalType: 'enum GachaTreasuryV2.Rarity', type: 'uint8' },
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
      { name: '', internalType: 'enum GachaTreasuryV2.Rarity', type: 'uint8' },
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
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'sendNFTToWinner',
    outputs: [
      {
        name: 'item',
        internalType: 'struct GachaTreasuryV2.NFTItem',
        type: 'tuple',
        components: [
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'depositor', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'appraisedPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'rarity',
            internalType: 'enum GachaTreasuryV2.Rarity',
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
      { name: '_configContract', internalType: 'address', type: 'address' },
    ],
    name: 'setConfigContract',
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
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'enum GachaTreasuryV2.Rarity', type: 'uint8' },
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
        internalType: 'enum GachaTreasuryV2.Rarity',
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
      { name: '', internalType: 'enum GachaTreasuryV2.Rarity', type: 'uint8' },
    ],
    name: 'userDepositCounts',
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawNFT',
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
        name: 'oldConfig',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newConfig',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ConfigContractUpdated',
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
        internalType: 'enum GachaTreasuryV2.Rarity',
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
        internalType: 'enum GachaTreasuryV2.Rarity',
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
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'newRarity',
        internalType: 'enum GachaTreasuryV2.Rarity',
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
  { type: 'error', inputs: [], name: 'CollectionAlreadyWhitelisted' },
  { type: 'error', inputs: [], name: 'CollectionNotInWhitelist' },
  { type: 'error', inputs: [], name: 'CollectionNotWhitelisted' },
  { type: 'error', inputs: [], name: 'EmptyArrays' },
  { type: 'error', inputs: [], name: 'EmptyWhitelist' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidAppraisalContract' },
  { type: 'error', inputs: [], name: 'InvalidCollectionAddress' },
  { type: 'error', inputs: [], name: 'InvalidConfigContract' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidIndex' },
  { type: 'error', inputs: [], name: 'InvalidNFTContract' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidRewardsManager' },
  { type: 'error', inputs: [], name: 'NFTAlreadyDeposited' },
  { type: 'error', inputs: [], name: 'NFTNotAppraised' },
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
  { type: 'error', inputs: [], name: 'RarityMigrationFailed' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'TooManyItems' },
  { type: 'error', inputs: [], name: 'UnauthorizedGachaContract' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GachaV2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gachaV2Abi = [
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
      { name: '', internalType: 'contract GachaTreasuryV2', type: 'address' },
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
        internalType: 'enum GachaTreasuryV2.Rarity',
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
        name: 'selectedRarity',
        internalType: 'enum GachaTreasuryV2.Rarity',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'AlreadyFulfilled' },
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
        internalType: 'enum GachaTreasuryV2.Rarity',
        type: 'uint8',
      },
    ],
    name: 'NoNFTsAvailable',
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
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'appraisals',
    outputs: [
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'oracle', internalType: 'address', type: 'address' }],
    name: 'authorizeOracle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'authorizedOracles',
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
    inputs: [],
    name: 'getAuthorizedOracles',
    outputs: [
      { name: 'oracles', internalType: 'address[]', type: 'address[]' },
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
    inputs: [{ name: 'oracle', internalType: 'address', type: 'address' }],
    name: 'isAuthorizedOracle',
    outputs: [{ name: 'isAuthorized', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'oracleList',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'overrideAppraisal',
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
    inputs: [{ name: 'oracle', internalType: 'address', type: 'address' }],
    name: 'revokeOracle',
    outputs: [],
    stateMutability: 'nonpayable',
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
      { name: 'priceUSD', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setAppraisedPrice',
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
    ],
    name: 'AppraisalRequested',
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
        name: 'oracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OracleAuthorized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oracle',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OracleRevoked',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  { type: 'error', inputs: [], name: 'AppraisalAlreadyExists' },
  { type: 'error', inputs: [], name: 'AppraisalFeeRequired' },
  { type: 'error', inputs: [], name: 'AppraisalNotFound' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FeePaymentFailed' },
  { type: 'error', inputs: [], name: 'InvalidCollection' },
  { type: 'error', inputs: [], name: 'InvalidFeeToken' },
  { type: 'error', inputs: [], name: 'InvalidPrice' },
  { type: 'error', inputs: [], name: 'InvalidProtocolAddress' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidTokenId' },
  { type: 'error', inputs: [], name: 'NoFeesToWithdraw' },
  { type: 'error', inputs: [], name: 'OracleAlreadyAuthorized' },
  { type: 'error', inputs: [], name: 'OracleNotAuthorized' },
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
  { type: 'error', inputs: [], name: 'UnauthorizedOracle' },
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
        name: 'requestId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'AppraisalDataReceived',
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
    ],
    name: 'AppraisalProcessed',
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
// RarityDividendTracker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const rarityDividendTrackerAbi = [
  {
    type: 'constructor',
    inputs: [
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
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidAddress' },
  { type: 'error', inputs: [], name: 'InvalidAmount' },
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
// SimpleERC721
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const simpleErc721Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
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
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'batchMint',
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
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
// TestToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const testTokenAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'owner_', internalType: 'address', type: 'address' },
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
    inputs: [],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'mintToSelf',
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
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__
 */
export const useReadErc20MockContract = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20MockAllowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20MockBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20MockDecimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"name"`
 */
export const useReadErc20MockName = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20MockSymbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20MockTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20MockAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__
 */
export const useWriteErc20MockContract = /*#__PURE__*/ createUseWriteContract({
  abi: erc20MockAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20MockApprove = /*#__PURE__*/ createUseWriteContract({
  abi: erc20MockAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteErc20MockBurn = /*#__PURE__*/ createUseWriteContract({
  abi: erc20MockAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteErc20MockMint = /*#__PURE__*/ createUseWriteContract({
  abi: erc20MockAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20MockTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20MockAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20MockTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: erc20MockAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__
 */
export const useSimulateErc20MockContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: erc20MockAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20MockApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20MockAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateErc20MockBurn = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20MockAbi, functionName: 'burn' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateErc20MockMint = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20MockAbi, functionName: 'mint' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20MockTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20MockAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20MockAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20MockTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20MockAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20MockAbi}__
 */
export const useWatchErc20MockContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: erc20MockAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20MockAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20MockApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20MockAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20MockAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20MockTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20MockAbi,
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"SpinRefunded"`
 */
export const useWatchGachaSpinRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaAbi,
    eventName: 'SpinRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaUnpaused = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaAbi,
  eventName: 'Unpaused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__
 */
export const useReadGachaConfigContract = /*#__PURE__*/ createUseReadContract({
  abi: gachaConfigAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"getAllPriceRanges"`
 */
export const useReadGachaConfigGetAllPriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaConfigAbi,
    functionName: 'getAllPriceRanges',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"getPriceRange"`
 */
export const useReadGachaConfigGetPriceRange =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaConfigAbi,
    functionName: 'getPriceRange',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"getRarityByPrice"`
 */
export const useReadGachaConfigGetRarityByPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaConfigAbi,
    functionName: 'getRarityByPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaConfigOwner = /*#__PURE__*/ createUseReadContract({
  abi: gachaConfigAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"priceRanges"`
 */
export const useReadGachaConfigPriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaConfigAbi,
    functionName: 'priceRanges',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"validatePriceRanges"`
 */
export const useReadGachaConfigValidatePriceRanges =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaConfigAbi,
    functionName: 'validatePriceRanges',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaConfigAbi}__
 */
export const useWriteGachaConfigContract = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaConfigAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaConfigRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaConfigAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"setPriceRange"`
 */
export const useWriteGachaConfigSetPriceRange =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaConfigAbi,
    functionName: 'setPriceRange',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaConfigTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaConfigAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaConfigAbi}__
 */
export const useSimulateGachaConfigContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaConfigAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaConfigRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaConfigAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"setPriceRange"`
 */
export const useSimulateGachaConfigSetPriceRange =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaConfigAbi,
    functionName: 'setPriceRange',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaConfigAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaConfigTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaConfigAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaConfigAbi}__
 */
export const useWatchGachaConfigContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaConfigAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaConfigAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaConfigOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaConfigAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaConfigAbi}__ and `eventName` set to `"PriceRangeUpdated"`
 */
export const useWatchGachaConfigPriceRangeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaConfigAbi,
    eventName: 'PriceRangeUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useReadGachaRewardsManagerContract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"PERCENTAGE_DENOMINATOR"`
 */
export const useReadGachaRewardsManagerPercentageDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'PERCENTAGE_DENOMINATOR',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"REWARDS_PERCENTAGE"`
 */
export const useReadGachaRewardsManagerRewardsPercentage =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'REWARDS_PERCENTAGE',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"gachaContract"`
 */
export const useReadGachaRewardsManagerGachaContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'gachaContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getAllRarityTokens"`
 */
export const useReadGachaRewardsManagerGetAllRarityTokens =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getAllRarityTokens',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getGlobalAnalytics"`
 */
export const useReadGachaRewardsManagerGetGlobalAnalytics =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getGlobalAnalytics',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getRarityToken"`
 */
export const useReadGachaRewardsManagerGetRarityToken =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getRarityToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getUserAnalytics"`
 */
export const useReadGachaRewardsManagerGetUserAnalytics =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getUserAnalytics',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getUserRarityClaimableRewards"`
 */
export const useReadGachaRewardsManagerGetUserRarityClaimableRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getUserRarityClaimableRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"getUserTotalClaimableRewards"`
 */
export const useReadGachaRewardsManagerGetUserTotalClaimableRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'getUserTotalClaimableRewards',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"rarityMultipliers"`
 */
export const useReadGachaRewardsManagerRarityMultipliers =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'rarityMultipliers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"rarityTokens"`
 */
export const useReadGachaRewardsManagerRarityTokens =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'rarityTokens',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalFeesDistributed"`
 */
export const useReadGachaRewardsManagerTotalFeesDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalFeesDistributed',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"totalSpinCount"`
 */
export const useReadGachaRewardsManagerTotalSpinCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'totalSpinCount',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"userSpinCount"`
 */
export const useReadGachaRewardsManagerUserSpinCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'userSpinCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"userTotalRewardsClaimed"`
 */
export const useReadGachaRewardsManagerUserTotalRewardsClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'userTotalRewardsClaimed',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useWriteGachaRewardsManagerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"claimAllRewards"`
 */
export const useWriteGachaRewardsManagerClaimAllRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'claimAllRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"deployAllRarityTokens"`
 */
export const useWriteGachaRewardsManagerDeployAllRarityTokens =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'deployAllRarityTokens',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"distributeSpinRewards"`
 */
export const useWriteGachaRewardsManagerDistributeSpinRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'distributeSpinRewards',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"recordApprovedDeposit"`
 */
export const useWriteGachaRewardsManagerRecordApprovedDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'recordApprovedDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"recordNFTWon"`
 */
export const useWriteGachaRewardsManagerRecordNftWon =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'recordNFTWon',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useWriteGachaRewardsManagerSetProtocolAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setRarityMultiplier"`
 */
export const useWriteGachaRewardsManagerSetRarityMultiplier =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setRarityMultiplier',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useSimulateGachaRewardsManagerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"claimAllRewards"`
 */
export const useSimulateGachaRewardsManagerClaimAllRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'claimAllRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"deployAllRarityTokens"`
 */
export const useSimulateGachaRewardsManagerDeployAllRarityTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'deployAllRarityTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"distributeSpinRewards"`
 */
export const useSimulateGachaRewardsManagerDistributeSpinRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'distributeSpinRewards',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"recordApprovedDeposit"`
 */
export const useSimulateGachaRewardsManagerRecordApprovedDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'recordApprovedDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"recordNFTWon"`
 */
export const useSimulateGachaRewardsManagerRecordNftWon =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'recordNFTWon',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setProtocolAddress"`
 */
export const useSimulateGachaRewardsManagerSetProtocolAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setProtocolAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `functionName` set to `"setRarityMultiplier"`
 */
export const useSimulateGachaRewardsManagerSetRarityMultiplier =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaRewardsManagerAbi,
    functionName: 'setRarityMultiplier',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__
 */
export const useWatchGachaRewardsManagerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaRewardsManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"DepositRecorded"`
 */
export const useWatchGachaRewardsManagerDepositRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'DepositRecorded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"FeesDistributed"`
 */
export const useWatchGachaRewardsManagerFeesDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'FeesDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"NFTWonRecorded"`
 */
export const useWatchGachaRewardsManagerNftWonRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'NFTWonRecorded',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"RarityFundsDistributed"`
 */
export const useWatchGachaRewardsManagerRarityFundsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'RarityFundsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"RarityTokenDeployed"`
 */
export const useWatchGachaRewardsManagerRarityTokenDeployed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'RarityTokenDeployed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"SpinRecorded"`
 */
export const useWatchGachaRewardsManagerSpinRecorded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'SpinRecorded',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaRewardsManagerAbi}__ and `eventName` set to `"UserRewardsClaimed"`
 */
export const useWatchGachaRewardsManagerUserRewardsClaimed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaRewardsManagerAbi,
    eventName: 'UserRewardsClaimed',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__
 */
export const useReadGachaServiceHandlerV2Contract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaServiceHandlerV2Abi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `functionName` set to `"getGacha"`
 */
export const useReadGachaServiceHandlerV2GetGacha =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerV2Abi,
    functionName: 'getGacha',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `functionName` set to `"getGachaTreasury"`
 */
export const useReadGachaServiceHandlerV2GetGachaTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerV2Abi,
    functionName: 'getGachaTreasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `functionName` set to `"getServiceManager"`
 */
export const useReadGachaServiceHandlerV2GetServiceManager =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaServiceHandlerV2Abi,
    functionName: 'getServiceManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__
 */
export const useWriteGachaServiceHandlerV2Contract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaServiceHandlerV2Abi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useWriteGachaServiceHandlerV2HandleSignedEnvelope =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaServiceHandlerV2Abi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__
 */
export const useSimulateGachaServiceHandlerV2Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaServiceHandlerV2Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `functionName` set to `"handleSignedEnvelope"`
 */
export const useSimulateGachaServiceHandlerV2HandleSignedEnvelope =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaServiceHandlerV2Abi,
    functionName: 'handleSignedEnvelope',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__
 */
export const useWatchGachaServiceHandlerV2Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaServiceHandlerV2Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaServiceHandlerV2Abi}__ and `eventName` set to `"RandomnessReceived"`
 */
export const useWatchGachaServiceHandlerV2RandomnessReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaServiceHandlerV2Abi,
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadGachaTreasuryAppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'appraisalContract',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserDepositCount"`
 */
export const useReadGachaTreasuryGetUserDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserDepositCount',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userDepositCounts"`
 */
export const useReadGachaTreasuryUserDepositCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userDepositCounts',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchWithdrawNFT"`
 */
export const useWriteGachaTreasuryBatchWithdrawNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchWithdrawNFT',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawNFT"`
 */
export const useWriteGachaTreasuryWithdrawNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'withdrawNFT',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"batchWithdrawNFT"`
 */
export const useSimulateGachaTreasuryBatchWithdrawNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'batchWithdrawNFT',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"withdrawNFT"`
 */
export const useSimulateGachaTreasuryWithdrawNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'withdrawNFT',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__
 */
export const useReadGachaTreasuryV2Contract =
  /*#__PURE__*/ createUseReadContract({ abi: gachaTreasuryV2Abi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"MAX_BATCH_DEPOSIT"`
 */
export const useReadGachaTreasuryV2MaxBatchDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'MAX_BATCH_DEPOSIT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"MAX_BATCH_WITHDRAW"`
 */
export const useReadGachaTreasuryV2MaxBatchWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'MAX_BATCH_WITHDRAW',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"appraisalContract"`
 */
export const useReadGachaTreasuryV2AppraisalContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'appraisalContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"configContract"`
 */
export const useReadGachaTreasuryV2ConfigContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'configContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"depositedNFTs"`
 */
export const useReadGachaTreasuryV2DepositedNfTs =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'depositedNFTs',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"gachaContract"`
 */
export const useReadGachaTreasuryV2GachaContract =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'gachaContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getAllRarityCounts"`
 */
export const useReadGachaTreasuryV2GetAllRarityCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getAllRarityCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getNFTCurrentRarity"`
 */
export const useReadGachaTreasuryV2GetNftCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getNFTCurrentRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getRarityCount"`
 */
export const useReadGachaTreasuryV2GetRarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getRarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getTotalItemsCount"`
 */
export const useReadGachaTreasuryV2GetTotalItemsCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getTotalItemsCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getTreasuryItem"`
 */
export const useReadGachaTreasuryV2GetTreasuryItem =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getTreasuryItem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getTreasuryItems"`
 */
export const useReadGachaTreasuryV2GetTreasuryItems =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getTreasuryItems',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getUserAllDepositCounts"`
 */
export const useReadGachaTreasuryV2GetUserAllDepositCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getUserAllDepositCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getUserDepositCount"`
 */
export const useReadGachaTreasuryV2GetUserDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getUserDepositCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getUserTotalDepositCount"`
 */
export const useReadGachaTreasuryV2GetUserTotalDepositCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getUserTotalDepositCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"getWhitelistedCollections"`
 */
export const useReadGachaTreasuryV2GetWhitelistedCollections =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'getWhitelistedCollections',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"isCollectionWhitelisted"`
 */
export const useReadGachaTreasuryV2IsCollectionWhitelisted =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'isCollectionWhitelisted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"isGachaAvailable"`
 */
export const useReadGachaTreasuryV2IsGachaAvailable =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'isGachaAvailable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"isNFTDeposited"`
 */
export const useReadGachaTreasuryV2IsNftDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'isNFTDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"nftCurrentRarity"`
 */
export const useReadGachaTreasuryV2NftCurrentRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'nftCurrentRarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"nftToTreasuryIndex"`
 */
export const useReadGachaTreasuryV2NftToTreasuryIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'nftToTreasuryIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadGachaTreasuryV2OnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaTreasuryV2Owner = /*#__PURE__*/ createUseReadContract({
  abi: gachaTreasuryV2Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaTreasuryV2Paused = /*#__PURE__*/ createUseReadContract(
  { abi: gachaTreasuryV2Abi, functionName: 'paused' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"rarityCount"`
 */
export const useReadGachaTreasuryV2RarityCount =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'rarityCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaTreasuryV2Treasury =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"treasuryRewardsManager"`
 */
export const useReadGachaTreasuryV2TreasuryRewardsManager =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'treasuryRewardsManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"userDepositCounts"`
 */
export const useReadGachaTreasuryV2UserDepositCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'userDepositCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"userTotalDeposits"`
 */
export const useReadGachaTreasuryV2UserTotalDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'userTotalDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"whitelistedCollections"`
 */
export const useReadGachaTreasuryV2WhitelistedCollections =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'whitelistedCollections',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"whitelistedCollectionsList"`
 */
export const useReadGachaTreasuryV2WhitelistedCollectionsList =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'whitelistedCollectionsList',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__
 */
export const useWriteGachaTreasuryV2Contract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaTreasuryV2Abi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useWriteGachaTreasuryV2AddToWhitelist =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'addToWhitelist',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useWriteGachaTreasuryV2BatchMigrateNftRarity =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'batchMigrateNFTRarity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"depositNFT"`
 */
export const useWriteGachaTreasuryV2DepositNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'depositNFT',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaTreasuryV2EmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaTreasuryV2EmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useWriteGachaTreasuryV2MigrateNftRarity =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'migrateNFTRarity',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useWriteGachaTreasuryV2RemoveFromWhitelist =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'removeFromWhitelist',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaTreasuryV2RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"sendNFTToWinner"`
 */
export const useWriteGachaTreasuryV2SendNftToWinner =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'sendNFTToWinner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useWriteGachaTreasuryV2SetAppraisalContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setAppraisalContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setConfigContract"`
 */
export const useWriteGachaTreasuryV2SetConfigContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setConfigContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setGachaContract"`
 */
export const useWriteGachaTreasuryV2SetGachaContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setTreasuryRewardsManager"`
 */
export const useWriteGachaTreasuryV2SetTreasuryRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setTreasuryRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaTreasuryV2TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"withdrawNFT"`
 */
export const useWriteGachaTreasuryV2WithdrawNft =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'withdrawNFT',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__
 */
export const useSimulateGachaTreasuryV2Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaTreasuryV2Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"addToWhitelist"`
 */
export const useSimulateGachaTreasuryV2AddToWhitelist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'addToWhitelist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"batchMigrateNFTRarity"`
 */
export const useSimulateGachaTreasuryV2BatchMigrateNftRarity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'batchMigrateNFTRarity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"depositNFT"`
 */
export const useSimulateGachaTreasuryV2DepositNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'depositNFT',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaTreasuryV2EmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaTreasuryV2EmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"migrateNFTRarity"`
 */
export const useSimulateGachaTreasuryV2MigrateNftRarity =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'migrateNFTRarity',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"removeFromWhitelist"`
 */
export const useSimulateGachaTreasuryV2RemoveFromWhitelist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'removeFromWhitelist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaTreasuryV2RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"sendNFTToWinner"`
 */
export const useSimulateGachaTreasuryV2SendNftToWinner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'sendNFTToWinner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setAppraisalContract"`
 */
export const useSimulateGachaTreasuryV2SetAppraisalContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setAppraisalContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setConfigContract"`
 */
export const useSimulateGachaTreasuryV2SetConfigContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setConfigContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setGachaContract"`
 */
export const useSimulateGachaTreasuryV2SetGachaContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setGachaContract',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"setTreasuryRewardsManager"`
 */
export const useSimulateGachaTreasuryV2SetTreasuryRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'setTreasuryRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaTreasuryV2TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `functionName` set to `"withdrawNFT"`
 */
export const useSimulateGachaTreasuryV2WithdrawNft =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryV2Abi,
    functionName: 'withdrawNFT',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__
 */
export const useWatchGachaTreasuryV2Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaTreasuryV2Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"AppraisalContractUpdated"`
 */
export const useWatchGachaTreasuryV2AppraisalContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'AppraisalContractUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"CollectionRemovedFromWhitelist"`
 */
export const useWatchGachaTreasuryV2CollectionRemovedFromWhitelist =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'CollectionRemovedFromWhitelist',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"CollectionWhitelisted"`
 */
export const useWatchGachaTreasuryV2CollectionWhitelisted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'CollectionWhitelisted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"ConfigContractUpdated"`
 */
export const useWatchGachaTreasuryV2ConfigContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'ConfigContractUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"GachaContractUpdated"`
 */
export const useWatchGachaTreasuryV2GachaContractUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'GachaContractUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"NFTDeposited"`
 */
export const useWatchGachaTreasuryV2NftDeposited =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'NFTDeposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"NFTWithdrawn"`
 */
export const useWatchGachaTreasuryV2NftWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'NFTWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaTreasuryV2OwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaTreasuryV2Paused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"RarityMigrated"`
 */
export const useWatchGachaTreasuryV2RarityMigrated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'RarityMigrated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"RewardsManagerUpdated"`
 */
export const useWatchGachaTreasuryV2RewardsManagerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'RewardsManagerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryV2Abi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaTreasuryV2Unpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryV2Abi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__
 */
export const useReadGachaV2Contract = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"TOTAL_WEIGHT"`
 */
export const useReadGachaV2TotalWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'TOTAL_WEIGHT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"commonWeight"`
 */
export const useReadGachaV2CommonWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'commonWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"epicWeight"`
 */
export const useReadGachaV2EpicWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'epicWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"feeToken"`
 */
export const useReadGachaV2FeeToken = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'feeToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"gachaServiceHandler"`
 */
export const useReadGachaV2GachaServiceHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'gachaServiceHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getAverageRarityValues"`
 */
export const useReadGachaV2GetAverageRarityValues =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'getAverageRarityValues',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getRarityWeights"`
 */
export const useReadGachaV2GetRarityWeights =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'getRarityWeights',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getSpinRequest"`
 */
export const useReadGachaV2GetSpinRequest = /*#__PURE__*/ createUseReadContract(
  { abi: gachaV2Abi, functionName: 'getSpinRequest' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getTotalValueLocked"`
 */
export const useReadGachaV2GetTotalValueLocked =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'getTotalValueLocked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getTreasuryAddress"`
 */
export const useReadGachaV2GetTreasuryAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'getTreasuryAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"getTreasuryDistribution"`
 */
export const useReadGachaV2GetTreasuryDistribution =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'getTreasuryDistribution',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"legendaryWeight"`
 */
export const useReadGachaV2LegendaryWeight =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaV2Abi,
    functionName: 'legendaryWeight',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"owner"`
 */
export const useReadGachaV2Owner = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"paused"`
 */
export const useReadGachaV2Paused = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"rareWeight"`
 */
export const useReadGachaV2RareWeight = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'rareWeight',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"rewardsManager"`
 */
export const useReadGachaV2RewardsManager = /*#__PURE__*/ createUseReadContract(
  { abi: gachaV2Abi, functionName: 'rewardsManager' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spinFee"`
 */
export const useReadGachaV2SpinFee = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'spinFee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spinRequests"`
 */
export const useReadGachaV2SpinRequests = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'spinRequests',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"treasury"`
 */
export const useReadGachaV2Treasury = /*#__PURE__*/ createUseReadContract({
  abi: gachaV2Abi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"uncommonWeight"`
 */
export const useReadGachaV2UncommonWeight = /*#__PURE__*/ createUseReadContract(
  { abi: gachaV2Abi, functionName: 'uncommonWeight' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__
 */
export const useWriteGachaV2Contract = /*#__PURE__*/ createUseWriteContract({
  abi: gachaV2Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteGachaV2EmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteGachaV2EmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useWriteGachaV2FulfillRandomness =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteGachaV2RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setFeeToken"`
 */
export const useWriteGachaV2SetFeeToken = /*#__PURE__*/ createUseWriteContract({
  abi: gachaV2Abi,
  functionName: 'setFeeToken',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useWriteGachaV2SetGachaServiceHandler =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setRarityWeights"`
 */
export const useWriteGachaV2SetRarityWeights =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'setRarityWeights',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useWriteGachaV2SetRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setSpinFee"`
 */
export const useWriteGachaV2SetSpinFee = /*#__PURE__*/ createUseWriteContract({
  abi: gachaV2Abi,
  functionName: 'setSpinFee',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spin"`
 */
export const useWriteGachaV2Spin = /*#__PURE__*/ createUseWriteContract({
  abi: gachaV2Abi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useWriteGachaV2SpinWithPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'spinWithPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteGachaV2TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaV2Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"withdrawFees"`
 */
export const useWriteGachaV2WithdrawFees = /*#__PURE__*/ createUseWriteContract(
  { abi: gachaV2Abi, functionName: 'withdrawFees' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__
 */
export const useSimulateGachaV2Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: gachaV2Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateGachaV2EmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateGachaV2EmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"fulfillRandomness"`
 */
export const useSimulateGachaV2FulfillRandomness =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'fulfillRandomness',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateGachaV2RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setFeeToken"`
 */
export const useSimulateGachaV2SetFeeToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'setFeeToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setGachaServiceHandler"`
 */
export const useSimulateGachaV2SetGachaServiceHandler =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'setGachaServiceHandler',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setRarityWeights"`
 */
export const useSimulateGachaV2SetRarityWeights =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'setRarityWeights',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useSimulateGachaV2SetRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"setSpinFee"`
 */
export const useSimulateGachaV2SetSpinFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'setSpinFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spin"`
 */
export const useSimulateGachaV2Spin = /*#__PURE__*/ createUseSimulateContract({
  abi: gachaV2Abi,
  functionName: 'spin',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"spinWithPermit"`
 */
export const useSimulateGachaV2SpinWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'spinWithPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateGachaV2TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaV2Abi}__ and `functionName` set to `"withdrawFees"`
 */
export const useSimulateGachaV2WithdrawFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaV2Abi,
    functionName: 'withdrawFees',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__
 */
export const useWatchGachaV2Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gachaV2Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"EmergencyPause"`
 */
export const useWatchGachaV2EmergencyPause =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'EmergencyPause',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"EmergencyUnpause"`
 */
export const useWatchGachaV2EmergencyUnpause =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'EmergencyUnpause',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchGachaV2FeeTokenUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'FeeTokenUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"FeeUpdated"`
 */
export const useWatchGachaV2FeeUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'FeeUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"GachaServiceHandlerUpdated"`
 */
export const useWatchGachaV2GachaServiceHandlerUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'GachaServiceHandlerUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchGachaV2OwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"Paused"`
 */
export const useWatchGachaV2Paused = /*#__PURE__*/ createUseWatchContractEvent({
  abi: gachaV2Abi,
  eventName: 'Paused',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"RandomnessRequested"`
 */
export const useWatchGachaV2RandomnessRequested =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'RandomnessRequested',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"RarityWeightsUpdated"`
 */
export const useWatchGachaV2RarityWeightsUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'RarityWeightsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"RewardsDistributed"`
 */
export const useWatchGachaV2RewardsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'RewardsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"SpinCompleted"`
 */
export const useWatchGachaV2SpinCompleted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'SpinCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"SpinRefunded"`
 */
export const useWatchGachaV2SpinRefunded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
    eventName: 'SpinRefunded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaV2Abi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchGachaV2Unpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaV2Abi,
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockNftAppraisalAbi}__ and `functionName` set to `"hasAppraisal"`
 */
export const useReadMockNftAppraisalHasAppraisal =
  /*#__PURE__*/ createUseReadContract({
    abi: mockNftAppraisalAbi,
    functionName: 'hasAppraisal',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"appraisals"`
 */
export const useReadNftAppraisalAppraisals =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'appraisals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"authorizedOracles"`
 */
export const useReadNftAppraisalAuthorizedOracles =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'authorizedOracles',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"getAuthorizedOracles"`
 */
export const useReadNftAppraisalGetAuthorizedOracles =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'getAuthorizedOracles',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"isAuthorizedOracle"`
 */
export const useReadNftAppraisalIsAuthorizedOracle =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'isAuthorizedOracle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"oracleList"`
 */
export const useReadNftAppraisalOracleList =
  /*#__PURE__*/ createUseReadContract({
    abi: nftAppraisalAbi,
    functionName: 'oracleList',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useWriteNftAppraisalContract =
  /*#__PURE__*/ createUseWriteContract({ abi: nftAppraisalAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"authorizeOracle"`
 */
export const useWriteNftAppraisalAuthorizeOracle =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'authorizeOracle',
  })

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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"overrideAppraisal"`
 */
export const useWriteNftAppraisalOverrideAppraisal =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'overrideAppraisal',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"revokeOracle"`
 */
export const useWriteNftAppraisalRevokeOracle =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'revokeOracle',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisedPrice"`
 */
export const useWriteNftAppraisalSetAppraisedPrice =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisedPrice',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteNftAppraisalTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: nftAppraisalAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__
 */
export const useSimulateNftAppraisalContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: nftAppraisalAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"authorizeOracle"`
 */
export const useSimulateNftAppraisalAuthorizeOracle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'authorizeOracle',
  })

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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"overrideAppraisal"`
 */
export const useSimulateNftAppraisalOverrideAppraisal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'overrideAppraisal',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"revokeOracle"`
 */
export const useSimulateNftAppraisalRevokeOracle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'revokeOracle',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"setAppraisedPrice"`
 */
export const useSimulateNftAppraisalSetAppraisedPrice =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'setAppraisedPrice',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link nftAppraisalAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateNftAppraisalTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: nftAppraisalAbi,
    functionName: 'transferOwnership',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"FeeTokenUpdated"`
 */
export const useWatchNftAppraisalFeeTokenUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'FeeTokenUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"OracleAuthorized"`
 */
export const useWatchNftAppraisalOracleAuthorized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'OracleAuthorized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalAbi}__ and `eventName` set to `"OracleRevoked"`
 */
export const useWatchNftAppraisalOracleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalAbi,
    eventName: 'OracleRevoked',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link nftAppraisalServiceHandlerAbi}__ and `eventName` set to `"AppraisalDataReceived"`
 */
export const useWatchNftAppraisalServiceHandlerAppraisalDataReceived =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: nftAppraisalServiceHandlerAbi,
    eventName: 'AppraisalDataReceived',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__
 */
export const useReadRarityDividendTrackerContract =
  /*#__PURE__*/ createUseReadContract({ abi: rarityDividendTrackerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"accumulativeFundsOf"`
 */
export const useReadRarityDividendTrackerAccumulativeFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'accumulativeFundsOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"fundsToken"`
 */
export const useReadRarityDividendTrackerFundsToken =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'fundsToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"getTotalFundsDistributed"`
 */
export const useReadRarityDividendTrackerGetTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'getTotalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadRarityDividendTrackerOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadRarityDividendTrackerPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"rarity"`
 */
export const useReadRarityDividendTrackerRarity =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'rarity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"rewardsManager"`
 */
export const useReadRarityDividendTrackerRewardsManager =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'rewardsManager',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"totalFundsDistributed"`
 */
export const useReadRarityDividendTrackerTotalFundsDistributed =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'totalFundsDistributed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadRarityDividendTrackerTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'treasury',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"withdrawableFundsOf"`
 */
export const useReadRarityDividendTrackerWithdrawableFundsOf =
  /*#__PURE__*/ createUseReadContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'withdrawableFundsOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__
 */
export const useWriteRarityDividendTrackerContract =
  /*#__PURE__*/ createUseWriteContract({ abi: rarityDividendTrackerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useWriteRarityDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useWriteRarityDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useWriteRarityDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useWriteRarityDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteRarityDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useWriteRarityDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteRarityDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useWriteRarityDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useWriteRarityDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseWriteContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__
 */
export const useSimulateRarityDividendTrackerContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: rarityDividendTrackerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"distributeFunds"`
 */
export const useSimulateRarityDividendTrackerDistributeFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'distributeFunds',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"emergencyPause"`
 */
export const useSimulateRarityDividendTrackerEmergencyPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'emergencyPause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"emergencyUnpause"`
 */
export const useSimulateRarityDividendTrackerEmergencyUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'emergencyUnpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"recoverToken"`
 */
export const useSimulateRarityDividendTrackerRecoverToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'recoverToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateRarityDividendTrackerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"setRewardsManager"`
 */
export const useSimulateRarityDividendTrackerSetRewardsManager =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'setRewardsManager',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateRarityDividendTrackerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"updateCorrection"`
 */
export const useSimulateRarityDividendTrackerUpdateCorrection =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'updateCorrection',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `functionName` set to `"withdrawFunds"`
 */
export const useSimulateRarityDividendTrackerWithdrawFunds =
  /*#__PURE__*/ createUseSimulateContract({
    abi: rarityDividendTrackerAbi,
    functionName: 'withdrawFunds',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__
 */
export const useWatchRarityDividendTrackerContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: rarityDividendTrackerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `eventName` set to `"FundsDistributed"`
 */
export const useWatchRarityDividendTrackerFundsDistributed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityDividendTrackerAbi,
    eventName: 'FundsDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `eventName` set to `"FundsWithdrawn"`
 */
export const useWatchRarityDividendTrackerFundsWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityDividendTrackerAbi,
    eventName: 'FundsWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchRarityDividendTrackerOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityDividendTrackerAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchRarityDividendTrackerPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityDividendTrackerAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link rarityDividendTrackerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchRarityDividendTrackerUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: rarityDividendTrackerAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__
 */
export const useReadSimpleErc721Contract = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadSimpleErc721BalanceOf = /*#__PURE__*/ createUseReadContract(
  { abi: simpleErc721Abi, functionName: 'balanceOf' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"getApproved"`
 */
export const useReadSimpleErc721GetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: simpleErc721Abi,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadSimpleErc721IsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: simpleErc721Abi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"name"`
 */
export const useReadSimpleErc721Name = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"owner"`
 */
export const useReadSimpleErc721Owner = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadSimpleErc721OwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadSimpleErc721SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: simpleErc721Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadSimpleErc721Symbol = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadSimpleErc721TokenUri = /*#__PURE__*/ createUseReadContract({
  abi: simpleErc721Abi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadSimpleErc721TotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: simpleErc721Abi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__
 */
export const useWriteSimpleErc721Contract =
  /*#__PURE__*/ createUseWriteContract({ abi: simpleErc721Abi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteSimpleErc721Approve = /*#__PURE__*/ createUseWriteContract(
  { abi: simpleErc721Abi, functionName: 'approve' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useWriteSimpleErc721BatchMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'batchMint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteSimpleErc721Mint = /*#__PURE__*/ createUseWriteContract({
  abi: simpleErc721Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteSimpleErc721RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteSimpleErc721SafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteSimpleErc721SetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteSimpleErc721TransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteSimpleErc721TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: simpleErc721Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__
 */
export const useSimulateSimpleErc721Contract =
  /*#__PURE__*/ createUseSimulateContract({ abi: simpleErc721Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateSimpleErc721Approve =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"batchMint"`
 */
export const useSimulateSimpleErc721BatchMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'batchMint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateSimpleErc721Mint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateSimpleErc721RenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateSimpleErc721SafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateSimpleErc721SetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateSimpleErc721TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link simpleErc721Abi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateSimpleErc721TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: simpleErc721Abi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link simpleErc721Abi}__
 */
export const useWatchSimpleErc721Contract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: simpleErc721Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link simpleErc721Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchSimpleErc721Approval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: simpleErc721Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link simpleErc721Abi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchSimpleErc721ApprovalForAll =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: simpleErc721Abi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link simpleErc721Abi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchSimpleErc721OwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: simpleErc721Abi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link simpleErc721Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchSimpleErc721Transfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: simpleErc721Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__
 */
export const useReadTestTokenContract = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadTestTokenDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: testTokenAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadTestTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadTestTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadTestTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadTestTokenEip712Domain = /*#__PURE__*/ createUseReadContract(
  { abi: testTokenAbi, functionName: 'eip712Domain' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadTestTokenName = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadTestTokenNonces = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"owner"`
 */
export const useReadTestTokenOwner = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadTestTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadTestTokenTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: testTokenAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__
 */
export const useWriteTestTokenContract = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteTestTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"faucet"`
 */
export const useWriteTestTokenFaucet = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  functionName: 'faucet',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteTestTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mintToSelf"`
 */
export const useWriteTestTokenMintToSelf = /*#__PURE__*/ createUseWriteContract(
  { abi: testTokenAbi, functionName: 'mintToSelf' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteTestTokenPermit = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteTestTokenRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteTestTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: testTokenAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteTestTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteTestTokenTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: testTokenAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__
 */
export const useSimulateTestTokenContract =
  /*#__PURE__*/ createUseSimulateContract({ abi: testTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateTestTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"faucet"`
 */
export const useSimulateTestTokenFaucet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'faucet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateTestTokenMint = /*#__PURE__*/ createUseSimulateContract(
  { abi: testTokenAbi, functionName: 'mint' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"mintToSelf"`
 */
export const useSimulateTestTokenMintToSelf =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'mintToSelf',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateTestTokenPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateTestTokenRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateTestTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateTestTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link testTokenAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateTestTokenTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: testTokenAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__
 */
export const useWatchTestTokenContract =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: testTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchTestTokenApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchTestTokenEip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchTestTokenOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link testTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchTestTokenTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: testTokenAbi,
    eventName: 'Transfer',
  })
