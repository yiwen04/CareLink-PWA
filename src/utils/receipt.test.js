import { describe, it, expect } from 'vitest'
import { isPdfReceipt } from './receipt'

describe('isPdfReceipt', () => {
  it('is true for a .pdf path, in any letter case', () => {
    expect(isPdfReceipt('pledges/abc/receipt.pdf')).toBe(true)
    expect(isPdfReceipt('pledges/abc/receipt.PDF')).toBe(true)
  })

  it('is false for images', () => {
    expect(isPdfReceipt('pledges/abc/receipt.jpg')).toBe(false)
    expect(isPdfReceipt('pledges/abc/receipt.webp')).toBe(false)
  })

  it('is false when there is no receipt', () => {
    expect(isPdfReceipt(null)).toBe(false)
  })
})
