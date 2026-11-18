import { useGeneralFund } from '../hooks/useGeneralFund'
import { formatRM } from '../utils/format'

// Admin: running total of donations redirected to the General Fund,
// so the money trail stays transparent.
export default function GeneralFundCard() {
  const { fund, error } = useGeneralFund()

  if (error) {
    return (
      <p className="mt-4 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text" data-cy="general-fund-error">
        Couldn't load the General Fund total.
      </p>
    )
  }
  if (!fund) return <p className="mt-4 text-sm text-muted">Loading General Fund…</p>

  return (
    <section className="mt-4 rounded-2xl border border-line bg-white p-4" data-cy="general-fund">
      <p className="text-sm text-muted">General Fund (daily needs)</p>
      <p className="mt-1 text-2xl font-bold text-brand" data-cy="general-fund-total">
        {formatRM(fund.total)}
      </p>
      <p className="mt-1 text-sm text-muted">
        {fund.count === 0
          ? 'Nothing redirected yet.'
          : `From ${fund.count} redirected ${fund.count === 1 ? 'pledge' : 'pledges'}.`}
      </p>
      {fund.unpriced > 0 && (
        <p className="mt-1 text-xs text-muted">
          {fund.unpriced} redirected {fund.unpriced === 1 ? 'pledge is' : 'pledges are'} for an item with no price, so
          the total may be higher.
        </p>
      )}
    </section>
  )
}
