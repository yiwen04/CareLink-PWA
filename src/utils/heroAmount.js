// Kids Heroes amounts and tier labels.
// HERO_MIN must match the insert policy in
// supabase/migrations/20261116_kids_heroes.sql (custom amount >= 10, whole ringgit).
export const HERO_MIN = 10
const HERO_MAX = 99999999 // numeric(10,2) limit, so the database never rejects it

// Check what the donor typed for a custom amount.
// Returns an error message, or null if it's fine.
export function validateCustomAmount(text) {
  const value = text.trim()
  if (!value) return 'Please enter an amount.'
  if (!/^\d+$/.test(value)) return 'Enter a whole number of ringgit, e.g. 75.'
  if (Number(value) < HERO_MIN) return `The minimum is RM${HERO_MIN} a month.`
  if (Number(value) > HERO_MAX) return 'That amount is too large.'
  return null
}

// 50 → "RM50", 12.5 → "RM12.50" (tiers are whole ringgit, but be safe)
export function formatHeroAmount(amount) {
  const n = Number(amount)
  return `RM${Number.isInteger(n) ? n : n.toFixed(2)}`
}

// Text on a tier card: "RM30 / month" or "Custom amount"
export function tierLabel(tier) {
  return tier.is_custom ? 'Custom amount' : `${formatHeroAmount(tier.amount)} / month`
}

// Fixed tiers first (cheapest first), Custom last. Returns a new array.
export function sortTiers(tiers) {
  return [...tiers].sort((a, b) => {
    if (a.is_custom !== b.is_custom) return a.is_custom ? 1 : -1
    return Number(a.amount ?? 0) - Number(b.amount ?? 0)
  })
}
