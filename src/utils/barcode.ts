export function generateBarcode(userId: string): string {
  // Generate barcode dari userId dan timestamp
  // Format: USR + last 4 digit user ID + timestamp
  const userPart = userId.slice(-4).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  return `USR${userPart}${timestamp}`;
}
