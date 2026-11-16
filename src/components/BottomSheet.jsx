export default function BottomSheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      {/* dark background: tap to close */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* the white sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        data-cy="bottom-sheet"
        className="relative max-h-[90vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl bg-white p-5 pb-8"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="bottom-sheet-title" className="text-xl font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="font-semibold text-primary">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}