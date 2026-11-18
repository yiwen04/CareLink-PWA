import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Ask the database for ONE Kids Hero subscription's public status.
// get_hero_status (migration 20261116_kids_heroes.sql) is a safe function:
// it returns only first_name, tier_name, amount, status and started_at,
// never the email or phone, and works without logging in.
function fetchHeroStatus(id) {
  return supabase.rpc('get_hero_status', { sub_id: id })
}

// Turn the database answer into { hero, error, notFound }
function readResult({ data, error }) {
  // 22P02 = the id in the address isn't a valid uuid → treat as "not found"
  if (error && error.code !== '22P02') {
    return { hero: null, error: "Couldn't load your Kids Hero status. Check your connection and try again.", notFound: false }
  }
  const hero = data?.[0] ?? null // the function returns a list of 0 or 1 rows
  return { hero, error: null, notFound: !hero }
}

// id may be null (e.g. a visitor who never subscribed on this device):
// then nothing is loaded and hero stays null.
// Returns { hero, loading, error, notFound, reload }
export function useHeroStatus(id) {
  const [state, setState] = useState({ hero: null, error: null, notFound: false })
  const [loading, setLoading] = useState(!!id)

  // Load when the page opens; ignore the answer if the donor already left
  useEffect(() => {
    if (!id) return
    let ignore = false
    fetchHeroStatus(id).then((result) => {
      if (ignore) return
      setState(readResult(result))
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [id])

  // "Check again" / "Try again": fetch without blanking the page
  const reload = useCallback(async () => {
    if (!id) return
    setState(readResult(await fetchHeroStatus(id)))
  }, [id])

  return { ...state, loading, reload }
}
