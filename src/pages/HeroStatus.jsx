import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useHeroStatus } from '../hooks/useHeroStatus'
import HeroBadge from '../components/HeroBadge'
import BottomSheet from '../components/BottomSheet'
import TransferDetails from '../components/TransferDetails'
import { formatDate } from '../utils/format'
import { formatHeroAmount } from '../utils/heroAmount'
import { nextTransferDate } from '../utils/heroDates'
import { BADGES, getHeroBadges } from '../utils/heroBadges'
import { forgetHeroId, getHeroId } from '../utils/heroStorage'

// The badges shown in "Badges you can earn", in order
const EARNABLE = ['kids-hero', 'bronze', 'silver', 'gold']

// Text for each status (header, pill and explanation)
const statusText = {
  pending: {
    title: (name) => `Thanks, ${name}!`,
    intro: "We're checking your transfer. Your Kids Hero badge appears here once the home confirms it.",
    pill: 'Pending',
    pillClass: 'bg-needed-bg text-needed-text',
  },
  active: {
    title: (name) => `Thank you, ${name}!`,
    intro: 'Your monthly gift is now active. Here is your Kids Hero badge.',
    pill: 'Confirmed',
    pillClass: 'bg-green-100 text-green-800',
  },
  failed: {
    title: () => "We couldn't confirm your transfer",
    intro: 'The home could not match your transfer to this subscription. You can sign up again any time.',
    pill: 'Not confirmed',
    pillClass: 'bg-urgent-bg text-urgent-text',
  },
}

// Donor's Kids Hero page: /hero/:id (Figma "6 Kids Hero profile").
// No login: the id in the address works like a private link.
export default function HeroStatus() {
  const { id } = useParams()
  const { hero, loading, error, notFound, reload } = useHeroStatus(id)
  const [showTransfer, setShowTransfer] = useState(false)
  const [checking, setChecking] = useState(false)

  // If the saved id no longer exists, stop showing "My Kids Hero badge" in the menu
  useEffect(() => {
    if (notFound && getHeroId() === id) forgetHeroId()
  }, [notFound, id])

  async function checkAgain() {
    setChecking(true)
    await reload()
    setChecking(false)
  }

  const backToHeroes = (
    <Link to="/kids-heroes" className="mt-6 block w-full rounded-xl border-2 border-primary py-3 text-center font-semibold text-primary">
      Back to Kids Heroes
    </Link>
  )

  if (loading) return <p className="text-muted" data-cy="hero-status-loading">Loading your Kids Hero status…</p>

  if (error) {
    return (
      <div className="rounded-2xl bg-urgent-bg p-4" role="alert" data-cy="hero-status-error">
        <p className="text-sm text-urgent-text">{error}</p>
        <button
          onClick={checkAgain}
          disabled={checking}
          className="mt-3 rounded-xl border border-urgent-text px-3 py-2 text-sm font-semibold text-urgent-text disabled:opacity-60"
        >
          {checking ? 'Trying…' : 'Try again'}
        </button>
      </div>
    )
  }

  if (notFound) {
    return (
      <div data-cy="hero-status-not-found">
        <h1 className="text-2xl font-bold text-ink">Kids Hero not found</h1>
        <p className="mt-2 text-muted">This link doesn't match a Kids Hero subscription. Please check the address.</p>
        {backToHeroes}
      </div>
    )
  }

  const text = statusText[hero.status] ?? statusText.pending
  const monthly = formatHeroAmount(hero.amount)
  const isActive = hero.status === 'active'
  const next = isActive && hero.started_at ? nextTransferDate(hero.started_at) : null
  const badges = getHeroBadges(hero)

  return (
    <div data-cy={`hero-status-${hero.status}`}>
      {/* Navy header band, full width (cancels the page padding) */}
      <section className="-mx-4 -mt-6 rounded-b-3xl bg-brand px-4 pb-6 pt-6">
        <h1 className="text-2xl font-bold text-highlight">{text.title(hero.first_name)}</h1>
        <p className="mt-2 text-white">{text.intro}</p>
      </section>

      {/* Badge card: pending → Status Pending; active → Kids Hero + season badge; failed → none */}
      <section
        className={`mt-6 rounded-2xl border-2 p-6 text-center ${
          isActive ? 'border-highlight bg-yellow-50' : 'border-line bg-white'
        }`}
      >
        {badges.length > 0 && (
          <div className="flex flex-wrap items-start justify-center gap-4">
            {badges.map((slug) => (
              <HeroBadge key={slug} slug={slug} size="lg" />
            ))}
          </div>
        )}
        <p className="mt-4 text-xl font-bold text-ink">{hero.first_name}</p>
        <p className="mt-1 text-muted">Monthly Kids Hero · {monthly} / month</p>
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${text.pillClass}`} data-cy="hero-status-pill">
          {text.pill}
        </span>
        {isActive && hero.started_at && (
          <p className="mt-3 text-sm text-muted">Kids Hero since {formatDate(hero.started_at)}</p>
        )}
      </section>

      {/* Badges you can earn: earned ones in colour, the rest locked (hidden if not confirmed or failed) */}
      {hero.status !== 'failed' && (
        <section className="mt-4 rounded-2xl border border-line bg-white p-4" data-cy="hero-earnable">
          <h2 className="font-semibold text-brand">Badges you can earn</h2>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {EARNABLE.map((slug) => (
              <div key={slug} className="flex flex-col items-center text-center">
                <HeroBadge slug={slug} locked={!badges.includes(slug)} showLabel={false} />
                <p className="mt-1 text-xs text-muted">{BADGES[slug].caption}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active: monthly gift + next transfer */}
      {isActive && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-sm text-muted">Monthly gift</p>
            <p className="mt-1 text-xl font-bold text-ink">{monthly}</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-sm text-muted">Next transfer</p>
            <p className="mt-1 text-xl font-bold text-ink" data-cy="hero-next-transfer">
              {next ? formatDate(next.toISOString()) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Pending: let them look again without reloading the whole app */}
      {hero.status === 'pending' && (
        <button
          onClick={checkAgain}
          disabled={checking}
          className="mt-4 w-full rounded-xl border-2 border-primary py-3 font-semibold text-primary disabled:opacity-60"
          data-cy="hero-check-again"
        >
          {checking ? 'Checking…' : 'Check again'}
        </button>
      )}

      {hero.status !== 'failed' && (
        <section className="mt-4 rounded-2xl bg-accent p-4">
          <h2 className="font-semibold text-brand">Where your gift goes</h2>
          <p className="mt-1 text-sm text-brand">
            Your monthly gift helps cover rent, salaries and utility bills so the home can care for its residents
            full-time.
          </p>
        </section>
      )}

      {/* Active: monthly transfer reminder (Figma 6b) */}
      {isActive && (
        <button
          onClick={() => setShowTransfer(true)}
          className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-white"
          data-cy="hero-show-transfer"
        >
          See transfer details
        </button>
      )}

      {backToHeroes}

      {showTransfer && (
        <BottomSheet title="Transfer details" onClose={() => setShowTransfer(false)}>
          <TransferDetails title={`Transfer ${monthly} every month to:`} />
          <p className="mt-4 text-sm text-muted">
            Please add the reference <span className="font-semibold text-ink">{id.slice(0, 8).toUpperCase()}</span>{' '}
            to your transfer note.
          </p>
        </BottomSheet>
      )}
    </div>
  )
}
