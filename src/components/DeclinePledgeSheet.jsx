import BottomSheet from './BottomSheet'

// "Decline this donation?" — e.g. no matching transfer in the bank statement.
// Saves status 'rejected'. The wish list progress does not change.
export default function DeclinePledgeSheet({ pledge, busy, error, onCancel, onDecline }) {
  // While saving, ignore taps on the dark background / Close
  const close = () => {
    if (!busy) onCancel()
  }

  return (
    <BottomSheet title="Decline this donation?" onClose={close}>
      <p className="text-ink">
        {pledge.donor_name}'s pledge of {pledge.wishlist_items?.name ?? 'this item'} × {pledge.qty} will be removed
        from the waiting list. The wish list progress won't change.
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
          data-cy="decline-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={busy}
          className="rounded-xl bg-urgent-text py-3 font-semibold text-white disabled:opacity-60"
          data-cy="decline-submit"
        >
          {busy ? 'Declining…' : 'Decline'}
        </button>
      </div>
    </BottomSheet>
  )
}
