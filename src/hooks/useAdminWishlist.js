import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { sortByUrgency } from '../utils/badge'

// Ask Supabase for every ACTIVE item, newest first.
// (applyResult below then groups them Urgent → Needed → Completed,
// keeping newest first inside each group.)
// Archived items are never shown to the admin (archiving is one-way).
// This function only fetches; it does not touch React state.
function fetchActiveItems() {
  return supabase
    .from('wishlist_items')
    .select('id, name, urgency, item_type, target_qty, pledged_qty, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
}

const LOAD_ERROR = "Couldn't load the wish list. Check your connection and try again."

// Hook used by the admin wish list page.
// Returns { items, loading, error, reload }.
export function useAdminWishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Put the result of a fetch into state
  const applyResult = useCallback(({ data, error }) => {
    if (error) {
      setError(LOAD_ERROR)
    } else {
      setItems(sortByUrgency(data))
      setError(null)
    }
    setLoading(false)
  }, [])

  // Load once when the page opens.
  // "ignore" stops us updating state if the admin leaves the page mid-load.
  useEffect(() => {
    let ignore = false
    fetchActiveItems().then((result) => {
      if (!ignore) applyResult(result)
    })
    return () => {
      ignore = true
    }
  }, [applyResult])

  // reload: fetch again without blanking the list
  // (used by "Try again" and, in G3, after archiving)
  const reload = useCallback(async () => {
    applyResult(await fetchActiveItems())
  }, [applyResult])

  return { items, loading, error, reload }
}
