// "What happens next" on the pledge thank-you page.
// The donor has already seen the bank details (and could upload a receipt)
// in the checkout sheet, so these steps never ask them to transfer again.
export function thankYouSteps(hasReceipt) {
  return [
    hasReceipt ? 'The home checks your transfer receipt.' : 'The home checks your transfer.',
    'We email you once your pledge is confirmed, and the wishlist progress updates.',
  ]
}
