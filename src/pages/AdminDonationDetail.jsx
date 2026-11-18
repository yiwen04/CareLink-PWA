import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePledge } from '../hooks/usePledge'
import { usePledgeDecision } from '../hooks/usePledgeDecision'
import DetailRow from '../components/DetailRow'
import ReceiptPreview from '../components/ReceiptPreview'
import ConfirmPledgeSheet from '../components/ConfirmPledgeSheet'
import DeclinePledgeSheet from '../components/DeclinePledgeSheet'
import RedirectPledgeSheet from '../components/RedirectPledgeSheet'
import { useAvailability } from '../hooks/useAvailability'
import { formatDate, formatRM, pledgeAmount } from '../utils/format'
import { progressAfterConfirm } from '../utils/pledgeProgress'
import { confirmCheck } from '../utils/pledgeLimits'

// What to say when a pledge is no longer waiting
const doneText = {
  confirmed: 'This donation was already confirmed.',
  rejected: 'This donation was already declined.',
  redirected: 'This donation was redirected to the General Fund.',
}

const doneVerb = { confirmed: 'Confirmed', rejected: 'Declined', redirected: 'Redirected' }

// Admin: one pledge in full, with its receipt, and Confirm / Decline.
export default function AdminDonationDetail() {
  const { id } = useParams() // from the address /admin/donations/:id
  const navigate = useNavigate()
  const { pledge, receiptUrl, receiptError, loading, loadError } = usePledge(id)
  const { decide, deciding, decisionError, clearError } = usePledgeDecision(id)
  const [sheet, setSheet] = useState(null) // which sheet is open: null, 'confirm', 'decline' or 'redirect'
  // Needed / confirmed totals for this pledge's item (waits until the pledge has loaded)
  const { availability } = useAvailability(pledge?.wishlist_item_id)

  function openSheet(name) {
    clearError()
    setSheet(name)
  }

  // status: 'confirmed', 'rejected' or 'redirected'
  async function handleDecision(status) {
    const ok = await decide(status)
    if (!ok) return // error is shown inside the sheet; it stays open
    // Back to the list with a message. replace: Back won't return to this pledge.
    navigate('/admin/donations', {
      replace: true,
      state: { message: `${doneVerb[status]} ${pledge.donor_name}'s donation.` },
    })
  }

  const backLink = (
    <Link to="/admin/donations" className="text-sm font-semibold text-primary">
      ← Back to donations
    </Link>
  )

  if (loading) {
    return (
      <div>
        {backLink}
        <p className="mt-6 text-muted">Loading donation…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div>
        {backLink}
        <p role="alert" className="mt-6 rounded-2xl bg-urgent-bg p-4 text-sm text-urgent-text" data-cy="donation-load-error">
          {loadError}
        </p>
      </div>
    )
  }

  const item = pledge.wishlist_items
  const amount = pledgeAmount(pledge.qty, item?.unit_price)
  const isPending = pledge.status === 'pending'
  const progress = item ? progressAfterConfirm(item, pledge.qty) : null
  // Would confirming push the confirmed total above the amount needed?
  const check = confirmCheck(availability, pledge.qty)
  const canRedirect = check.exceeds && pledge.allow_general_fund

  return (
    <div>
      {backLink}
      <h1 className="mt-4 text-2xl font-bold text-ink">Check donation</h1>

      {/* Already handled (e.g. by another admin): no buttons */}
      {!isPending && (
        <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm text-brand" data-cy="donation-done">
          {doneText[pledge.status] ?? 'This donation is no longer waiting.'}
        </p>
      )}

      {/* Details */}
      <dl className="mt-4 rounded-2xl border border-line bg-white px-4" data-cy="donation-details">
        <DetailRow label="Pledge">
          {item?.name ?? 'Unknown item'} × {pledge.qty}
        </DetailRow>
        {amount !== null && <DetailRow label="Amount">{formatRM(amount)}</DetailRow>}
        {check.known && (
          <DetailRow label="Item totals">
            <span data-cy="donation-needed-confirmed">
              Needed {check.needed} / Confirmed {check.confirmed}
            </span>
          </DetailRow>
        )}
        <DetailRow label="Submitted">{formatDate(pledge.created_at)}</DetailRow>
        <DetailRow label="Donor">{pledge.donor_name}</DetailRow>
        <DetailRow label="Email">
          <a href={`mailto:${pledge.donor_email}`} className="text-primary underline">
            {pledge.donor_email}
          </a>
        </DetailRow>
        <DetailRow label="Phone">
          {pledge.donor_phone ? (
            <a href={`tel:${pledge.donor_phone.replace(/\s/g, '')}`} className="text-primary underline">
              {pledge.donor_phone}
            </a>
          ) : (
            <span className="font-normal text-muted">Not given</span>
          )}
        </DetailRow>
      </dl>

      {/* Receipt */}
      <h2 className="mt-6 mb-2 font-semibold text-ink">Transfer receipt</h2>
      <ReceiptPreview path={pledge.receipt_path} url={receiptUrl} error={receiptError} />

      {/* Over the amount needed: Confirm is off. Decline, or redirect if the donor allowed it. */}
      {isPending && check.exceeds && (
        <p role="alert" className="mt-6 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text" data-cy="donation-exceeds">
          This would exceed the amount needed.{' '}
          {canRedirect
            ? 'The donor allowed the General Fund, so you can redirect it.'
            : 'You can only decline it.'}
        </p>
      )}

      {/* Actions (Figma: Confirm filled, Decline red outline) */}
      {isPending && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openSheet('confirm')}
            disabled={check.exceeds}
            className="rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-40"
            data-cy="donation-confirm"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => openSheet('decline')}
            className="rounded-xl border-2 border-urgent-text bg-white py-3 font-semibold text-urgent-text"
            data-cy="donation-decline"
          >
            Decline
          </button>
          {canRedirect && (
            <button
              type="button"
              onClick={() => openSheet('redirect')}
              className="col-span-2 rounded-xl border-2 border-primary bg-white py-3 font-semibold text-primary"
              data-cy="donation-redirect"
            >
              Redirect to General Fund
            </button>
          )}
        </div>
      )}

      {sheet === 'confirm' && (
        <ConfirmPledgeSheet
          pledge={pledge}
          amount={amount}
          progress={progress}
          busy={deciding}
          error={decisionError}
          onCancel={() => setSheet(null)}
          onConfirm={() => handleDecision('confirmed')}
        />
      )}

      {sheet === 'redirect' && (
        <RedirectPledgeSheet
          pledge={pledge}
          amount={amount}
          busy={deciding}
          error={decisionError}
          onCancel={() => setSheet(null)}
          onRedirect={() => handleDecision('redirected')}
        />
      )}

      {sheet === 'decline' && (
        <DeclinePledgeSheet
          pledge={pledge}
          busy={deciding}
          error={decisionError}
          onCancel={() => setSheet(null)}
          onDecline={() => handleDecision('rejected')}
        />
      )}
    </div>
  )
}
