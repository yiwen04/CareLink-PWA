import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Decide which badge an item gets
function getBadge(item) {
  if (item.pledged_qty >= item.target_qty) {
    return { label: 'Completed', style: 'bg-green-100 text-green-800', order: 2 }
  }
  if (item.urgency === 'high') {
    return { label: 'Urgent', style: 'bg-urgent-bg text-urgent-text', order: 0 }
  }
  return { label: 'Needed', style: 'bg-needed-bg text-needed-text', order: 1 }
}

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 1. Load active items from Supabase
    async function load() {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        // 2. Sort: Urgent → Needed → Completed
        data.sort((a, b) => getBadge(a).order - getBadge(b).order)
        setItems(data)
        setError(null)
      }
      setLoading(false)
    }

    load()

    // 4. Live updates: reload whenever an item changes in the database
    const channel = supabase
      .channel('wishlist-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items' }, load)
      .subscribe()

    // Stop listening when the user leaves this page
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">What the home needs right now</h1>
      <p className="mt-2 text-muted">Browse all items and their current needs.</p>

      {loading && <p className="mt-6 text-muted">Loading wish list…</p>}
      {error && <p className="mt-6 text-urgent-text">Couldn't load the wish list. Please try again later.</p>}
      {!loading && !error && items.length === 0 && (
        <p className="mt-6 text-muted">No needs right now. Thank you for your support!</p>
      )}

      {/* 3. One card per item */}
      <div className="mt-4 space-y-4">
        {items.map((item) => {
          const badge = getBadge(item)
          const percent = Math.min(100, Math.round((item.pledged_qty / item.target_qty) * 100))

          return (
            <div key={item.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-ink">{item.name}</h2>
                <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${badge.style}`}>
                  {badge.label}
                </span>
              </div>

              {item.description && <p className="mt-2 text-sm text-muted">{item.description}</p>}

              <div className="mt-3 h-2.5 w-full rounded-full bg-line">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted">
                {item.pledged_qty} of {item.target_qty} pledged
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}