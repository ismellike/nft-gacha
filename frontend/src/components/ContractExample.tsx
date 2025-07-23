import { useReadContract, useWriteContract } from 'wagmi'
import { gachaAbi, gachaTreasuryAbi } from '../generated'

export function ContractExample() {
  // Example: Reading from Gacha contract
  const { data: totalWeight } = useReadContract({
    abi: gachaAbi,
    address: process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'TOTAL_WEIGHT',
  })

  // Example: Reading common weight
  const { data: commonWeight } = useReadContract({
    abi: gachaAbi,
    address: process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'commonWeight',
  })

  // Example: Reading treasury info
  const { data: treasuryItems } = useReadContract({
    abi: gachaTreasuryAbi,
    address: process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getTreasuryItems',
    args: [0], // Common rarity
  })

  // Example: Write contract function - spin the gacha
  const { writeContract } = useWriteContract()

  const spinGacha = () => {
    writeContract({
      abi: gachaAbi,
      address: process.env.NEXT_PUBLIC_GACHA_CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'spin',
    })
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">NFT Gacha Contract Example</h3>
      
      <div className="space-y-2">
        <p>Total Weight: {totalWeight?.toString()}</p>
        <p>Common Weight: {commonWeight?.toString()}</p>
        <p>Treasury Items (Common): {treasuryItems?.length || 0}</p>
        
        <button 
          onClick={spinGacha}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Spin Gacha
        </button>
      </div>
    </div>
  )
}