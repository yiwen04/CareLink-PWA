import { describe, it, expect } from 'vitest'
import { formatHeroAmount, sortTiers, tierLabel, validateCustomAmount } from './heroAmount'

describe('validateCustomAmount', () => {
  it.each(['10', '75', ' 100 '])('accepts "%s"', (text) => {
    expect(validateCustomAmount(text)).toBeNull()
  })

  it('needs an amount', () => {
    expect(validateCustomAmount('   ')).toMatch(/enter an amount/i)
  })

  it.each(['12.50', '-5', 'abc', 'RM20', '1e3'])('rejects "%s" (whole ringgit only)', (text) => {
    expect(validateCustomAmount(text)).toMatch(/whole number/)
  })

  it('has a minimum of RM10, like the database rule', () => {
    expect(validateCustomAmount('9')).toMatch(/minimum is RM10/)
    expect(validateCustomAmount('0')).toMatch(/minimum is RM10/)
  })
})

describe('formatHeroAmount', () => {
  it('drops .00 for whole ringgit', () => {
    expect(formatHeroAmount(50)).toBe('RM50')
    expect(formatHeroAmount('30.00')).toBe('RM30')
  })

  it('keeps sen when there are some', () => {
    expect(formatHeroAmount(12.5)).toBe('RM12.50')
  })
})

describe('tierLabel', () => {
  it('labels fixed and custom tiers', () => {
    expect(tierLabel({ amount: 30, is_custom: false })).toBe('RM30 / month')
    expect(tierLabel({ amount: null, is_custom: true })).toBe('Custom amount')
  })
})

describe('sortTiers', () => {
  it('puts fixed tiers cheapest first and Custom last', () => {
    const tiers = [
      { name: 'Custom', amount: null, is_custom: true },
      { name: '50', amount: 50, is_custom: false },
      { name: '30', amount: '30', is_custom: false },
    ]
    expect(sortTiers(tiers).map((t) => t.name)).toEqual(['30', '50', 'Custom'])
  })
})
