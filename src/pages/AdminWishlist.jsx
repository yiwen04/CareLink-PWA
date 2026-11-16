import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminWishlist } from '../hooks/useAdminWishlist'
import { useArchiveItems } from '../hooks/useArchiveItems'
import AdminItemRow from '../components/AdminItemRow'
import ArchiveConfirm from '../components/ArchiveConfirm'
import { itemCount, toggleId } from '../utils/selection'

// Admin: list of active wish list items (Figma "9 Admin wishlist manager").
// Normal mode: tap a row to edit it, "+ Add item" to add one.
// Select mode: tick rows, then "Archive (n)" archives them all at once.
export default function AdminWishlist() {
  const { items, loading, error, reload } = useAdminWishlist()
  const { archive, archiving, archiveError, clearError } = useArchiveItems()

  const location = useLocation()
  const navigate = useNavigate()

  // Green success message. Starts with the message passed from the form
  // after saving (e.g. 'Saved "Rice".'), and is reused after archiving.
  const [flash, setFlash] = useState(() => location.state?.message)

  // Remove the form's message from browser history, so a refresh doesn't show it again
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  // Select mode
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState(() => new Set()) // ids of ticked rows
  const [confirming, setConfirming] = useState(false) // is the "Are you sure?" sheet open

  function startSelecting() {
    setFlash(null)
    setSelecting(true)
  }

  function stopSelecting() {
    setSelecting(false)
    setSelected(new Set())
  }

  function toggle(id) {
    setSelected((current) => toggleId(current, id))
  }

  function openConfirm() {
    clearError()
    setConfirming(true)
  }

  async function confirmArchive() {
    const count = await archive([...selected])
    if (count === null) return // failed: keep the sheet + ticks so they can retry
    setConfirming(false)
    stopSelecting()
    setFlash(`Archived ${itemCount(count)}.`)
    await reload() // fetch the list again; archived items are gone from it
  }

  const hasItems = !loading && !error && items.length > 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Manage wishlist</h1>

      {flash && (
        <p role="status" className="mt-4 rounded-xl bg-green-100 px-4 py-3 text-sm text-green-800" data-cy="admin-wishlist-flash">
          {flash}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <p className="mt-6 text-muted" data-cy="admin-wishlist-loading">
          Loading items…
        </p>
      )}

      {/* Error state, with a way to retry */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl bg-urgent-bg p-4" role="alert" data-cy="admin-wishlist-error">
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
      {!loading && !error && items.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-center" data-cy="admin-wishlist-empty">
          <p className="font-semibold text-ink">No items yet</p>
          <p className="mt-1 text-sm text-muted">Tap “Add item” to post the first need.</p>
        </div>
      )}

      {/* The list */}
      {hasItems && (
        <>
          {/* Toolbar: count on the left, Select / Cancel on the right */}
          <div className="mt-4 flex items-center justify-between px-1">
            <p className="text-sm text-muted" data-cy="admin-wishlist-count">
              {selecting ? `${selected.size} selected` : itemCount(items.length)}
            </p>
            <button
              type="button"
              onClick={selecting ? stopSelecting : startSelecting}
              className="py-2 text-sm font-semibold text-primary"
              data-cy="admin-select-toggle"
            >
              {selecting ? 'Cancel' : 'Select'}
            </button>
          </div>

          {/* pb-16 keeps the last row from hiding under the floating button / action bar */}
          <ul className="mt-2 space-y-4 pb-16" data-cy="admin-wishlist-list">
            {items.map((item) => (
              <li key={item.id}>
                <AdminItemRow
                  item={item}
                  selecting={selecting}
                  selected={selected.has(item.id)}
                  onToggle={toggle}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Bottom of the screen: "Archive (n)" in select mode, otherwise "+ Add item".
          bottom-16 sits just above the bottom nav. */}
      {selecting && hasItems ? (
        <div className="fixed inset-x-0 bottom-16 z-10 mx-auto max-w-md px-4 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={openConfirm}
            disabled={selected.size === 0}
            className="w-full rounded-xl bg-urgent-text py-3 font-semibold text-white shadow-lg disabled:bg-muted disabled:opacity-60"
            data-cy="admin-archive-button"
          >
            Archive ({selected.size})
          </button>
        </div>
      ) : (
        <Link
          to="/admin/wishlist/new"
          className="fixed bottom-24 right-4 z-10 flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-lg transition active:scale-95"
          data-cy="admin-add-item"
        >
          <span aria-hidden="true" className="text-xl leading-none">+</span>
          Add item
        </Link>
      )}

      {confirming && (
        <ArchiveConfirm
          count={selected.size}
          archiving={archiving}
          error={archiveError}
          onCancel={() => setConfirming(false)}
          onConfirm={confirmArchive}
        />
      )}
    </div>
  )
}
