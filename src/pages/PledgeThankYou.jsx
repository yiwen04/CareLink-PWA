import { Link, useLocation } from 'react-router-dom'
import { thankYouSteps } from '../utils/thankYouSteps'

// Last step of the donor pledge flow.
// PledgeForm sends the pledge summary here as router "state" (kept in the browser
// history, never in the URL). Visitors cannot read pledges back from the database
// (RLS), so if the page is opened directly or refreshed we show a general thank-you.
export default function PledgeThankYou() {
  const { state: pledge } = useLocation()

  const backButton = (
    <Link
      to="/"
      data-cy="thanks-back"
      className="mt-8 block w-full rounded-xl bg-primary py-3 text-center font-semibold text-white"
    >
      Back to wishlist
    </Link>
  )

  if (!pledge) {
    return (
      <div data-cy="pledge-thanks">
        <h1 className="text-2xl font-bold text-ink">Thank you for your support!</h1>
        <p className="mt-2 text-muted">
          If you made a pledge, we will confirm it by email once we receive your transfer.
        </p>
        {backButton}
      </div>
    )
  }

  const { name, itemName, qty, amount, reference, hasReceipt } = pledge

  // The transfer already happened in the checkout sheet, so no bank details here
  const steps = thankYouSteps(hasReceipt)

  return (
    <div data-cy="pledge-thanks">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-primary" aria-hidden="true">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-ink">Thank you, {name}!</h1>
      <p className="mt-2 text-muted">Your pledge is saved. Here is your summary.</p>

      {/* Pledge summary */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-ink">{qty} × {itemName}</p>
          <span className="shrink-0 rounded-full bg-needed-bg px-3 py-1 text-sm font-semibold text-needed-text">
            Pending
          </span>
        </div>
        {amount !== null && <p className="mt-1 text-2xl font-bold text-brand">RM {amount.toFixed(2)}</p>}
        <p className="mt-3 text-sm text-muted">
          Reference: <span data-cy="pledge-reference" className="font-semibold text-ink">{reference}</span>
        </p>
      </div>

      {/* What happens next */}
      <h2 className="mt-6 text-lg font-semibold text-ink">What happens next</h2>
      <ol className="mt-3 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-ink">{step}</span>
          </li>
        ))}
      </ol>

      {backButton}
    </div>
  )
}
