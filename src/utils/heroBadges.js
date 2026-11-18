// Kids Hero badges: which ones a donor has, and the text for each.
// Images live in public/badges/carelink-badge-{slug}-{256|512}.png.
import { addMonths, KL_OFFSET_MS } from './heroDates'

export const BADGES = {
  pending: { name: 'Status Pending', caption: 'Verification' },
  'kids-hero': { name: 'Kids Hero', caption: 'Basic Member' },
  bronze: { name: 'Bronze Supporter', caption: '3 months', minMonths: 3 },
  silver: { name: 'Silver Guardian', caption: '9 months', minMonths: 9 },
  gold: { name: 'Gold Ambassador', caption: '12 months', minMonths: 12 },
}

// The three "time" badges, lowest to highest
const SEASON_SLUGS = ['bronze', 'silver', 'gold']

// Whole months completed since startedAtIso, counted in Malaysia time.
// Same rule as the "next transfer" date: if the start day doesn't exist in a
// month (e.g. the 31st), that month completes on its last day.
// Before the start (or an unreadable date) → 0.
export function monthsSince(startedAtIso, now = new Date()) {
  const startMs = Date.parse(startedAtIso)
  if (Number.isNaN(startMs)) return 0
  const start = new Date(startMs + KL_OFFSET_MS) // UTC fields now hold the KL clock
  const day = start.getUTCDate()
  let months = 0
  while (months < 1200) {
    const next = new Date(addMonths(start, months + 1, day).getTime() - KL_OFFSET_MS)
    if (next > now) break
    months += 1
  }
  return months
}

// Badges to show for a subscription row ({ status, started_at }), best last:
//   pending → ['pending']
//   active  → ['kids-hero'] + the highest of bronze / silver / gold earned
//   failed or anything else → []
export function getHeroBadges({ status, started_at }, now = new Date()) {
  if (status === 'pending') return ['pending']
  if (status !== 'active') return []

  const badges = ['kids-hero']
  if (started_at) {
    const months = monthsSince(started_at, now)
    const earned = SEASON_SLUGS.filter((slug) => months >= BADGES[slug].minMonths)
    if (earned.length > 0) badges.push(earned[earned.length - 1])
  }
  return badges
}

// Image path. size: 256 or 512
export function badgeSrc(slug, size = 256) {
  return `/badges/carelink-badge-${slug}-${size}.png`
}
