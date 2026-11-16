import { describe, it, expect } from 'vitest'
import { progressAfterConfirm } from './pledgeProgress'

describe('progressAfterConfirm', () => {
  it('adds the pledge quantity', () => {
    expect(progressAfterConfirm({ pledged_qty: 3, target_qty: 10 }, 2)).toEqual({
      before: 3,
      after: 5,
      target: 10,
      alreadyFull: false,
    })
  })

  it('never goes above the target (like the database trigger)', () => {
    expect(progressAfterConfirm({ pledged_qty: 9, target_qty: 10 }, 5).after).toBe(10)
  })

  it('says when the item is already full', () => {
    const result = progressAfterConfirm({ pledged_qty: 10, target_qty: 10 }, 2)
    expect(result.after).toBe(10)
    expect(result.alreadyFull).toBe(true)
  })
})
