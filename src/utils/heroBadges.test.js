import { describe, it, expect } from 'vitest'
import { badgeSrc, BADGES, getHeroBadges, monthsSince } from './heroBadges'

// Started 15 Jan 2026, 10:00 Malaysia time (02:00 UTC)
const START = '2026-01-15T02:00:00Z'
const at = (iso) => new Date(iso)

describe('monthsSince', () => {
  it('is 0 on the first day and just before the first month ends', () => {
    expect(monthsSince(START, at('2026-01-15T02:00:00Z'))).toBe(0)
    expect(monthsSince(START, at('2026-02-15T01:59:00Z'))).toBe(0)
  })

  it('counts a month once the same day and time arrives', () => {
    expect(monthsSince(START, at('2026-02-15T02:00:00Z'))).toBe(1)
    expect(monthsSince(START, at('2026-04-15T02:00:00Z'))).toBe(3)
  })

  it('counts whole years', () => {
    expect(monthsSince(START, at('2027-01-15T02:00:00Z'))).toBe(12)
    expect(monthsSince(START, at('2027-09-20T00:00:00Z'))).toBe(20)
  })

  it('uses Malaysia time for the day boundary', () => {
    // 14 Feb 17:00 UTC is 15 Feb 01:00 in Malaysia, but before the 10:00 start time
    expect(monthsSince('2026-01-15T00:00:00Z', at('2026-02-14T17:00:00Z'))).toBe(0)
    // Started 31 Jan 23:00 UTC = 1 Feb 07:00 KL; one month later is 1 Mar 07:00 KL
    expect(monthsSince('2026-01-31T23:00:00Z', at('2026-02-28T22:00:00Z'))).toBe(0)
    expect(monthsSince('2026-01-31T23:00:00Z', at('2026-02-28T23:00:00Z'))).toBe(1)
  })

  it('completes a month on the last day when the start day does not exist', () => {
    // Started 31 Jan 2026 10:00 KL → first month completes on 28 Feb 10:00 KL
    expect(monthsSince('2026-01-31T02:00:00Z', at('2026-02-28T02:00:00Z'))).toBe(1)
    expect(monthsSince('2026-01-31T02:00:00Z', at('2026-02-28T01:00:00Z'))).toBe(0)
  })

  it('is 0 for a future or unreadable start', () => {
    expect(monthsSince(START, at('2025-01-01T00:00:00Z'))).toBe(0)
    expect(monthsSince('not a date', at('2026-06-01T00:00:00Z'))).toBe(0)
  })
})

describe('getHeroBadges', () => {
  const active = { status: 'active', started_at: START }

  it('pending → only the pending badge', () => {
    expect(getHeroBadges({ status: 'pending', started_at: null })).toEqual(['pending'])
  })

  it('failed or unknown → no badges', () => {
    expect(getHeroBadges({ status: 'failed', started_at: null })).toEqual([])
    expect(getHeroBadges({ status: 'whatever', started_at: START })).toEqual([])
  })

  it('active on day 0 → Kids Hero only', () => {
    expect(getHeroBadges(active, at('2026-01-15T02:00:00Z'))).toEqual(['kids-hero'])
  })

  it('active without a start date → Kids Hero only', () => {
    expect(getHeroBadges({ status: 'active', started_at: null })).toEqual(['kids-hero'])
  })

  it.each([
    ['2 months', '2026-03-20T00:00:00Z', ['kids-hero']],
    ['3 months', '2026-04-15T02:00:00Z', ['kids-hero', 'bronze']],
    ['8 months', '2026-09-20T00:00:00Z', ['kids-hero', 'bronze']],
    ['9 months', '2026-10-15T02:00:00Z', ['kids-hero', 'silver']],
    ['12 months', '2027-01-15T02:00:00Z', ['kids-hero', 'gold']],
    ['20 months', '2027-09-20T00:00:00Z', ['kids-hero', 'gold']],
  ])('active at %s', (_label, now, expected) => {
    expect(getHeroBadges(active, at(now))).toEqual(expected)
  })
})

describe('badge helpers', () => {
  it('builds image paths', () => {
    expect(badgeSrc('gold')).toBe('/badges/carelink-badge-gold-256.png')
    expect(badgeSrc('kids-hero', 512)).toBe('/badges/carelink-badge-kids-hero-512.png')
  })

  it('has the agreed names and captions', () => {
    expect(BADGES.bronze).toMatchObject({ name: 'Bronze Supporter', caption: '3 months', minMonths: 3 })
    expect(BADGES.silver).toMatchObject({ name: 'Silver Guardian', caption: '9 months', minMonths: 9 })
    expect(BADGES.gold).toMatchObject({ name: 'Gold Ambassador', caption: '12 months', minMonths: 12 })
    expect(BADGES.pending).toMatchObject({ name: 'Status Pending', caption: 'Verification' })
    expect(BADGES['kids-hero']).toMatchObject({ name: 'Kids Hero', caption: 'Basic Member' })
  })
})
