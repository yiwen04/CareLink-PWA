import { describe, it, expect } from 'vitest'
import { thankYouSteps } from './thankYouSteps'

describe('thankYouSteps', () => {
  // Bug fix: the thank-you page used to repeat "Transfer RM … using the
  // details below" after checkout, when the donor had already done that step.
  it.each([true, false])('never asks the donor to transfer again (hasReceipt = %s)', (hasReceipt) => {
    for (const step of thankYouSteps(hasReceipt)) {
      expect(step).not.toMatch(/^transfer|details below|reference/i)
    }
  })

  it('mentions the receipt when one was uploaded', () => {
    expect(thankYouSteps(true)[0]).toMatch(/receipt/)
    expect(thankYouSteps(false)[0]).not.toMatch(/receipt/)
  })

  it('has the two Figma steps', () => {
    expect(thankYouSteps(false)).toHaveLength(2)
  })
})
