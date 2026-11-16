import { usePendingPledges } from '../hooks/usePendingPledges'
import { useFlashMessage } from '../hooks/useFlashMessage'
import PledgeRow from '../components/PledgeRow'

// Admin: pledges waiting to be checked against the bank statement.
// Oldest first. Tap a card to open it and confirm or decline.
export default function AdminDonations() {
  const { pledges, loading, error, reload } = usePendingPledges()
  const [flash] = useFlashMessage() // e.g. "Confirmed Aisha's donation."

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Donations waiting</h1>
      <p className="mt-2 text-muted">
        Match each donation against your bank statement, then confirm it.
      </p>

      {flash && (
        <p role="status" className="mt-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800" data-cy="donations-flash">
          {flash}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <p className="mt-6 text-muted" data-cy="donations-loading">
          Loading donations…
        </p>
      )}

      {/* Error state, with a way to retry */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl bg-urgent-bg p-4" role="alert" data-cy="donations-error">
          <p className="text-sm text-urgent-text">{error}</p>
          <button
            onClick={reload}
            className="mt-3 rounded-xl border border-urgent-text px-3 py-2 text-sm font-semibold text-urgent-text"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && pledges.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-center" data-cy="donations-empty">
          <p className="font-semibold text-ink">No donations waiting</p>
          <p className="mt-1 text-sm text-muted">New pledges will appear here.</p>
        </div>
      )}

      {/* The list */}
      {!loading && !error && pledges.length > 0 && (
        <ul className="mt-4 space-y-4" data-cy="donations-list">
          {pledges.map((pledge) => (
            <li key={pledge.id}>
              <PledgeRow pledge={pledge} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
