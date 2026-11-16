import BottomSheet from './BottomSheet'
import { itemCount } from '../utils/selection'

// "Are you sure?" sheet shown before archiving.
// count: how many items are selected. archiving: true while saving.
export default function ArchiveConfirm({ count, archiving, error, onCancel, onConfirm }) {
  // While archiving, ignore taps on the dark background / Close
  const close = () => {
    if (!archiving) onCancel()
  }

  return (
    <BottomSheet title={`Archive ${itemCount(count)}?`} onClose={close}>
      <p className="text-ink">
        {count === 1 ? 'It' : 'They'} will be removed from the public wish list and from this list.
      </p>
      <p className="mt-2 font-semibold text-urgent-text">This can't be undone.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text" data-cy="archive-error">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={close}
          disabled={archiving}
          className="rounded-xl border-2 border-primary py-3 font-semibold text-primary disabled:opacity-60"
          data-cy="archive-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={archiving}
          className="rounded-xl bg-urgent-text py-3 font-semibold text-white disabled:opacity-60"
          data-cy="archive-confirm"
        >
          {archiving ? 'Archiving…' : 'Archive'}
        </button>
      </div>
    </BottomSheet>
  )
}
