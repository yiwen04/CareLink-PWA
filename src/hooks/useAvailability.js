import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Totals for ONE wish list item (confirmed / pending / remaining), from the
// database function get_wishlist_availability. Safe for visitors: totals only.
// itemId may be null/undefined (then nothing is loaded).
// Returns { availability, loading, reload }. availability is undefined when
// the item is not active or the request failed.
export function useAvailability(itemId) {
  const [availability, setAvailability] = useState(undefined)
  const [loading, setLoading] = useState(!!itemId)

  const fetchOne = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_wishlist_availability', { p_item_id: itemId })
    return error ? undefined : data?.[0]
  }, [itemId])

  useEffect(() => {
    if (!itemId) return
    let ignore = false
    fetchOne().then((row) => {
      if (ignore) return
      setAvailability(row)
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [itemId, fetchOne])

  // Fetch again without blanking (e.g. after "someone just pledged this item")
  const reload = useCallback(async () => {
    const row = await fetchOne()
    setAvailability(row)
    return row
  }, [fetchOne])

  return { availability, loading, reload }
}
