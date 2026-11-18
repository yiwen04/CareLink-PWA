import BottomSheet from './BottomSheet'
import { formatRM } from '../utils/format'

// "Redirect to General Fund?" — used when the item is already fully funded
// and the donor allowed their donation to go to daily needs instead.
// Saves status 'redirected'. The item's progress does not change.
export default function RedirectPledgeSheet({ pledge, amount, busy, error, onCancel, onRedirect }) {
  // While saving, ignore taps on the dark background / Close
  const close = () => {
    if (!busy) onCancel()
  }

  return (
    <BottomSheet title="Redirect to General Fund?" onClose={close}>
      <p className="text-ink">
        {pledge.donor_name}'s pledge of {pledge.wishlist_items?.name ?? 'this item'} × {pledge.qty}
        {amount !== null ? ` (${formatRM(amount)})` : ''} will be recorded as a General Fund donation for daily needs.
      </p>
      <p className="mt-2 text-sm text-muted">
        The item's progress won't change. The donor will see that their donation went to the General Fund.
      </p>
      <p className="mt-2 font-semibold text-urgent-text">This can't be undone.</p>

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
          data-cy="redirect-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onRedirect}
          disabled={busy}
          className="rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          data-cy="redirect-submit"
        >
          {busy ? 'Redirecting…' : 'Redirect'}
        </button>
      </div>
    </BottomSheet>
  )
}
