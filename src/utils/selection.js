// Helpers for "select several items" mode.
// We keep the chosen ids in a Set (a list that can't hold the same id twice).
// React only notices a change when it gets a NEW Set, so these never
// change the Set they are given; they always return a fresh one.

// Tick the id if it isn't ticked, untick it if it is.
export function toggleId(selected, id) {
  const next = new Set(selected)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// "1 item" / "3 items"
export function itemCount(n) {
  return `${n} ${n === 1 ? 'item' : 'items'}`
}
