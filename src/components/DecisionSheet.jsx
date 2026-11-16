import BottomSheet from './BottomSheet'

// A generic "Are you sure?" sheet with Cancel + one action button.
// tone: 'primary' (dark blue, e.g. Activate) or 'danger' (red, e.g. Mark failed).
// children: the explanation shown above the buttons.
export default function DecisionSheet({
  title,
  children,
  actionLabel,
  busyLabel,
  tone = 'primary',
  busy,
  error,
  onCancel,
  onConfirm,
  cy,
}) {
  // While saving, ignore taps on the dark background / Close
  const close = () => {
    if (!busy) onCancel()
  }

  const actionClass = tone === 'danger' ? 'bg-urgent-text' : 'bg-primary'

  return (
    <BottomSheet title={title} onClose={close}>
      {children}

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
          data-cy={`${cy}-cancel`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`rounded-xl py-3 font-semibold text-white disabled:opacity-60 ${actionClass}`}
          data-cy={`${cy}-submit`}
        >
          {busy ? busyLabel : actionLabel}
        </button>
      </div>
    </BottomSheet>
  )
}
