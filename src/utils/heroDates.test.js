import { describe, it, expect } from 'vitest'
import { nextTransferDate } from './heroDates'
import { formatDate } from './format'

// Helper: run nextTransferDate and show the result the way the page does
const next = (start, now) => formatDate(nextTransferDate(start, new Date(now)).toISOString())

describe('nextTransferDate', () => {
  it('is one month after the start when started recently', () => {
    expect(next('2026-11-15T02:00:00Z', '2026-11-20T00:00:00Z')).toBe('15 Dec 2026')
  })

  it('skips months that have already passed', () => {
    expect(next('2026-11-15T02:00:00Z', '2027-02-20T00:00:00Z')).toBe('15 Mar 2027')
  })

  it('uses the last day when the month is shorter', () => {
    expect(next('2027-01-31T02:00:00Z', '2027-02-01T00:00:00Z')).toBe('28 Feb 2027')
  })

  it('goes back to the original day after a short month', () => {
    expect(next('2027-01-31T02:00:00Z', '2027-03-01T00:00:00Z')).toBe('31 Mar 2027')
  })

  it('uses the Malaysia day, not the UTC day', () => {
    // 20:00 UTC on 14 Nov = 04:00 on 15 Nov in KL
    expect(next('2026-11-14T20:00:00Z', '2026-11-20T00:00:00Z')).toBe('15 Dec 2026')
  })
})
