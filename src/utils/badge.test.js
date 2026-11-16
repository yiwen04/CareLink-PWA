import { describe, it, expect } from 'vitest'
import { getBadge, getPercent, sortByUrgency } from './badge'

describe('getBadge', () => {
  it('shows Urgent for high urgency', () => {
    expect(getBadge({ urgency: 'high', pledged_qty: 0, target_qty: 5 }).label).toBe('Urgent')
  })

  it('shows Needed for medium urgency', () => {
    expect(getBadge({ urgency: 'medium', pledged_qty: 2, target_qty: 5 }).label).toBe('Needed')
  })

  it('shows Completed once pledges reach the target, whatever the urgency', () => {
    expect(getBadge({ urgency: 'high', pledged_qty: 5, target_qty: 5 }).label).toBe('Completed')
    expect(getBadge({ urgency: 'medium', pledged_qty: 6, target_qty: 5 }).label).toBe('Completed')
  })
})

describe('sortByUrgency', () => {
  const needed1 = { name: 'needed1', urgency: 'medium', pledged_qty: 0, target_qty: 5 }
  const urgent = { name: 'urgent', urgency: 'high', pledged_qty: 0, target_qty: 5 }
  const done = { name: 'done', urgency: 'high', pledged_qty: 5, target_qty: 5 }
  const needed2 = { name: 'needed2', urgency: 'medium', pledged_qty: 1, target_qty: 5 }

  it('puts Urgent first, then Needed, then Completed', () => {
    const names = sortByUrgency([done, needed1, urgent, needed2]).map((i) => i.name)
    expect(names).toEqual(['urgent', 'needed1', 'needed2', 'done'])
  })

  it('keeps the original order inside each group', () => {
    const names = sortByUrgency([needed2, needed1]).map((i) => i.name)
    expect(names).toEqual(['needed2', 'needed1'])
  })

  it('does not change the list it was given', () => {
    const list = [needed1, urgent]
    sortByUrgency(list)
    expect(list).toEqual([needed1, urgent])
  })
})

describe('getPercent', () => {
  it('rounds to a whole percent', () => {
    expect(getPercent({ pledged_qty: 1, target_qty: 3 })).toBe(33)
  })

  it('never goes above 100', () => {
    expect(getPercent({ pledged_qty: 12, target_qty: 10 })).toBe(100)
  })

  it('returns 0 instead of dividing by zero', () => {
    expect(getPercent({ pledged_qty: 0, target_qty: 0 })).toBe(0)
  })
})
