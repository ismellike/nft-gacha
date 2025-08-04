export function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const quotient = amount / divisor
  const remainder = amount % divisor
  
  if (remainder === BigInt(0)) {
    return quotient.toString()
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmedRemainder = remainderStr.replace(/0+$/, '')
  
  if (trimmedRemainder === '') {
    return quotient.toString()
  }
  
  return `${quotient}.${trimmedRemainder}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}