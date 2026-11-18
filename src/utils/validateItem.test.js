import { describe, it, expect } from 'vitest'
import { validateItem, toItemRow } from './validateItem'
import { ITEM_TYPES, itemTypeIcon } from './itemTypes'

describe('itemTypes', () => {
  it('has the 7 types in order', () => {
    expect(ITEM_TYPES).toEqual([
      'Food',
      'Medical & Therapy',
      'Education',
      'Daily Essentials',
      'Equipment',
      'Bills & Maintenance',
      'Others',
    ])
  })

  it('has an icon for every type, and a fallback', () => {
    for (const type of ITEM_TYPES) expect(itemTypeIcon(type)).toBeTruthy()
    expect(itemTypeIcon('Unknown')).toBe(itemTypeIcon('Others'))
  })
})

// A valid form; each test changes one field
const good = {
  name: 'Rice (10kg bag)',
  description: '',
  target_qty: '10',
  unit_price: '',
  urgency: 'medium',
  item_type: 'Food',
}

describe('validateItem', () => {
  it('accepts a valid item', () => {
    expect(validateItem(good)).toEqual({})
  })

  it('needs a name that is not just spaces', () => {
    expect(validateItem({ ...good, name: '   ' }).name).toBeDefined()
  })

  it('allows 100 characters of name but not 101', () => {
    expect(validateItem({ ...good, name: 'a'.repeat(100) }).name).toBeUndefined()
    expect(validateItem({ ...good, name: 'a'.repeat(101) }).name).toBeDefined()
  })

  it('allows 500 characters of description but not 501', () => {
    expect(validateItem({ ...good, description: 'a'.repeat(500) }).description).toBeUndefined()
    expect(validateItem({ ...good, description: 'a'.repeat(501) }).description).toBeDefined()
  })

  it.each(['0', '-1', '2.5', 'abc', ''])('rejects target quantity "%s"', (target_qty) => {
    expect(validateItem({ ...good, target_qty }).target_qty).toBeDefined()
  })

  it('does not let the target go below what is already pledged', () => {
    expect(validateItem({ ...good, target_qty: '4' }, 5).target_qty).toMatch(/5 already pledged/)
    expect(validateItem({ ...good, target_qty: '5' }, 5).target_qty).toBeUndefined()
  })

  it.each(['12', '12.5', '12.50', '0.01'])('accepts price "%s"', (unit_price) => {
    expect(validateItem({ ...good, unit_price }).unit_price).toBeUndefined()
  })

  it.each(['0', '0.00', '12.345', '-5', 'RM5', '1e3'])('rejects price "%s"', (unit_price) => {
    expect(validateItem({ ...good, unit_price }).unit_price).toBeDefined()
  })

  it.each(ITEM_TYPES)('accepts item type "%s"', (item_type) => {
    expect(validateItem({ ...good, item_type }).item_type).toBeUndefined()
  })

  it.each(['', 'food', 'Toys', undefined])('rejects item type %j', (item_type) => {
    expect(validateItem({ ...good, item_type }).item_type).toBeDefined()
  })

  it('only allows Urgent (high) or Needed (medium)', () => {
    expect(validateItem({ ...good, urgency: 'high' }).urgency).toBeUndefined()
    expect(validateItem({ ...good, urgency: 'low' }).urgency).toBeDefined()
  })
})

describe('toItemRow', () => {
  it('trims text and turns empty optional boxes into null', () => {
    expect(toItemRow({ ...good, name: '  Rice  ', description: '   ' })).toEqual({
      name: 'Rice',
      description: null,
      target_qty: 10,
      unit_price: null,
      urgency: 'medium',
      item_type: 'Food',
    })
  })

  it('turns the price into a number', () => {
    expect(toItemRow({ ...good, unit_price: '12.50' }).unit_price).toBe(12.5)
  })

  it('never includes pledged_qty or status', () => {
    const row = toItemRow(good)
    expect(row).not.toHaveProperty('pledged_qty')
    expect(row).not.toHaveProperty('status')
  })
})
