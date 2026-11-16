import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { sortTiers } from '../utils/heroAmount'

// Read the Kids Hero tiers (RM30, RM50, Custom…). Visitors may read this
// table: policy "Public reads tiers" in the init migration.
function fetchTiers() {
  return supabase.from('subscription_tiers').select('id, name, amount, is_custom')
}

// Returns { tiers, loading, error, reload }
export function useSubscriptionTiers() {
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyResult = useCallback(({ data, error }) => {
    if (error) {
      setError("Couldn't load the Kids Hero options. Check your connection and try again.")
    } else {
      setTiers(sortTiers(data))
      setError(null)
    }
    setLoading(false)
  }, [])

  // Load once; ignore the answer if the visitor already left the page
  useEffect(() => {
    let ignore = false
    fetchTiers().then((result) => {
      if (!ignore) applyResult(result)
    })
    return () => {
      ignore = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    applyResult(await fetchTiers())
  }, [applyResult])

  return { tiers, loading, error, reload }
}
