import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// How many pledges are waiting for the admin, for the bottom-nav badge.
// refreshKey: pass something that changes when the count should be
// fetched again (AdminLayout passes the current page address, so the
// badge updates after the admin confirms or declines and returns to a list).
// Returns a number, or null while loading / if it failed (then no badge).
export function usePendingCount(refreshKey) {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let ignore = false
    supabase
      .from('pledges')
      // head: true = "don't send the rows, just the count", so it's tiny
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count, error }) => {
        if (!ignore) setCount(error ? null : count)
      })
    return () => {
      ignore = true
    }
  }, [refreshKey])

  return count
}
