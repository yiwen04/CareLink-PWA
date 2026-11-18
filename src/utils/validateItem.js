import { ITEM_TYPES } from './itemTypes'

// Checks for the admin "Add / Edit item" form.
// Every rule here mirrors a CHECK in the database (see supabase/migrations),
// so the admin sees a friendly message instead of a database error.

export const NAME_MAX = 100
export const DESCRIPTION_MAX = 500
const INT_MAX = 2147483647 // largest value a Postgres "integer" column can hold
const PRICE_MAX = 99999999.99 // numeric(10,2): 8 digits before the dot, 2 after

// Count real characters (an emoji counts as 1), like Postgres char_length does
function charCount(text) {
  return [...text].length
}

// values: what the admin typed, all as strings
//   { name, description, target_qty, unit_price, urgency, item_type }
// pledgedQty: how many are already pledged (0 for a new item)
// Returns an object of error messages. Empty object = all good.
export function validateItem(values, pledgedQty = 0) {
  const errors = {}

  // Name: required, 1–100 characters
  const name = values.name.trim()
  if (!name) {
    errors.name = 'Please enter an item name.'
  } else if (charCount(name) > NAME_MAX) {
    errors.name = `Name must be ${NAME_MAX} characters or fewer.`
  }

  // Description: optional, up to 500 characters
  if (charCount(values.description.trim()) > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`
  }

  // Target quantity: whole number, 1 or more, not below what's already pledged
  const target = values.target_qty.trim()
  if (!/^\d+$/.test(target) || Number(target) < 1) {
    errors.target_qty = 'Enter a whole number of 1 or more.'
  } else if (Number(target) > INT_MAX) {
    errors.target_qty = 'That number is too large.'
  } else if (Number(target) < pledgedQty) {
    errors.target_qty = `${pledgedQty} already pledged, so the target must be ${pledgedQty} or more.`
  }

  // Price per unit: optional. If given, more than 0 with at most 2 decimals.
  const price = values.unit_price.trim()
  if (price) {
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      errors.unit_price = 'Enter a price like 12 or 12.50.'
    } else if (Number(price) <= 0) {
      errors.unit_price = 'Price must be more than RM 0. Leave it empty if there is no price.'
    } else if (Number(price) > PRICE_MAX) {
      errors.unit_price = 'That price is too large.'
    }
  }

  // Type: required, one of the fixed list
  if (!ITEM_TYPES.includes(values.item_type)) {
    errors.item_type = 'Choose an item type.'
  }

  // Urgency: the form only offers Urgent (high) or Needed (medium)
  if (values.urgency !== 'high' && values.urgency !== 'medium') {
    errors.urgency = 'Choose Urgent or Needed.'
  }

  return errors
}

// Turn the form strings into the row we send to Supabase.
// Only call this after validateItem() returned no errors.
// pledged_qty and status are never included, so the form can't change them.
export function toItemRow(values) {
  const description = values.description.trim()
  const price = values.unit_price.trim()
  return {
    name: values.name.trim(),
    description: description || null, // empty box → no description
    target_qty: Number(values.target_qty.trim()),
    unit_price: price ? Number(price) : null, // empty box → no price
    urgency: values.urgency,
    item_type: values.item_type,
  }
}
