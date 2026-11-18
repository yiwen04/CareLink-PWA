import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { generalFundTotal } from '../utils/pledgeLimits'

// Money that was redirected to the General Fund (pledges with status
// 'redirected'), so the admin can see where extra donations went.
// Returns { fund: { total, count, unpriced } | null, error }.
// fund is null while loading.
export function useGeneralFund() {
  const [state, setState] = useState({ fund: null, error: false })

  useEffect(() => {
    let ignore = false
    supabase
      .from('pledges')
      .select('qty, wishlist_items(unit_price)')
      .eq('status', 'redirected')
      .then(({ data, error }) => {
        if (ignore) return
        setState(error ? { fund: null, error: true } : { fund: generalFundTotal(data), error: false })
      })
    return () => {
      ignore = true
    }
  }, [])

  return state
}
