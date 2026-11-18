import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionTiers } from '../hooks/useSubscriptionTiers'
import TierOption from '../components/TierOption'
import CustomAmountSheet from '../components/CustomAmountSheet'
import HeroCheckoutSheet from '../components/HeroCheckoutSheet'
import HeroBadge from '../components/HeroBadge'
import { useHeroStatus } from '../hooks/useHeroStatus'
import { getHeroId, saveHeroId } from '../utils/heroStorage'
import { BADGES, getHeroBadges } from '../utils/heroBadges'

// The badges a Kids Hero can earn, shown locked as a preview
const PREVIEW_BADGES = ['kids-hero', 'bronze', 'silver', 'gold']

// Kids Heroes: monthly giving (US02, Figma "4 Kids Heroes").
// 1. Pick a tier → 2. (Custom only) choose an amount → 3. checkout sheet.
export default function KidsHeroes() {
  const navigate = useNavigate()
  const { tiers, loading, error, reload } = useSubscriptionTiers()

  const [tierId, setTierId] = useState(null) // which radio is chosen
  const [customText, setCustomText] = useState('') // remembered if the custom sheet reopens
  const [amount, setAmount] = useState(null) // the final monthly amount
  const [sheet, setSheet] = useState(null) // null, 'custom' or 'checkout'

  const tier = tiers.find((t) => t.id === tierId)

  // This device's own subscription (if any), so earned badges show in colour.
  // No saved id, still pending, failed or a lookup error → all badges stay locked.
  const { hero } = useHeroStatus(getHeroId())
  const earned = hero ? getHeroBadges(hero) : []

  // "Become a Kids Hero": custom → ask for the amount first; fixed → straight to checkout
  function handleStart() {
    if (!tier) return
    if (tier.is_custom) {
      setSheet('custom')
    } else {
      setAmount(Number(tier.amount))
      setSheet('checkout')
    }
  }

  function handleCustomContinue(value, text) {
    setCustomText(text)
    setAmount(value)
    setSheet('checkout')
  }

  // Saved! Remember the id on this device (for the "My Kids Hero badge"
  // menu link), then show the status page. replace: Back won't reopen checkout.
  function handleSuccess(id) {
    saveHeroId(id)
    navigate(`/hero/${id}`, { replace: true })
  }

  return (
    <div>
      {/* Navy header band, full width (cancels the page padding) */}
      <section className="-mx-4 -mt-6 rounded-b-3xl bg-brand px-4 pb-6 pt-6">
        <h1 className="text-2xl font-bold text-highlight">Become a Kids Hero</h1>
        <p className="mt-2 text-white">
          Give a fixed amount every month so the home can plan ahead.
        </p>
      </section>

      {/* Badge slots: a preview of what a confirmed Kids Hero gets */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-semibold text-brand">Your Kids Hero badges</h2>
        <p className="text-sm text-muted">
          {earned.includes('kids-hero')
            ? "Badges in colour are the ones you've earned."
            : 'Shown once the home confirms your transfer.'}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-3" data-cy="hero-preview-badges">
          {PREVIEW_BADGES.map((slug) => (
            <div key={slug} className="flex flex-col items-center text-center">
              <HeroBadge slug={slug} locked={!earned.includes(slug)} showLabel={false} />
              <p className="mt-1 text-xs text-muted">{BADGES[slug].caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier choice */}
      <section className="mt-6 rounded-2xl border-2 border-highlight bg-yellow-50 p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xl text-highlight">
            ★
          </span>
          <h2 className="font-semibold text-brand">Give every month as a Kids Hero</h2>
        </div>

        {loading && <p className="mt-4 text-muted" data-cy="hero-tiers-loading">Loading options…</p>}

        {!loading && error && (
          <div className="mt-4 rounded-xl bg-urgent-bg p-4" role="alert" data-cy="hero-tiers-error">
            <p className="text-sm text-urgent-text">{error}</p>
            <button
              onClick={reload}
              className="mt-3 rounded-xl border border-urgent-text px-3 py-2 text-sm font-semibold text-urgent-text"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && tiers.length === 0 && (
          <p className="mt-4 text-muted" data-cy="hero-tiers-empty">
            Kids Heroes isn't open yet. Please check back soon.
          </p>
        )}

        {!loading && !error && tiers.length > 0 && (
          <>
            <fieldset className="mt-4">
              <legend className="sr-only">Choose a monthly amount</legend>
              <div className="space-y-3">
                {tiers.map((t) => (
                  <TierOption key={t.id} tier={t} checked={tierId === t.id} onChange={setTierId} />
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleStart}
              disabled={!tier}
              className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-50"
              data-cy="hero-start"
            >
              Become a Kids Hero
            </button>
          </>
        )}
      </section>

      {sheet === 'custom' && (
        <CustomAmountSheet initial={customText} onClose={() => setSheet(null)} onContinue={handleCustomContinue} />
      )}

      {sheet === 'checkout' && tier && (
        <HeroCheckoutSheet
          tier={tier}
          amount={amount}
          onClose={() => setSheet(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
