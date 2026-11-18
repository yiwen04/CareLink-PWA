import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { sortPending } from '../utils/pledgeLimits'

// Ask Supabase for every PENDING pledge, plus the totals (needed / confirmed)
// of every active item so each card can say "Needed X / Confirmed Y".
// "wishlist_items(name, unit_price)" is an embed: because
// pledges.wishlist_item_id points at wishlist_items, Supabase attaches
// that item to each pledge in the same request.
function fetchPendingPledges() {
  return Promise.all([
    supabase
      .from('pledges')
      .select(
        'id, donor_name, donor_email, qty, status, receipt_path, allow_general_fund, wishlist_item_id, created_at, ' +
          'wishlist_items(name, unit_price)'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase.rpc('get_wishlist_availability'),
  ])
}

const LOAD_ERROR = "Couldn't load donations. Check your connection and try again."

// Hook for the admin "Donations waiting" page.
// Returns { pledges, availability, loading, error, reload }.
// pledges: stale ones first, then oldest first.
// availability: Map of item id → { qty_needed, qty_confirmed, ... } (may lack archived items).
export function usePendingPledges() {
  const [pledges, setPledges] = useState([])
  const [availability, setAvailability] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyResult = useCallback(([pledgeResult, totalsResult]) => {
    if (pledgeResult.error) {
      setError(LOAD_ERROR)
    } else {
      setPledges(sortPending(pledgeResult.data))
      // If totals fail we simply show no "Needed / Confirmed" line (the server still guards)
      setAvailability(new Map((totalsResult.data ?? []).map((row) => [row.item_id, row])))
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

  return { pledges, availability, loading, error, reload }
}
