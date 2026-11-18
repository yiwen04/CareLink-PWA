// "Next transfer" date for a monthly Kids Hero.
// Same day of the month as the start date, in Malaysia time.
// If that day doesn't exist (e.g. 31st in February), use the last day of the month.

export const KL_OFFSET_MS = 8 * 60 * 60 * 1000 // Malaysia is UTC+8 all year (no daylight saving)

// Add n months to a date whose UTC fields hold Malaysia wall-clock time
export function addMonths(shifted, n, day) {
  const d = new Date(shifted)
  d.setUTCDate(1) // avoid "Jan 31 + 1 month = Mar 3" overflow
  d.setUTCMonth(d.getUTCMonth() + n)
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, lastDay))
  return d
}

// startIso: started_at from the database. now: today (can be passed in tests).
// Returns a Date for the first monthly date AFTER now.
export function nextTransferDate(startIso, now = new Date()) {
  // Shift into Malaysia time so the "day of the month" is the KL day
  const start = new Date(Date.parse(startIso) + KL_OFFSET_MS)
  const day = start.getUTCDate()
  for (let n = 1; n <= 1200; n++) {
    const next = new Date(addMonths(start, n, day).getTime() - KL_OFFSET_MS) // shift back
    if (next > now) return next
  }
  return null
}
