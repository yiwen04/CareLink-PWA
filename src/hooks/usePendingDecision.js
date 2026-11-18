import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CODE_OVER_CONFIRM } from '../utils/pledgeLimits'

const CODE_CANNOT_REDIRECT = 'CL004'

// Change the status of ONE row that is still 'pending'.
// Used for pledges (confirmed / rejected / redirected) and Kids Heroes (active / failed).
// The app only changes status. Database triggers do the rest:
//   pledges → apply_confirmed_pledge raises the item's pledged_qty
//   subscriptions → set_subscription_started_at sets started_at
// table: 'pledges' or 'subscriptions'. id: the row id.
// Returns { decide, deciding, decisionError, clearError }.
export function usePendingDecision(table, id) {
  const [deciding, setDeciding] = useState(false)
  const [decisionError, setDecisionError] = useState(null)

  // Returns true if it worked
  const decide = useCallback(
    async (status) => {
      setDeciding(true)
      setDecisionError(null)

      const { data, error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id)
        .eq('status', 'pending') // only if nobody has handled it yet
        .select('id') // send back the row if it really changed

      setDeciding(false)
      if (error) {
        // The database refused: confirming would pass the amount needed
        if (error.code === CODE_OVER_CONFIRM) {
          setDecisionError('This would exceed the amount needed. Decline it, or redirect it to the General Fund.')
        } else if (error.code === CODE_CANNOT_REDIRECT) {
          setDecisionError('This donor did not allow their donation to go to the General Fund.')
        } else {
          setDecisionError("Couldn't save. Check your connection and try again.")
        }
        return false
      }
      if (!data || data.length === 0) {
        setDecisionError('This was already handled, or your login has expired. Go back to the list to see the latest.')
        return false
      }
      return true
    },
    [table, id]
  )

  const clearError = useCallback(() => setDecisionError(null), [])

  return { decide, deciding, decisionError, clearError }
}
