import { Link, useParams } from 'react-router-dom'
import { useWishlistItem } from '../hooks/useWishlistItem'
import ItemForm from '../components/ItemForm'

// One page for both /admin/wishlist/new and /admin/wishlist/:id.
// No id in the URL → adding. An id → editing that item.
export default function AdminItemForm() {
  const { id } = useParams()
  const isNew = !id
  const { item, loading, loadError, save } = useWishlistItem(id)

  return (
    <div>
      <Link to="/admin/wishlist" className="text-sm font-semibold text-primary">
        ← Back to list
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-ink">{isNew ? 'Add wishlist item' : 'Edit item'}</h1>

      {loading && <p className="mt-6 text-muted">Loading item…</p>}

      {!loading && loadError && (
        <p role="alert" className="mt-6 rounded-2xl bg-urgent-bg p-4 text-sm text-urgent-text" data-cy="item-load-error">
          {loadError}
        </p>
      )}

      {/* On edit, show how far pledges have got (read-only) */}
      {!loading && item && (
        <div className="mt-4 rounded-2xl bg-accent p-4">
          <p className="text-sm text-brand">
            {item.pledged_qty} of {item.target_qty} pledged
          </p>
        </div>
      )}

      {/* key: a fresh, empty form whenever the item changes (e.g. edit → new) */}
      {!loading && !loadError && <ItemForm key={id ?? 'new'} item={item} save={save} />}
    </div>
  )
}
