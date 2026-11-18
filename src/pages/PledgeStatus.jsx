import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePledgeStatus } from '../hooks/usePledgeStatus'
import { formatDate, formatRM, pledgeAmount } from '../utils/format'
import { forgetPledgeId, getPledgeId } from '../utils/pledgeStorage'

// Text for each status
const statusText = {
  pending: {
    pill: 'Pending',
    pillClass: 'bg-needed-bg text-needed-text',
    message: "We're checking your transfer. We'll confirm your pledge once it arrives.",
  },
  confirmed: {
    pill: 'Confirmed',
    pillClass: 'bg-green-100 text-green-800',
    message: 'Your pledge is confirmed. Thank you for your support!',
  },
  rejected: {
    pill: 'Not confirmed',
    pillClass: 'bg-urgent-bg text-urgent-text',
    message: "The home couldn't match a transfer to this pledge. You can pledge again any time.",
  },
  redirected: {
    pill: 'General Fund',
    pillClass: 'bg-accent text-brand',
    message: 'This item was already fully funded, so your donation went to the General Fund. Thank you!',
  },
}

// Donor's pledge page: /pledge/status/:id.
// No login: the id in the address works like a private link.
export default function PledgeStatus() {
  const { id } = useParams()
  const { pledge, loading, error, notFound, reload } = usePledgeStatus(id)
  const [checking, setChecking] = useState(false)

  // If the saved id no longer exists, stop showing "My latest pledge" in the menu
  useEffect(() => {
    if (notFound && getPledgeId() === id) forgetPledgeId()
  }, [notFound, id])

  async function checkAgain() {
    setChecking(true)
    await reload()
    setChecking(false)
  }

  const backLink = (
    <Link to="/" className="mt-6 block w-full rounded-xl border-2 border-primary py-3 text-center font-semibold text-primary">
      Back to wish list
    </Link>
  )

  if (loading) return <p className="text-muted" data-cy="pledge-status-loading">Loading your pledge…</p>

  if (error) {
    return (
      <div className="rounded-2xl bg-urgent-bg p-4" role="alert" data-cy="pledge-status-error">
        <p className="text-sm text-urgent-text">{error}</p>
        <button
          onClick={checkAgain}
          disabled={checking}
          className="mt-3 rounded-xl border border-urgent-text px-3 py-2 text-sm font-semibold text-urgent-text disabled:opacity-60"
        >
          {checking ? 'Trying…' : 'Try again'}
        </button>
      </div>
    )
  }

  if (notFound) {
    return (
      <div data-cy="pledge-status-not-found">
        <h1 className="text-2xl font-bold text-ink">Pledge not found</h1>
        <p className="mt-2 text-muted">This link doesn't match a pledge. Please check the address.</p>
        {backLink}
      </div>
    )
  }

  const text = statusText[pledge.status] ?? statusText.pending
  const amount = pledgeAmount(pledge.qty, pledge.unit_price)

  return (
    <div data-cy={`pledge-status-${pledge.status}`}>
      <h1 className="text-2xl font-bold text-ink">Thank you, {pledge.first_name}!</h1>

      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-ink">
            {pledge.qty} × {pledge.item_name}
          </p>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${text.pillClass}`} data-cy="pledge-status-pill">
            {text.pill}
          </span>
        </div>
        {amount !== null && <p className="mt-1 text-2xl font-bold text-brand">{formatRM(amount)}</p>}
        <p className="mt-3 text-sm text-muted">
          Pledged on {formatDate(pledge.created_at)} · Reference{' '}
          <span className="font-semibold text-ink">{id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>

      <p className="mt-4 rounded-2xl bg-accent p-4 text-brand" data-cy="pledge-status-message">
        {text.message}
      </p>

      {pledge.status === 'pending' && (
        <button
          onClick={checkAgain}
          disabled={checking}
          className="mt-4 w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary disabled:opacity-60"
          data-cy="pledge-check-again"
        >
          {checking ? 'Checking…' : 'Check again'}
        </button>
      )}

      {backLink}
    </div>
  )
}
