import { describe, it, expect } from 'vitest'
import { formatDate, formatRM, pledgeAmount } from './format'

describe('pledgeAmount', () => {
  it('multiplies quantity by price', () => {
    expect(pledgeAmount(2, 15)).toBe(30)
  })

  it('accepts the price as text, the way Supabase may send numeric', () => {
    expect(pledgeAmount(3, '12.50')).toBe(37.5)
  })

  it('avoids floating point leftovers', () => {
    expect(pledgeAmount(3, 0.1)).toBe(0.3)
  })

  it('returns null when the item has no price', () => {
    expect(pledgeAmount(2, null)).toBeNull()
    expect(pledgeAmount(2, undefined)).toBeNull()
  })
})

describe('formatRM', () => {
  it('always shows 2 decimals', () => {
    expect(formatRM(30)).toBe('RM 30.00')
    expect(formatRM(37.5)).toBe('RM 37.50')
  })

  it('adds a thousands separator', () => {
    expect(formatRM(1234.5)).toBe('RM 1,234.50')
  })
})

describe('formatDate', () => {
  it('shows day, short month and year', () => {
    expect(formatDate('2026-11-15T08:30:00Z')).toBe('15 Nov 2026')
  })

  it('uses Malaysia time (UTC+8), so late-night UTC rolls to the next day', () => {
    // 20:00 UTC on 14 Nov is 04:00 on 15 Nov in Kuala Lumpur
    expect(formatDate('2026-11-14T20:00:00Z')).toBe('15 Nov 2026')
  })
})
