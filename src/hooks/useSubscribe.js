import { useCallback, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { subscriptionReceiptPath } from '../utils/receipt'

const SEND_ERROR = 'We could not send your details. Please try again.'
const UPLOAD_ERROR = 'We could not upload your receipt. Please try again, or choose a different file.'

// Send a Kids Hero subscription: upload the receipt, then save a PENDING row.
// Visitors can't read subscriptions back (RLS), so we create the id here with
// crypto.randomUUID() instead of asking the database for it.
//
// Retry-safe: if "Try again" is pressed after a failure, we reuse the same id,
// and skip the upload when that same file was already uploaded. So a retry
// never creates two subscriptions or two copies of the receipt.
//
// Returns { submit, submitting, submitError }.
export function useSubscribe() {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  // Remembers the current attempt between retries: { id, file, path }
  const attempt = useRef(null)

  // row: { tier_id, amount, donor_name, donor_email, donor_phone }
  // receipt: the File the donor chose.
  // Returns the new subscription id, or null if it failed.
  const submit = useCallback(async (row, receipt) => {
    setSubmitting(true)
    setSubmitError(null)

    // A different file than last time (or the first try) → start a fresh attempt
    if (!attempt.current || attempt.current.file !== receipt) {
      attempt.current = { id: crypto.randomUUID(), file: receipt, path: null }
    }
    const current = attempt.current

    // 1. Upload the receipt (skipped on retry if it already worked)
    if (!current.path) {
      const path = subscriptionReceiptPath(current.id, receipt)
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, receipt, { contentType: receipt.type, upsert: false })
      if (uploadError) {
        setSubmitting(false)
        setSubmitError(UPLOAD_ERROR)
        return null
      }
      current.path = path
    }

    // 2. Save the subscription as pending. No .select() afterwards:
    //    visitors may insert but not read (RLS).
    const { error } = await supabase.from('subscriptions').insert({
      id: current.id,
      ...row,
      receipt_path: current.path,
    })

    // 23505 = "this id already exists": an earlier try was actually saved but
    // the answer got lost (e.g. the connection dropped). Treat it as success.
    if (error && error.code !== '23505') {
      setSubmitting(false)
      setSubmitError(SEND_ERROR)
      return null
    }

    setSubmitting(false)
    attempt.current = null // done; a new checkout starts fresh
    return current.id
  }, [])

  return { submit, submitting, submitError }
}
