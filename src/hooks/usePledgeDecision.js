import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

// Confirm or decline one pledge.
// The app ONLY changes status. When status becomes 'confirmed', the
// database trigger apply_confirmed_pledge raises the item's pledged_qty.
// Returns { decide, deciding, decisionError, clearError }.
export function usePledgeDecision(id) {
  const [deciding, setDeciding] = useState(false)
  const [decisionError, setDecisionError] = useState(null)

  // status: 'confirmed' or 'rejected'. Returns true if it worked.
  const decide = useCallback(
    async (status) => {
      setDeciding(true)
      setDecisionError(null)

      const { data, error } = await supabase
        .from('pledges')
        .update({ status })
        .eq('id', id)
        .eq('status', 'pending') // only if nobody has handled it yet
        .select('id') // send back the row if it really changed

      setDeciding(false)
      if (error) {
        setDecisionError("Couldn't save. Check your connection and try again.")
        return false
      }
      if (!data || data.length === 0) {
        setDecisionError(
          'This donation was already handled, or your login has expired. Go back to the list to see the latest.'
        )
        return false
      }
      return true
    },
    [id]
  )

  const clearError = useCallback(() => setDecisionError(null), [])

  return { decide, deciding, decisionError, clearError }
}
