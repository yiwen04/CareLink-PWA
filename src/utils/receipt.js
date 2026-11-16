// Rules for transfer receipts. Keep in sync with the 'receipts' bucket
// settings in supabase/migrations/20261116_pledge_receipts.sql.
export const RECEIPT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

// Returns an error message, or null if the file is OK
export function validateReceipt(file) {
  if (!file) return null
  if (!RECEIPT_TYPES[file.type]) return 'Please choose a JPG, PNG, WEBP image or a PDF.'
  if (file.size > RECEIPT_MAX_BYTES) return 'This file is too large. Please choose one under 5 MB.'
  return null
}

// Is a stored receipt a PDF? (Then the admin gets a link, not a picture.)
// Looks at the file ending, e.g. "pledges/abc/receipt.pdf" → true
export function isPdfReceipt(path) {
  return typeof path === 'string' && path.toLowerCase().endsWith('.pdf')
}

// Where the file is stored inside the bucket, e.g. pledges/<pledge id>/receipt.jpg
export function receiptPath(pledgeId, file) {
  return `pledges/${pledgeId}/receipt.${RECEIPT_TYPES[file.type]}`
}
