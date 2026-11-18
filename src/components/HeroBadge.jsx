import { BADGES, badgeSrc } from '../utils/heroBadges'

// A Kids Hero badge image (public/badges/carelink-badge-{slug}-{256|512}.png).
// slug: 'pending' | 'kids-hero' | 'bronze' | 'silver' | 'gold'
// size: 'md' (96px, uses the 256 image) or 'lg' (192px, uses the 512 image).
//       Both images are 2× the shown size, so they stay sharp on phones.
// locked: not earned yet → grey and faded.
// showLabel: name + caption under the image.
const SIZES = {
  md: { px: 96, file: 256 },
  lg: { px: 192, file: 512 },
}

export default function HeroBadge({ slug, size = 'md', locked = false, showLabel = true }) {
  const badge = BADGES[slug]
  if (!badge) return null // unknown slug: show nothing rather than a broken image
  const { px, file } = SIZES[size] ?? SIZES.md
  const alt = `CareLink badge: ${badge.name} - ${badge.caption}${locked ? ' (not earned yet)' : ''}`

  return (
    <div className="flex flex-col items-center text-center" data-cy="hero-badge" data-slug={slug} data-locked={locked}>
      {/* width/height reserve the space, so the page doesn't jump while the image loads */}
      <img
        src={badgeSrc(slug, file)}
        alt={alt}
        width={px}
        height={px}
        className={`h-auto max-w-full ${locked ? 'opacity-40 grayscale' : ''}`}
      />
      {showLabel && (
        <>
          <p className="mt-2 font-semibold text-ink">{badge.name}</p>
          <p className="text-sm text-muted">{badge.caption}</p>
        </>
      )}
    </div>
  )
}
