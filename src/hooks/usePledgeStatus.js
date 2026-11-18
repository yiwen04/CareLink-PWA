import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Ask the database for ONE pledge's public status.
// get_pledge_status (migration 20261118_pledge_guards.sql) is a safe function:
// first name, item, qty, price, status only. Never the email or phone.
function fetchPledgeStatus(id) {
  return supabase.rpc('get_pledge_status', { p_id: id })
}

// Turn the database answer into { pledge, error, notFound }
function readResult({ data, error }) {
  // 22P02 = the id in the address isn't a valid uuid → treat as "not found"
  if (error && error.code !== '22P02') {
    return { pledge: null, error: "Couldn't load your pledge. Check your connection and try again.", notFound: false }
  }
  const pledge = data?.[0] ?? null // the function returns a list of 0 or 1 rows
  return { pledge, error: null, notFound: !pledge }
}

// Returns { pledge, loading, error, notFound, reload }
export function usePledgeStatus(id) {
  const [state, setState] = useState({ pledge: null, error: null, notFound: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    fetchPledgeStatus(id).then((result) => {
      if (ignore) return
      setState(readResult(result))
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [id])

  const reload = useCallback(async () => {
    setState(readResult(await fetchPledgeStatus(id)))
  }, [id])

  return { ...state, loading, reload }
}
