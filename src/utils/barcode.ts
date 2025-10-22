export function generateBarcode(membershipId?: string, type: 'borrow' | 'return' = 'borrow'): string {
  // Generate barcode dari membershipId dan counter
  // Format Borrow: BC-MEM000001-001
  // Format Return: RET-MEM000001-001
  
  const prefix = type === 'return' ? 'RET' : 'BC';
  
  if (membershipId) {
    // Extract number from membership ID (e.g., "MEM-000001" -> "000001")
    const memberNumber = membershipId.replace(/\D/g, '');
    const counter = Date.now().toString().slice(-3);
    return `${prefix}-MEM${memberNumber}-${counter}`;
  }
  
  // Fallback jika tidak ada membershipId
  const timestamp = Date.now().toString().slice(-8);
  return `${prefix}-GUEST-${timestamp}`;
}
