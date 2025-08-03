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
    name: 'getTreasuryAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [
      { name: 'pendingId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'finalRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'approvePendingDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collections', internalType: 'address[]', type: 'address[]' },
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'rarities',
        internalType: 'enum GachaTreasury.Rarity[]',
        type: 'uint8[]',
      },
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
      { name: 'pendingId', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'denyPendingDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
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
    inputs: [{ name: 'pendingId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPendingDeposit',
    outputs: [
      {
        name: 'deposit',
        internalType: 'struct GachaTreasury.PendingDeposit',
        type: 'tuple',
        components: [
          { name: 'depositor', internalType: 'address', type: 'address' },
          {
            name: 'proposedRarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          {
            name: 'status',
            internalType: 'enum GachaTreasury.PendingDepositStatus',
            type: 'uint8',
          },
          { name: 'collection', internalType: 'address', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getPendingDepositIds',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
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
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
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
    name: 'getUserPendingDeposits',
    outputs: [
      { name: 'userPendingIds', internalType: 'uint256[]', type: 'uint256[]' },
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
    name: 'nextPendingId',
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
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingDepositIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingDeposits',
    outputs: [
      { name: 'depositor', internalType: 'address', type: 'address' },
      {
        name: 'proposedRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      {
        name: 'status',
        internalType: 'enum GachaTreasury.PendingDepositStatus',
        type: 'uint8',
      },
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
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
          {
            name: 'rarity',
            internalType: 'enum GachaTreasury.Rarity',
            type: 'uint8',
          },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
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
    inputs: [
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      {
        name: 'proposedRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
    ],
    name: 'submitPendingDeposit',
    outputs: [{ name: 'pendingId', internalType: 'uint256', type: 'uint256' }],
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
      {
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
      },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
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
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userPendingDeposits',
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
        name: 'rarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
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
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
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
        name: 'pendingId',
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
        name: 'finalRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PendingDepositApproved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingId',
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
        name: 'reason',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'PendingDepositDenied',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'pendingId',
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
        name: 'proposedRarity',
        internalType: 'enum GachaTreasury.Rarity',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'PendingDepositSubmitted',
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
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'CannotDepositSameNFTTwice' },
  { type: 'error', inputs: [], name: 'EmptyArrays' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'InvalidCollectionAddress' },
  { type: 'error', inputs: [], name: 'InvalidGachaContract' },
  { type: 'error', inputs: [], name: 'InvalidIndex' },
  { type: 'error', inputs: [], name: 'InvalidNFTContract' },
  { type: 'error', inputs: [], name: 'InvalidRecipient' },
  { type: 'error', inputs: [], name: 'InvalidRewardsManager' },
  { type: 'error', inputs: [], name: 'NFTAlreadyDeposited' },
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
  { type: 'error', inputs: [], name: 'PendingDepositAlreadyProcessed' },
  { type: 'error', inputs: [], name: 'PendingDepositNotFound' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaAbi}__ and `functionName` set to `"getTreasuryAddress"`
 */
export const useReadGachaGetTreasuryAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaAbi,
    functionName: 'getTreasuryAddress',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getAllRarityCounts"`
 */
export const useReadGachaTreasuryGetAllRarityCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getAllRarityCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPendingDeposit"`
 */
export const useReadGachaTreasuryGetPendingDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getPendingDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getPendingDepositIds"`
 */
export const useReadGachaTreasuryGetPendingDepositIds =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getPendingDepositIds',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"getUserPendingDeposits"`
 */
export const useReadGachaTreasuryGetUserPendingDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'getUserPendingDeposits',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"isNFTDeposited"`
 */
export const useReadGachaTreasuryIsNftDeposited =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'isNFTDeposited',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"nextPendingId"`
 */
export const useReadGachaTreasuryNextPendingId =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'nextPendingId',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"pendingDepositIds"`
 */
export const useReadGachaTreasuryPendingDepositIds =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'pendingDepositIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"pendingDeposits"`
 */
export const useReadGachaTreasuryPendingDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'pendingDeposits',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"userPendingDeposits"`
 */
export const useReadGachaTreasuryUserPendingDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: gachaTreasuryAbi,
    functionName: 'userPendingDeposits',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__
 */
export const useWriteGachaTreasuryContract =
  /*#__PURE__*/ createUseWriteContract({ abi: gachaTreasuryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"approvePendingDeposit"`
 */
export const useWriteGachaTreasuryApprovePendingDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'approvePendingDeposit',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"denyPendingDeposit"`
 */
export const useWriteGachaTreasuryDenyPendingDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'denyPendingDeposit',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useWriteGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"submitPendingDeposit"`
 */
export const useWriteGachaTreasurySubmitPendingDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: gachaTreasuryAbi,
    functionName: 'submitPendingDeposit',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"approvePendingDeposit"`
 */
export const useSimulateGachaTreasuryApprovePendingDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'approvePendingDeposit',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"denyPendingDeposit"`
 */
export const useSimulateGachaTreasuryDenyPendingDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'denyPendingDeposit',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"setGachaContract"`
 */
export const useSimulateGachaTreasurySetGachaContract =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'setGachaContract',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `functionName` set to `"submitPendingDeposit"`
 */
export const useSimulateGachaTreasurySubmitPendingDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gachaTreasuryAbi,
    functionName: 'submitPendingDeposit',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"PendingDepositApproved"`
 */
export const useWatchGachaTreasuryPendingDepositApproved =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'PendingDepositApproved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"PendingDepositDenied"`
 */
export const useWatchGachaTreasuryPendingDepositDenied =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'PendingDepositDenied',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gachaTreasuryAbi}__ and `eventName` set to `"PendingDepositSubmitted"`
 */
export const useWatchGachaTreasuryPendingDepositSubmitted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gachaTreasuryAbi,
    eventName: 'PendingDepositSubmitted',
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
