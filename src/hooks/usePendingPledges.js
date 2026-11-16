import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Ask Supabase for every PENDING pledge, oldest first
// (the donor who has waited longest is at the top).
// "wishlist_items(name, unit_price)" is an embed: because
// pledges.wishlist_item_id points at wishlist_items, Supabase attaches
// that item to each pledge in the same request.
function fetchPendingPledges() {
  return supabase
    .from('pledges')
    .select('id, donor_name, donor_email, qty, created_at, wishlist_items(name, unit_price)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
}

const LOAD_ERROR = "Couldn't load donations. Check your connection and try again."

// Hook for the admin "Donations waiting" page.
// Returns { pledges, loading, error, reload }.
export function usePendingPledges() {
  const [pledges, setPledges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyResult = useCallback(({ data, error }) => {
    if (error) {
      setError(LOAD_ERROR)
    } else {
      setPledges(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  // Load once when the page opens; ignore the answer if the admin left already
  useEffect(() => {
    let ignore = false
    fetchPendingPledges().then((result) => {
      if (!ignore) applyResult(result)
    })
    return () => {
      ignore = true
    }
  }, [applyResult])

  // Fetch again without blanking the list (used by "Try again")
  const reload = useCallback(async () => {
    applyResult(await fetchPendingPledges())
  }, [applyResult])

  return { pledges, loading, error, reload }
}
