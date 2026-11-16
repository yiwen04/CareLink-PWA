// The Kids Hero medallion (Figma "6 Kids Hero profile").
// earned: true → gold star on navy with a gold ring.
//         false → dashed empty slot (still waiting).
export default function HeroBadge({ earned }) {
  if (!earned) {
    return (
      <div
        aria-hidden="true"
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-line bg-page text-4xl text-line"
      >
        ★
      </div>
    )
  }
  return (
    <div
      role="img"
      aria-label="Kids Hero badge"
      className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-highlight bg-brand text-5xl text-highlight shadow-md"
      data-cy="hero-badge"
    >
      ★
    </div>
  )
}
