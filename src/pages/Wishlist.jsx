import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getBadge, sortByUrgency } from '../utils/badge'
import { remainingQty, reservedPercent, reservedQty } from '../utils/pledgeLimits'
import { ITEM_TYPES, itemTypeIcon } from '../utils/itemTypes'
import ItemTypeChip from '../components/ItemTypeChip'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All') // the chip the visitor tapped

  // How many items each type has, so empty types can be greyed out
  const typeCounts = new Map()
  for (const item of items) typeCounts.set(item.item_type, (typeCounts.get(item.item_type) ?? 0) + 1)
  // If the chosen type has no items any more (e.g. an update while browsing), fall back to All
  const activeType = filter === 'All' || typeCounts.has(filter) ? filter : 'All'
  const visibleItems = activeType === 'All' ? items : items.filter((item) => item.item_type === activeType)

  useEffect(() => {
    // 1. Load active items from Supabase
    async function load() {
      // Items and their reserved totals (confirmed + pending), fetched together.
      // If the totals fail, cards fall back to the confirmed count.
      const [{ data, error }, { data: totals }] = await Promise.all([
        supabase
          .from('wishlist_items')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: true }),
        supabase.rpc('get_wishlist_availability'),
      ])

      if (error) {
        setError(error.message)
      } else {
        const byItem = new Map((totals ?? []).map((row) => [row.item_id, row]))
        const merged = data.map((item) => ({ ...item, availability: byItem.get(item.id) }))
        // 2. Sort: Urgent → Needed → Completed
        setItems(sortByUrgency(merged))
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

      {/* Filter chips: "All" + the types. Types with no items are greyed out and can't be tapped.
          Scrolls sideways on a phone (-mx-4 px-4 lets it run edge to edge). */}
      {!loading && !error && items.length > 0 && (
        <div
          role="group"
          aria-label="Filter by item type"
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
          data-cy="type-filters"
        >
          {['All', ...ITEM_TYPES].map((type) => {
            const count = type === 'All' ? items.length : typeCounts.get(type) ?? 0
            const selected = activeType === type
            return (
              <button
                key={type}
                type="button"
                disabled={count === 0}
                aria-pressed={selected}
                onClick={() => setFilter(type)}
                data-cy={`type-filter-${type}`}
                className={`shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-40 ${
                  selected ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted'
                }`}
              >
                {type !== 'All' && <span aria-hidden="true">{itemTypeIcon(type)} </span>}
                {type}
              </button>
            )
          })}
        </div>
      )}

      {/* 3. One card per item */}
      <div className="mt-4 space-y-4">
        {visibleItems.map((item) => {
          // Completed = confirmed all needed. Fully pledged = confirmed + pending
          // cover it all (so nothing is left to pledge, but the admin still has to confirm).
          const isCompleted = item.pledged_qty >= item.target_qty
          const reserved = reservedQty(item, item.availability)
          const isFullyPledged = !isCompleted && remainingQty(item, item.availability) === 0
          const badge = isFullyPledged
            ? { label: 'Fully pledged', style: 'bg-accent text-brand' }
            : getBadge(item)
          const percent = reservedPercent(reserved, item.target_qty)

          const isClosed = isCompleted || isFullyPledged
          const Card = isClosed ? 'div' : Link

          return (
            <Card
              key={item.id}
              to={isClosed ? undefined : `/pledge/${item.id}`}
              data-cy={isFullyPledged ? 'wishlist-card-full' : 'wishlist-card'}
              aria-disabled={isClosed || undefined}
              className={`block rounded-2xl border border-line bg-white p-4 ${isClosed ? 'opacity-70' : 'transition active:scale-[0.98]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-ink">{item.name}</h2>
                  <div className="mt-1">
                    <ItemTypeChip type={item.item_type} />
                  </div>
                </div>
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
                {reserved} of {item.target_qty} pledged
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}