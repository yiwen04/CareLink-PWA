import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

// Archive several wish list items in ONE database request.
// Archiving is one-way: there is no "restore" in the app.
// Returns { archive, archiving, archiveError, clearError }.
export function useArchiveItems() {
  const [archiving, setArchiving] = useState(false)
  const [archiveError, setArchiveError] = useState(null)

  // ids: array of item ids. Returns how many were archived, or null on failure.
  const archive = useCallback(async (ids) => {
    setArchiving(true)
    setArchiveError(null)

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({ status: 'archived' }) // only status changes; nothing else is touched
      .in('id', ids) // "every row whose id is in this list"
      .eq('status', 'active')
      .select('id') // send back the rows that really changed

    setArchiving(false)
    if (error) {
      setArchiveError("Couldn't archive. Check your connection and try again.")
      return null
    }
    // No rows back = RLS blocked it (e.g. login expired) or they were already archived
    if (!data || data.length === 0) {
      setArchiveError("Nothing was archived. Your login may have expired, or the items were already archived.")
      return null
    }
    return data.length
  }, [])

  const clearError = useCallback(() => setArchiveError(null), [])

  return { archive, archiving, archiveError, clearError }
}
