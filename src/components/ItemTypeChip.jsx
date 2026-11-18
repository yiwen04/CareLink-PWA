import { itemTypeIcon } from '../utils/itemTypes'

// Small grey chip showing an item's type, e.g. "🍚 Food".
// Shows nothing if the item has no type (e.g. an older cached response).
export default function ItemTypeChip({ type }) {
  if (!type) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-line bg-page px-2 py-0.5 text-xs text-muted"
      data-cy="item-type-chip"
    >
      <span aria-hidden="true">{itemTypeIcon(type)}</span>
      {type}
    </span>
  )
}
