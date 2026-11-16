import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePledge } from '../hooks/usePledge'
import { usePledgeDecision } from '../hooks/usePledgeDecision'
import DetailRow from '../components/DetailRow'
import ReceiptPreview from '../components/ReceiptPreview'
import ConfirmPledgeSheet from '../components/ConfirmPledgeSheet'
import DeclinePledgeSheet from '../components/DeclinePledgeSheet'
import { formatDate, formatRM, pledgeAmount } from '../utils/format'
import { progressAfterConfirm } from '../utils/pledgeProgress'

// What to say when a pledge is no longer waiting
const doneText = {
  confirmed: 'This donation was already confirmed.',
  rejected: 'This donation was already declined.',
}

// Admin: one pledge in full, with its receipt, and Confirm / Decline.
export default function AdminDonationDetail() {
  const { id } = useParams() // from the address /admin/donations/:id
  const navigate = useNavigate()
  const { pledge, receiptUrl, receiptError, loading, loadError } = usePledge(id)
  const { decide, deciding, decisionError, clearError } = usePledgeDecision(id)
  const [sheet, setSheet] = useState(null) // which sheet is open: null, 'confirm' or 'decline'

  function openSheet(name) {
    clearError()
    setSheet(name)
  }

  // status: 'confirmed' or 'rejected'
  async function handleDecision(status) {
    const ok = await decide(status)
    if (!ok) return // error is shown inside the sheet; it stays open
    const verb = status === 'confirmed' ? 'Confirmed' : 'Declined'
    // Back to the list with a message. replace: Back won't return to this pledge.
    navigate('/admin/donations', {
      replace: true,
      state: { message: `${verb} ${pledge.donor_name}'s donation.` },
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

      {/* Actions (Figma: Confirm filled, Decline red outline) */}
      {isPending && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openSheet('confirm')}
            className="rounded-xl bg-primary py-3 font-semibold text-white"
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
