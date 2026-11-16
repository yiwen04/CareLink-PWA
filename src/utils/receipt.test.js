import { describe, it, expect } from 'vitest'
import { isPdfReceipt, subscriptionReceiptPath, validateRequiredReceipt } from './receipt'

// Bug fix: donors could confirm a pledge without uploading a receipt
describe('validateRequiredReceipt', () => {
  it('asks for a receipt when none is chosen', () => {
    expect(validateRequiredReceipt(null)).toBe('Please upload your transfer receipt.')
  })

  it('accepts a small image or PDF', () => {
    expect(validateRequiredReceipt({ type: 'image/jpeg', size: 1000 })).toBeNull()
    expect(validateRequiredReceipt({ type: 'application/pdf', size: 1000 })).toBeNull()
  })

  it('still rejects the wrong type or a file over 5 MB', () => {
    expect(validateRequiredReceipt({ type: 'text/plain', size: 1000 })).toMatch(/JPG, PNG, WEBP/)
    expect(validateRequiredReceipt({ type: 'image/png', size: 6 * 1024 * 1024 })).toMatch(/under 5 MB/)
  })
})

describe('subscriptionReceiptPath', () => {
  it('puts the file in the subscriptions folder (required by the upload policy)', () => {
    expect(subscriptionReceiptPath('abc', { type: 'image/png' })).toBe('subscriptions/abc/receipt.png')
    expect(subscriptionReceiptPath('abc', { type: 'application/pdf' })).toBe('subscriptions/abc/receipt.pdf')
  })
})

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
