/**
 * Utility for Thai language specific formatting
 */

export function amountToThaiWords(amount: number): string {
  // Simplistic implementation for demonstration
  // Real implementaton should handle decimals and full grammar
  const baht = Math.floor(amount);
  const satang = Math.round((amount - baht) * 100);
  
  if (satang === 0) return `${baht.toLocaleString()} บาทถ้วน`;
  return `${baht.toLocaleString()} บาท ${satang} สตางค์`;
}
