import { Link } from 'react-router-dom'
import { formatDate, formatRM, pledgeAmount } from '../utils/format'
import { confirmCheck, isStale } from '../utils/pledgeLimits'

// One card on "Donations waiting" (Figma "8 Admin donations waiting").
// Tapping it opens the detail page, where the admin checks the
// receipt and then confirms or declines.
// availability: this item's totals (or undefined if unknown).
export default function PledgeRow({ pledge, availability }) {
  const item = pledge.wishlist_items // the embedded wish list item
  const amount = pledgeAmount(pledge.qty, item?.unit_price)
  const stale = isStale(pledge)
  const check = confirmCheck(availability, pledge.qty)

  return (
    <Link
      to={`/admin/donations/${pledge.id}`}
      className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-4 transition active:scale-[0.98] ${
        stale ? 'border-urgent-text' : 'border-line'
      }`}
      data-cy="pledge-row"
    >
      <div className="min-w-0 flex-1">
        {/* Donor + status badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-ink">{pledge.donor_name}</h2>
            <p className="truncate text-sm text-muted">{pledge.donor_email}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {stale && (
              <span className="rounded-full bg-urgent-bg px-3 py-1 text-sm font-semibold text-urgent-text" data-cy="pledge-stale">
                Stale
              </span>
            )}
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand">Pending</span>
          </div>
        </div>

        {/* What they pledged */}
        <p className="mt-3 text-ink">
          {item?.name ?? 'Unknown item'} × {pledge.qty}
        </p>

        {/* How much the item needs vs how much is already confirmed */}
        {check.known && (
          <p className="mt-1 text-sm text-muted" data-cy="pledge-needed-confirmed">
            Needed {check.needed} / Confirmed {check.confirmed}
          </p>
        )}
        {check.exceeds && (
          <p className="mt-1 text-sm font-semibold text-urgent-text" data-cy="pledge-exceeds">
            This would exceed the amount needed
          </p>
        )}
        {stale && <p className="mt-1 text-sm text-urgent-text">No receipt after 2 days. Decline to free the quantity.</p>}

        {/* Amount (only if the item has a price) + date */}
        <div className="mt-2 flex items-baseline gap-3">
          {amount !== null && <p className="font-bold text-ink">{formatRM(amount)}</p>}
          {/* ml-auto pushes the date to the right even when there's no amount */}
          <p className="ml-auto text-sm text-muted">{formatDate(pledge.created_at)}</p>
        </div>
      </div>

      {/* Chevron: hints that the card opens a page */}
      <span aria-hidden="true" className="text-2xl text-muted">›</span>
    </Link>
  )
}
