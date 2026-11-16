import { HERO_MIN, tierLabel } from '../utils/heroAmount'

// One tier card in the Kids Heroes list (Figma "4 Kids Heroes").
// A real radio button sits underneath (hidden with sr-only), so keyboards
// and screen readers work. "group" + "group-has-checked:" style the
// round dot when this option is chosen.
export default function TierOption({ tier, checked, onChange }) {
  return (
    <label
      className="group flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border-2 border-line bg-white px-4 py-3 transition has-checked:border-highlight has-checked:bg-yellow-100 has-focus-visible:ring-2 has-focus-visible:ring-primary"
      data-cy={`hero-tier-${tier.is_custom ? 'custom' : Number(tier.amount)}`}
    >
      <input
        type="radio"
        name="hero-tier"
        value={tier.id}
        checked={checked}
        onChange={() => onChange(tier.id)}
        className="sr-only"
      />
      {/* The round dot: empty ring, filled when chosen */}
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 rounded-full border-2 border-muted group-has-checked:border-primary group-has-checked:bg-primary group-has-checked:shadow-[inset_0_0_0_4px_white]"
      />
      <span className="flex-1 text-xl font-bold text-brand">{tierLabel(tier)}</span>
      {tier.is_custom && <span className="text-sm font-semibold text-muted">RM{HERO_MIN}+</span>}
    </label>
  )
}
