import { describe, it, expect } from 'vitest'
import {
  confirmCheck,
  generalFundTotal,
  isStale,
  overPledgedMessage,
  readOverPledgedError,
  remainingQty,
  reservedPercent,
  reservedQty,
  sortPending,
} from './pledgeLimits'

const DAY = 24 * 60 * 60 * 1000
const now = new Date('2026-11-18T12:00:00Z').getTime()
const ago = (days) => new Date(now - days * DAY).toISOString()

describe('reserved quantity', () => {
  const item = { target_qty: 10, pledged_qty: 3 }
  const availability = { qty_needed: 10, qty_confirmed: 3, qty_pending: 4, qty_remaining: 3 }

  it('counts pending as taken', () => {
    expect(reservedQty(item, availability)).toBe(7)
    expect(remainingQty(item, availability)).toBe(3)
  })

  it('falls back to the confirmed count when availability is missing', () => {
    expect(reservedQty(item, undefined)).toBe(3)
    expect(remainingQty(item, undefined)).toBe(7)
  })

  it('caps the percent at 100 and handles zero', () => {
    expect(reservedPercent(7, 10)).toBe(70)
    expect(reservedPercent(12, 10)).toBe(100)
    expect(reservedPercent(0, 0)).toBe(0)
  })
})

describe('readOverPledgedError', () => {
  it('reads how many are left from the hint', () => {
    expect(readOverPledgedError({ code: 'CL001', hint: '2' })).toEqual({ remaining: 2 })
  })
  it('treats a missing hint as nothing left', () => {
    expect(readOverPledgedError({ code: 'CL001' })).toEqual({ remaining: 0 })
  })
  it('ignores other errors', () => {
    expect(readOverPledgedError({ code: '42501' })).toBeNull()
    expect(readOverPledgedError(null)).toBeNull()
  })
  it('words the message for both cases', () => {
    expect(overPledgedMessage(2)).toBe('Sorry, someone just pledged this item. Only 2 left.')
    expect(overPledgedMessage(0)).toMatch(/Nothing is left/)
  })
})

describe('confirmCheck', () => {
  it('allows a confirm that fits exactly', () => {
    expect(confirmCheck({ qty_needed: 5, qty_confirmed: 3 }, 2).exceeds).toBe(false)
  })
  it('flags a confirm that goes over', () => {
    const result = confirmCheck({ qty_needed: 5, qty_confirmed: 4 }, 2)
    expect(result).toEqual({ known: true, needed: 5, confirmed: 4, exceeds: true })
  })
  it('does not block when availability is unknown', () => {
    expect(confirmCheck(undefined, 2).exceeds).toBe(false)
  })
})

describe('stale pledges', () => {
  it('is stale after 2 days with no receipt', () => {
    expect(isStale({ status: 'pending', receipt_path: null, created_at: ago(3) }, now)).toBe(true)
  })
  it('is not stale within 2 days', () => {
    expect(isStale({ status: 'pending', receipt_path: null, created_at: ago(1) }, now)).toBe(false)
  })
  it('is not stale with a receipt, or when not pending', () => {
    expect(isStale({ status: 'pending', receipt_path: 'pledges/a.png', created_at: ago(9) }, now)).toBe(false)
    expect(isStale({ status: 'rejected', receipt_path: null, created_at: ago(9) }, now)).toBe(false)
  })
  it('sorts stale first, then oldest first', () => {
    const list = [
      { id: 'old-receipt', status: 'pending', receipt_path: 'pledges/x', created_at: ago(8) },
      { id: 'new', status: 'pending', receipt_path: null, created_at: ago(1) },
      { id: 'stale', status: 'pending', receipt_path: null, created_at: ago(5) },
    ]
    expect(sortPending(list, now).map((p) => p.id)).toEqual(['stale', 'old-receipt', 'new'])
  })
})

describe('generalFundTotal', () => {
  it('adds qty × price and counts unpriced pledges', () => {
    const result = generalFundTotal([
      { qty: 3, wishlist_items: { unit_price: '0.10' } },
      { qty: 2, wishlist_items: { unit_price: 25 } },
      { qty: 1, wishlist_items: { unit_price: null } },
    ])
    expect(result).toEqual({ total: 50.3, count: 3, unpriced: 1 })
  })
  it('is zero when empty', () => {
    expect(generalFundTotal([])).toEqual({ total: 0, count: 0, unpriced: 0 })
  })
})
