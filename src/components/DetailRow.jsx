// One "Label ........ Value" line, as in the Figma confirm sheet.
// Rows are separated by a thin line (except the last one).
export default function DetailRow({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-ink">{children}</dd>
    </div>
  )
}
