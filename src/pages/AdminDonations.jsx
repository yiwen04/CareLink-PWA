import { useSearchParams } from 'react-router-dom'
import { usePendingPledges } from '../hooks/usePendingPledges'
import { usePendingHeroes } from '../hooks/usePendingHeroes'
import { useFlashMessage } from '../hooks/useFlashMessage'
import PendingList from '../components/PendingList'
import PledgeRow from '../components/PledgeRow'
import HeroRow from '../components/HeroRow'

// Admin: everything waiting to be checked against the bank statement.
// Two tabs: wish list pledges and Kids Hero subscriptions. Oldest first.
// The tab lives in the address (?tab=heroes), so Back and refresh keep it.
export default function AdminDonations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'heroes' ? 'heroes' : 'pledges'

  const pledges = usePendingPledges()
  const heroes = usePendingHeroes()
  const [flash, setFlash] = useFlashMessage() // e.g. "Confirmed Aisha's donation."

  function showTab(name) {
    setFlash(null)
    // replace: switching tabs doesn't fill up the Back history
    setSearchParams(name === 'heroes' ? { tab: 'heroes' } : {}, { replace: true })
  }

  const tabs = [
    { id: 'pledges', label: 'Pledges', count: pledges.loading ? null : pledges.pledges.length },
    { id: 'heroes', label: 'Kids Heroes', count: heroes.loading ? null : heroes.heroes.length },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Donations waiting</h1>
      <p className="mt-2 text-muted">Match each donation against your bank statement, then confirm it.</p>

      {/* Tabs */}
      <div role="tablist" aria-label="Type of donation" className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-accent p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => showTab(t.id)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
              tab === t.id ? 'bg-white text-brand shadow-sm' : 'text-muted'
            }`}
            data-cy={`donations-tab-${t.id}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="min-w-5 rounded-full bg-needed-bg px-1.5 text-xs text-needed-text">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {flash && (
        <p role="status" className="mt-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800" data-cy="donations-flash">
          {flash}
        </p>
      )}

      <div role="tabpanel">
        {tab === 'pledges' ? (
          <PendingList
            items={pledges.pledges}
            loading={pledges.loading}
            error={pledges.error}
            reload={pledges.reload}
            emptyTitle="No donations waiting"
            emptyText="New pledges will appear here."
            renderItem={(pledge) => <PledgeRow pledge={pledge} />}
            cy="donations"
          />
        ) : (
          <PendingList
            items={heroes.heroes}
            loading={heroes.loading}
            error={heroes.error}
            reload={heroes.reload}
            emptyTitle="No Kids Heroes waiting"
            emptyText="New Kids Hero sign-ups will appear here."
            renderItem={(hero) => <HeroRow hero={hero} />}
            cy="heroes"
          />
        )}
      </div>
    </div>
  )
}
