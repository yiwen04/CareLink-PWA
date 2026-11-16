import BottomSheet from './BottomSheet'
import DetailRow from './DetailRow'
import { formatDate, formatRM } from '../utils/format'

// "Confirm this donation?" (Figma "8a Confirm donation sheet").
// progress comes from progressAfterConfirm(); amount may be null (no price).
export default function ConfirmPledgeSheet({ pledge, amount, progress, busy, error, onCancel, onConfirm }) {
  const itemName = pledge.wishlist_items?.name ?? 'this item'

  // While saving, ignore taps on the dark background / Close
  const close = () => {
    if (!busy) onCancel()
  }

  return (
    <BottomSheet title="Confirm this donation?" onClose={close}>
      <dl>
        <DetailRow label="Donor">{pledge.donor_name}</DetailRow>
        <DetailRow label="Pledge">
          {itemName} × {pledge.qty}
        </DetailRow>
        {amount !== null && <DetailRow label="Amount">{formatRM(amount)}</DetailRow>}
        <DetailRow label="Submitted">{formatDate(pledge.created_at)}</DetailRow>
      </dl>

      {/* What will happen to the public progress bar */}
      {progress && (
        <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm text-brand" data-cy="confirm-progress-note">
          {progress.alreadyFull
            ? `${itemName} is already fully pledged (${progress.target} of ${progress.target}), so the progress won't change.`
            : `Wishlist progress for ${itemName} will change from ${progress.before} of ${progress.target} to ${progress.after} of ${progress.target} pledged.`}
        </p>
      )}

      <p className="mt-4 text-sm text-muted">Only confirm once the transfer appears in your bank statement.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text" data-cy="decision-error">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={close}
          disabled={busy}
          className="rounded-xl border-2 border-primary py-3 font-semibold text-primary disabled:opacity-60"
          data-cy="confirm-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          data-cy="confirm-submit"
        >
          {busy ? 'Confirming…' : 'Confirm donation'}
        </button>
      </div>
    </BottomSheet>
  )
}
