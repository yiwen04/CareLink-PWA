// Decide which badge a wish list item gets.
// Shared by the public wish list and the admin list so they always match.
// "Completed" is never stored in the database: it is worked out here
// from pledged_qty and target_qty.
export function getBadge(item) {
  if (item.pledged_qty >= item.target_qty) {
    return { label: 'Completed', style: 'bg-green-100 text-green-800', order: 2 }
  }
  if (item.urgency === 'high') {
    return { label: 'Urgent', style: 'bg-urgent-bg text-urgent-text', order: 0 }
  }
  return { label: 'Needed', style: 'bg-needed-bg text-needed-text', order: 1 }
}

// Sort a list Urgent → Needed → Completed. Returns a new array.
// Items in the same group keep the order they arrived in
// (JavaScript's sort is "stable"), so each page decides that order
// in its database query.
export function sortByUrgency(items) {
  return [...items].sort((a, b) => getBadge(a).order - getBadge(b).order)
}

// How full the progress bar is, from 0 to 100.
export function getPercent(item) {
  if (!item.target_qty) return 0
  return Math.min(100, Math.round((item.pledged_qty / item.target_qty) * 100))
}
