import { describe, it, expect } from 'vitest'
import { itemCount, toggleId } from './selection'

describe('toggleId', () => {
  it('adds an id that is not selected', () => {
    expect([...toggleId(new Set(['a']), 'b')]).toEqual(['a', 'b'])
  })

  it('removes an id that is already selected', () => {
    expect([...toggleId(new Set(['a', 'b']), 'a')]).toEqual(['b'])
  })

  it('returns a new Set and leaves the old one alone (so React re-renders)', () => {
    const before = new Set(['a'])
    const after = toggleId(before, 'b')
    expect(after).not.toBe(before)
    expect([...before]).toEqual(['a'])
  })
})

describe('itemCount', () => {
  it('uses "item" for one and "items" for the rest', () => {
    expect(itemCount(1)).toBe('1 item')
    expect(itemCount(0)).toBe('0 items')
    expect(itemCount(3)).toBe('3 items')
  })
})
