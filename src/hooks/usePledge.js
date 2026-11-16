import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { signReceipt } from '../lib/receiptUrl'

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

      // 3. A short-lived link to the private receipt (admins only)
      const { url, error: receiptError } = await signReceipt(pledge.receipt_path)
      return { pledge, receiptUrl: url ?? null, receiptError: receiptError ?? null }
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
