import { Link } from 'react-router-dom'
import { formatDate, formatRM, pledgeAmount } from '../utils/format'

// One card on "Donations waiting" (Figma "8 Admin donations waiting").
// Tapping it opens the detail page, where the admin checks the
// receipt and then confirms or declines.
export default function PledgeRow({ pledge }) {
  const item = pledge.wishlist_items // the embedded wish list item
  const amount = pledgeAmount(pledge.qty, item?.unit_price)

  return (
    <Link
      to={`/admin/donations/${pledge.id}`}
      className="flex items-center gap-3 rounded-2xl border-2 border-line bg-white p-4 transition active:scale-[0.98]"
      data-cy="pledge-row"
    >
      <div className="min-w-0 flex-1">
        {/* Donor + Pending badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-ink">{pledge.donor_name}</h2>
            <p className="truncate text-sm text-muted">{pledge.donor_email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand">
            Pending
          </span>
        </div>

        {/* What they pledged */}
        <p className="mt-3 text-ink">
          {item?.name ?? 'Unknown item'} × {pledge.qty}
        </p>

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
