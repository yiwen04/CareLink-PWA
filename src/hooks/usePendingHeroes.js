import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Every PENDING Kids Hero subscription, oldest first, with its tier name.
// "subscription_tiers(name, is_custom)" is an embed through tier_id.
function fetchPendingHeroes() {
  return supabase
    .from('subscriptions')
    .select('id, donor_name, donor_email, amount, created_at, subscription_tiers(name, is_custom)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
}

const LOAD_ERROR = "Couldn't load Kids Heroes. Check your connection and try again."

// Returns { heroes, loading, error, reload }
export function usePendingHeroes() {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applyResult = useCallback(({ data, error }) => {
    if (error) {
      setError(LOAD_ERROR)
    } else {
      setHeroes(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  // Load once; ignore the answer if the admin already left
  useEffect(() => {
    let ignore = false
    fetchPendingHeroes().then((result) => {
      if (!ignore) applyResult(result)
    })
    return () => {
      ignore = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    applyResult(await fetchPendingHeroes())
  }, [applyResult])

  return { heroes, loading, error, reload }
}
