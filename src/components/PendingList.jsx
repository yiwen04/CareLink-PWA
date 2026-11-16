// Loading / error / empty / list states for a "waiting" list.
// Used by both tabs on Donations waiting (Pledges and Kids Heroes).
// renderItem(item) draws one card. emptyTitle/emptyText: the empty message.
export default function PendingList({ items, loading, error, reload, emptyTitle, emptyText, renderItem, cy }) {
  if (loading) {
    return (
      <p className="mt-6 text-muted" data-cy={`${cy}-loading`}>
        Loading…
      </p>
    )
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl bg-urgent-bg p-4" role="alert" data-cy={`${cy}-error`}>
        <p className="text-sm text-urgent-text">{error}</p>
        <button
          onClick={reload}
          className="mt-3 rounded-xl border border-urgent-text px-3 py-2 text-sm font-semibold text-urgent-text"
        >
          Try again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-center" data-cy={`${cy}-empty`}>
        <p className="font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted">{emptyText}</p>
      </div>
    )
  }

  return (
    <ul className="mt-4 space-y-4" data-cy={`${cy}-list`}>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
