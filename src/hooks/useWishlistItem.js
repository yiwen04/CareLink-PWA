import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Load and save ONE wish list item for the admin form.
// id = the item id from the URL, or undefined when adding a new item.
// Returns { item, loading, loadError, save }.
export function useWishlistItem(id) {
  const isNew = !id
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(!isNew) // nothing to load for a new item
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (isNew) return
    let ignore = false // stop updates if the admin leaves mid-load

    supabase
      .from('wishlist_items')
      .select('id, name, description, target_qty, pledged_qty, unit_price, urgency, item_type')
      .eq('id', id)
      .eq('status', 'active') // archived items can't be edited
      .maybeSingle() // 0 rows → data is null instead of an error
      .then(({ data, error }) => {
        if (ignore) return
        if (error) setLoadError("Couldn't load this item. Check your connection and try again.")
        else if (!data) setLoadError('This item was not found. It may have been archived.')
        else setItem(data)
        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id, isNew])

  // Save the form. row comes from toItemRow() in utils/validateItem.js.
  // Returns an error message, or null if it worked.
  const save = useCallback(
    async (row) => {
      // New item → insert. Existing item → update that one id.
      // .select('id') asks Supabase to send back the saved row, so we can
      // tell if RLS quietly blocked it (then no row comes back).
      const query = isNew
        ? supabase.from('wishlist_items').insert(row).select('id')
        : supabase.from('wishlist_items').update(row).eq('id', id).eq('status', 'active').select('id')

      const { data, error } = await query
      if (error) return "Couldn't save. Check your connection and try again."
      if (!data || data.length === 0) {
        return "Couldn't save this item. It may have been archived, or your login has expired."
      }
      return null
    },
    [id, isNew]
  )

  return { item, loading, loadError, save }
}
