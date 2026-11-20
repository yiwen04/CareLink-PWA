import { describe, it, expect } from 'vitest'
import { accountNumberForCopy } from './copyText'

describe('accountNumberForCopy', () => {
  it('removes spaces', () => {
    expect(accountNumberForCopy('2010 6200 1139 45')).toBe('20106200113945')
  })
  it('removes dashes', () => {
    expect(accountNumberForCopy('2010-6200-113945')).toBe('20106200113945')
  })
  it('leaves a clean number alone', () => {
    expect(accountNumberForCopy('20106200113945')).toBe('20106200113945')
  })
  it('handles empty values', () => {
    expect(accountNumberForCopy(undefined)).toBe('')
  })
})
