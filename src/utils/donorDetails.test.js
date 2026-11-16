import { describe, it, expect } from 'vitest'
import { cleanDonor, validateDonor } from './donorDetails'

const good = { name: 'Test Donor', email: 'donor@example.com', phone: '' }

describe('validateDonor', () => {
  it('accepts valid details, phone optional', () => {
    expect(validateDonor(good)).toEqual({})
    expect(validateDonor({ ...good, phone: '012-345 6789' })).toEqual({})
  })

  it('needs a name', () => {
    expect(validateDonor({ ...good, name: '  ' }).name).toBeDefined()
  })

  it('limits the name to 100 characters', () => {
    expect(validateDonor({ ...good, name: 'a'.repeat(100) }).name).toBeUndefined()
    expect(validateDonor({ ...good, name: 'a'.repeat(101) }).name).toBeDefined()
  })

  it.each(['', 'name@example', 'no-at.com', 'a b@c.com'])('rejects email "%s"', (email) => {
    expect(validateDonor({ ...good, email }).email).toBeDefined()
  })

  it('rejects an email over 200 characters', () => {
    expect(validateDonor({ ...good, email: `${'a'.repeat(195)}@x.com` }).email).toBeDefined()
  })

  it('rejects a bad phone number', () => {
    expect(validateDonor({ ...good, phone: 'call me' }).phone).toBeDefined()
  })
})

describe('cleanDonor', () => {
  it('trims and turns an empty phone into null', () => {
    expect(cleanDonor({ name: ' Ali ', email: ' a@b.co ', phone: '  ' })).toEqual({
      donor_name: 'Ali',
      donor_email: 'a@b.co',
      donor_phone: null,
    })
  })
})
