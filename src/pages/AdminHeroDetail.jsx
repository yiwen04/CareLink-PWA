import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useHero } from '../hooks/useHero'
import { usePendingDecision } from '../hooks/usePendingDecision'
import DetailRow from '../components/DetailRow'
import ReceiptPreview from '../components/ReceiptPreview'
import DecisionSheet from '../components/DecisionSheet'
import { formatDate, formatRM } from '../utils/format'

// What to say when a subscription is no longer waiting
const doneText = {
  active: 'This Kids Hero is already active.',
  failed: 'This Kids Hero was already marked as failed.',
}

const LIST = '/admin/donations?tab=heroes'

// Admin: one Kids Hero subscription with its receipt, and Activate / Mark failed.
export default function AdminHeroDetail() {
  const { id } = useParams() // from the address /admin/heroes/:id
  const navigate = useNavigate()
  const { hero, receiptUrl, receiptError, loading, loadError } = useHero(id)
  const { decide, deciding, decisionError, clearError } = usePendingDecision('subscriptions', id)
  const [sheet, setSheet] = useState(null) // null, 'activate' or 'fail'

  function openSheet(name) {
    clearError()
    setSheet(name)
  }

  // status: 'active' or 'failed'. started_at is set by the database
  // (trigger set_subscription_started_at), never by this page.
  async function handleDecision(status) {
    const ok = await decide(status)
    if (!ok) return // the error shows inside the sheet; it stays open
    const message =
      status === 'active' ? `${hero.donor_name} is now a Kids Hero.` : `Marked ${hero.donor_name}'s sign-up as failed.`
    navigate(LIST, { replace: true, state: { message } })
  }

  const backLink = (
    <Link to={LIST} className="text-sm font-semibold text-primary">
      ← Back to Kids Heroes
    </Link>
  )

  if (loading) {
    return (
      <div>
        {backLink}
        <p className="mt-6 text-muted">Loading Kids Hero…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div>
        {backLink}
        <p role="alert" className="mt-6 rounded-2xl bg-urgent-bg p-4 text-sm text-urgent-text" data-cy="hero-load-error">
          {loadError}
        </p>
      </div>
    )
  }

  const monthly = `${formatRM(hero.amount)} / month`
  const isPending = hero.status === 'pending'

  return (
    <div>
      {backLink}
      <h1 className="mt-4 text-2xl font-bold text-ink">Check Kids Hero</h1>

      {!isPending && (
        <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm text-brand" data-cy="hero-done">
          {doneText[hero.status] ?? 'This Kids Hero is no longer waiting.'}
          {hero.status === 'active' && hero.started_at && ` Since ${formatDate(hero.started_at)}.`}
        </p>
      )}

      {/* Details */}
      <dl className="mt-4 rounded-2xl border border-line bg-white px-4" data-cy="hero-details">
        <DetailRow label="Plan">{hero.subscription_tiers?.name ?? 'Kids Hero'}</DetailRow>
        <DetailRow label="Amount">{monthly}</DetailRow>
        <DetailRow label="Submitted">{formatDate(hero.created_at)}</DetailRow>
        <DetailRow label="Donor">{hero.donor_name}</DetailRow>
        <DetailRow label="Email">
          <a href={`mailto:${hero.donor_email}`} className="text-primary underline">
            {hero.donor_email}
          </a>
        </DetailRow>
        <DetailRow label="Phone">
          {hero.donor_phone ? (
            <a href={`tel:${hero.donor_phone.replace(/\s/g, '')}`} className="text-primary underline">
              {hero.donor_phone}
            </a>
          ) : (
            <span className="font-normal text-muted">Not given</span>
          )}
        </DetailRow>
      </dl>

      {/* Receipt (10-minute signed link) */}
      <h2 className="mb-2 mt-6 font-semibold text-ink">Transfer receipt</h2>
      <ReceiptPreview path={hero.receipt_path} url={receiptUrl} error={receiptError} />

      {isPending && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openSheet('activate')}
            className="rounded-xl bg-primary py-3 font-semibold text-white"
            data-cy="hero-activate"
          >
            Activate
          </button>
          <button
            type="button"
            onClick={() => openSheet('fail')}
            className="rounded-xl border-2 border-urgent-text bg-white py-3 font-semibold text-urgent-text"
            data-cy="hero-fail"
          >
            Mark failed
          </button>
        </div>
      )}

      {sheet === 'activate' && (
        <DecisionSheet
          title="Activate this Kids Hero?"
          actionLabel="Activate"
          busyLabel="Activating…"
          busy={deciding}
          error={decisionError}
          onCancel={() => setSheet(null)}
          onConfirm={() => handleDecision('active')}
          cy="activate"
        >
          <dl>
            <DetailRow label="Donor">{hero.donor_name}</DetailRow>
            <DetailRow label="Amount">{monthly}</DetailRow>
          </dl>
          <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm text-brand">
            {hero.donor_name.split(' ')[0]} will see the Kids Hero badge on their page, starting today.
          </p>
          <p className="mt-4 text-sm text-muted">Only activate once the first transfer appears in your bank statement.</p>
        </DecisionSheet>
      )}

      {sheet === 'fail' && (
        <DecisionSheet
          title="Mark this sign-up as failed?"
          actionLabel="Mark failed"
          busyLabel="Saving…"
          tone="danger"
          busy={deciding}
          error={decisionError}
          onCancel={() => setSheet(null)}
          onConfirm={() => handleDecision('failed')}
          cy="fail"
        >
          <p className="text-ink">
            {hero.donor_name}'s page will say the transfer couldn't be confirmed. They can sign up again.
          </p>
          <p className="mt-2 font-semibold text-urgent-text">This can't be undone.</p>
        </DecisionSheet>
      )}
    </div>
  )
}
