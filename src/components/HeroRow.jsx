import { Link } from 'react-router-dom'
import { formatDate, formatRM } from '../utils/format'

// One pending Kids Hero on the admin "Donations waiting" list.
// Same card style as PledgeRow. Tapping opens the detail page.
export default function HeroRow({ hero }) {
  return (
    <Link
      to={`/admin/heroes/${hero.id}`}
      className="flex items-center gap-3 rounded-2xl border-2 border-line bg-white p-4 transition active:scale-[0.98]"
      data-cy="hero-row"
    >
      <div className="min-w-0 flex-1">
        {/* Donor + Pending badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-ink">{hero.donor_name}</h2>
            <p className="truncate text-sm text-muted">{hero.donor_email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand">Pending</span>
        </div>

        <p className="mt-3 text-ink">
          Kids Hero{hero.subscription_tiers?.is_custom ? ' · custom amount' : ''}
        </p>

        {/* Monthly amount + date */}
        <div className="mt-2 flex items-baseline gap-3">
          <p className="font-bold text-ink">{formatRM(hero.amount)} / month</p>
          <p className="ml-auto text-sm text-muted">{formatDate(hero.created_at)}</p>
        </div>
      </div>

      <span aria-hidden="true" className="text-2xl text-muted">›</span>
    </Link>
  )
}
