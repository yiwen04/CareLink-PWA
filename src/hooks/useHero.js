import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { signReceipt } from '../lib/receiptUrl'

// Admin: load ONE Kids Hero subscription (any status) with its tier,
// plus a temporary link to its receipt if there is one.
// Returns { hero, receiptUrl, receiptError, loading, loadError }.
export function useHero(id) {
  const [state, setState] = useState({
    hero: null,
    receiptUrl: null,
    receiptError: null,
    loading: true,
    loadError: null,
  })

  useEffect(() => {
    let ignore = false // stop updates if the admin leaves mid-load

    async function load() {
      // 1. The subscription + its tier (embed via tier_id)
      const { data: hero, error } = await supabase
        .from('subscriptions')
        .select(
          'id, donor_name, donor_email, donor_phone, amount, status, receipt_path, started_at, created_at, ' +
            'subscription_tiers(name, is_custom)'
        )
        .eq('id', id)
        .maybeSingle() // 0 rows → null instead of an error

      if (error || !hero) {
        // 22P02 = the id in the address isn't a valid uuid
        return {
          loadError:
            error && error.code !== '22P02'
              ? "Couldn't load this Kids Hero. Check your connection and try again."
              : 'This Kids Hero subscription was not found.',
        }
      }

      if (!hero.receipt_path) return { hero }

      // 2. A short-lived link to the private receipt (admins only)
      const { url, error: receiptError } = await signReceipt(hero.receipt_path)
      return { hero, receiptUrl: url ?? null, receiptError: receiptError ?? null }
    }

    load().then((result) => {
      if (!ignore) {
        setState({ hero: null, receiptUrl: null, receiptError: null, loadError: null, ...result, loading: false })
      }
    })

    return () => {
      ignore = true
    }
  }, [id])

  return state
}
