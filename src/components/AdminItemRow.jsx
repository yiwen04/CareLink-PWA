import { Link } from 'react-router-dom'
import { getBadge, getPercent } from '../utils/badge'

// One row on the admin wish list (Figma "AdminItemRow").
// Normal mode: the whole row is a link to the edit page.
// Select mode: the whole row is a checkbox.
export default function AdminItemRow({ item, selecting, selected, onToggle }) {
  const badge = getBadge(item)
  const isCompleted = badge.label === 'Completed'

  // The inside of the row is the same in both modes
  const details = (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-ink">{item.name}</h2>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${badge.style}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3 h-2.5 w-full rounded-full bg-line">
        <div
          className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-700' : 'bg-primary'}`}
          style={{ width: `${getPercent(item)}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted">
        {item.pledged_qty} of {item.target_qty} pledged
      </p>
    </div>
  )

  const rowClass = 'flex items-center gap-3 rounded-2xl border-2 bg-white p-4 transition active:scale-[0.98]'

  if (selecting) {
    // <label> around a real checkbox: tapping anywhere on the row ticks it
    return (
      <label
        className={`${rowClass} cursor-pointer ${selected ? 'border-primary bg-accent' : 'border-line'}`}
        data-cy="admin-wishlist-row"
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(item.id)}
          aria-label={`Select ${item.name}`}
          className="h-5 w-5 shrink-0 accent-primary"
          data-cy="admin-row-checkbox"
        />
        {details}
      </label>
    )
  }

  return (
    <Link to={`/admin/wishlist/${item.id}`} className={`${rowClass} border-line`} data-cy="admin-wishlist-row">
      {details}
      {/* Chevron: hints that the row opens a page */}
      <span aria-hidden="true" className="text-2xl text-muted">›</span>
    </Link>
  )
}
