import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Count the rows still 'pending' in one table, without downloading them
// (head: true = "just the count"). Resolves to a number, or null on error.
function countPending(table) {
  return supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
    .then(({ count, error }) => (error ? null : count))
}

// How much is waiting for the admin: pledges, Kids Heroes, and both together.
// refreshKey: pass something that changes when the counts should be fetched
// again (e.g. the page address, so they update after confirming something).
// Each value is a number, or null while loading / if it failed (then no badge).
export function usePendingCount(refreshKey) {
  const [counts, setCounts] = useState({ pledges: null, heroes: null, total: null })

  useEffect(() => {
    let ignore = false
    // Ask for both counts at the same time
    Promise.all([countPending('pledges'), countPending('subscriptions')]).then(([pledges, heroes]) => {
      if (ignore) return
      const total = pledges === null && heroes === null ? null : (pledges ?? 0) + (heroes ?? 0)
      setCounts({ pledges, heroes, total })
    })
    return () => {
      ignore = true
    }
  }, [refreshKey])

  return counts
}
