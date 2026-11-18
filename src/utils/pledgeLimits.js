// Pure helpers for the over-pledge rules. The database enforces them for real
// (triggers in 20261118_pledge_guards.sql); these only decide what to SHOW.

// A pending pledge with no receipt for this many days is "Stale"
export const STALE_DAYS = 2

// Error codes raised by the database triggers
export const CODE_OVER_PLEDGED = 'CL001'
export const CODE_OVER_CONFIRM = 'CL002'

// How many units are reserved (confirmed + pending) and how full the bar is.
// availability = one row from get_wishlist_availability, or undefined if it
// could not be loaded (then we fall back to the confirmed count on the item).
export function reservedQty(item, availability) {
  if (availability) return availability.qty_confirmed + availability.qty_pending
  return item.pledged_qty
}

export function remainingQty(item, availability) {
  if (availability) return availability.qty_remaining
  return Math.max(0, item.target_qty - item.pledged_qty)
}

export function reservedPercent(reserved, needed) {
  if (!needed) return 0
  return Math.min(100, Math.round((reserved / needed) * 100))
}

// If the database refused a pledge because someone else got there first,
// returns { remaining } (units still left); otherwise null.
export function readOverPledgedError(error) {
  if (!error || error.code !== CODE_OVER_PLEDGED) return null
  const remaining = parseInt(error.hint, 10)
  return { remaining: Number.isNaN(remaining) ? 0 : remaining }
}

export function overPledgedMessage(remaining) {
  return remaining > 0
    ? `Sorry, someone just pledged this item. Only ${remaining} left.`
    : 'Sorry, someone just pledged this item. Nothing is left.'
}

// Would confirming `qty` push the confirmed total above the amount needed?
// availability may be undefined (archived item): then we can't tell, so we
// don't block here. The database still refuses.
export function confirmCheck(availability, qty) {
  if (!availability) return { known: false, needed: null, confirmed: null, exceeds: false }
  const { qty_needed: needed, qty_confirmed: confirmed } = availability
  return { known: true, needed, confirmed, exceeds: confirmed + qty > needed }
}

// Pending, no receipt, older than STALE_DAYS
export function isStale(pledge, now = Date.now()) {
  if (pledge.status !== 'pending' || pledge.receipt_path) return false
  const ageMs = now - new Date(pledge.created_at).getTime()
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000
}

// Stale first, then oldest first. Returns a new array.
export function sortPending(pledges, now = Date.now()) {
  return [...pledges].sort((a, b) => {
    const staleDiff = Number(isStale(b, now)) - Number(isStale(a, now))
    if (staleDiff !== 0) return staleDiff
    return new Date(a.created_at) - new Date(b.created_at)
  })
}

// Total money redirected to the General Fund (qty × price, in cents to avoid
// rounding noise). Pledges for items with no price add 0 and are counted in
// `unpriced`, so the page can say the total is incomplete.
export function generalFundTotal(pledges) {
  let cents = 0
  let unpriced = 0
  for (const p of pledges) {
    const price = p.wishlist_items?.unit_price
    if (price == null || price === '') unpriced += 1
    else cents += Math.round(p.qty * Number(price) * 100)
  }
  return { total: cents / 100, count: pledges.length, unpriced }
}
