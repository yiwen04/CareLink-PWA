// Wish list item types. Must match the CHECK on wishlist_items.item_type
// (supabase/migrations/20261118_item_type.sql), in this order.
export const ITEM_TYPES = [
  'Food',
  'Medical & Therapy',
  'Education',
  'Daily Essentials',
  'Equipment',
  'Bills & Maintenance',
  'Others',
]

export const DEFAULT_ITEM_TYPE = 'Others'

const ICONS = {
  Food: '🍚',
  'Medical & Therapy': '🩺',
  Education: '📚',
  'Daily Essentials': '🧼',
  Equipment: '🛠️',
  'Bills & Maintenance': '💡',
  Others: '📦',
}

// Emoji for a type; unknown or missing types get the "Others" icon
export function itemTypeIcon(type) {
  return ICONS[type] ?? ICONS.Others
}
