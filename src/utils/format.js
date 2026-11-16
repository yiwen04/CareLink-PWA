// Small display helpers for money and dates.

// Total for a pledge: qty × price per unit.
// Returns null when the item has no price (unit_price is optional),
// so the page can simply hide the amount.
// Supabase may send numeric columns as text, so Number() is used.
export function pledgeAmount(qty, unitPrice) {
  if (unitPrice == null || unitPrice === '') return null
  // Work in cents and round, so 3 × 0.1 gives 0.3 and not 0.30000000000000004
  return Math.round(qty * Number(unitPrice) * 100) / 100
}

// 30 → "RM 30.00", 1234.5 → "RM 1,234.50"
export function formatRM(amount) {
  return `RM ${Number(amount).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// "2026-11-15T08:30:00Z" → "15 Nov 2026", always in Malaysia time
// (so a pledge made just after midnight in KL shows the right day).
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  })
}
