import { supabase } from './supabase'

// How long a receipt link works, in seconds. Short on purpose:
// the bucket is private and the link is like a temporary key.
const RECEIPT_LINK_SECONDS = 600 // 10 minutes

// Make a temporary link to a file in the private 'receipts' bucket.
// Only admins may read that bucket (storage policy "Admin reads receipts").
// Returns { url } or { error } with a message for the admin.
export async function signReceipt(path) {
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, RECEIPT_LINK_SECONDS)
  if (error) return { error: "Couldn't load the receipt. Refresh the page to try again." }
  return { url: data.signedUrl }
}
