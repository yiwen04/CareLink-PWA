import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// How long a receipt link works, in seconds. Short on purpose:
// the bucket is private and the link is like a temporary key.
const RECEIPT_LINK_SECONDS = 600 // 10 minutes

// Load ONE pledge (any status) with its wish list item, plus a
// temporary link to its receipt if there is one.
// Returns { pledge, receiptUrl, receiptError, loading, loadError }.
export function usePledge(id) {
  const [state, setState] = useState({
    pledge: null,
    receiptUrl: null,
    receiptError: null,
    loading: true,
    loadError: null,
  })

  useEffect(() => {
    let ignore = false // stop updates if the admin leaves mid-load

    async function load() {
      // 1. The pledge + its item (embed via wishlist_item_id)
      const { data: pledge, error } = await supabase
        .from('pledges')
        .select(
          'id, donor_name, donor_email, donor_phone, qty, status, receipt_path, created_at, ' +
            'wishlist_items(name, unit_price, pledged_qty, target_qty)'
        )
        .eq('id', id)
        .maybeSingle() // 0 rows → null instead of an error

      if (error || !pledge) {
        // A badly formed id also lands here (Postgres can't read it as a uuid)
        return {
          loadError:
            error && error.code !== '22P02'
              ? "Couldn't load this donation. Check your connection and try again."
              : 'This donation was not found.',
        }
      }

      // 2. No receipt? Done.
      if (!pledge.receipt_path) return { pledge }

      // 3. Ask Storage for a short-lived link. Only admins are allowed to
      //    read the private 'receipts' bucket (see the receipts migration).
      const { data: signed, error: signError } = await supabase.storage
        .from('receipts')
        .createSignedUrl(pledge.receipt_path, RECEIPT_LINK_SECONDS)

      return signError
        ? { pledge, receiptError: "Couldn't load the receipt. Refresh the page to try again." }
        : { pledge, receiptUrl: signed.signedUrl }
    }

    load().then((result) => {
      if (!ignore) {
        setState({ pledge: null, receiptUrl: null, receiptError: null, loadError: null, ...result, loading: false })
      }
    })

    return () => {
      ignore = true
    }
  }, [id])

  return state
}
