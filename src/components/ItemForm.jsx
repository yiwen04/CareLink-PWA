import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from './FormField'
import { DESCRIPTION_MAX, NAME_MAX, toItemRow, validateItem } from '../utils/validateItem'

// Turn a database row (or nothing, for a new item) into form values.
// Inputs always hold strings, so numbers are converted with String().
function toFormValues(item) {
  if (!item) {
    return { name: '', description: '', target_qty: '', unit_price: '', urgency: 'medium' }
  }
  return {
    name: item.name,
    description: item.description ?? '',
    target_qty: String(item.target_qty),
    unit_price: item.unit_price == null ? '' : String(item.unit_price),
    // Old items may still say "low"; the form only offers Urgent or Needed
    urgency: item.urgency === 'high' ? 'high' : 'medium',
  }
}

// Each option uses the same colours as its badge on the list,
// so it never looks like the dark-blue "Save item" button.
// (Tailwind needs full class names written out, so they live here.)
const urgencyOptions = [
  {
    value: 'high',
    label: 'Urgent',
    selected: 'has-checked:border-urgent-text has-checked:bg-urgent-bg has-checked:text-urgent-text',
  },
  {
    value: 'medium',
    label: 'Needed',
    selected: 'has-checked:border-needed-text has-checked:bg-needed-bg has-checked:text-needed-text',
  },
]

// The add/edit form. item = the row being edited, or null when adding.
// save = function from useWishlistItem that writes to Supabase.
export default function ItemForm({ item, save }) {
  const navigate = useNavigate()
  const pledgedQty = item?.pledged_qty ?? 0
  const [values, setValues] = useState(() => toFormValues(item))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Update one field, and clear its error so the red message goes away while typing
  function update(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser reloading the page
    setSaveError(null)

    const newErrors = validateItem(values, pledgedQty)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return // fix errors first

    setSaving(true)
    const message = await save(toItemRow(values))
    if (message) {
      setSaving(false)
      setSaveError(message)
      return
    }
    // Saved: back to the list, with a short message to show there
    navigate('/admin/wishlist', {
      replace: true,
      state: { message: `Saved “${values.name.trim()}”.` },
    })
  }

  // Same box style as the other forms; red border when the field has an error
  function inputClass(field) {
    return `w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-primary ${
      errors[field] ? 'border-urgent-text' : 'border-line'
    }`
  }

  // Accessibility: tell screen readers the field is wrong and where the message is
  function a11y(field) {
    return { 'aria-invalid': !!errors[field], 'aria-describedby': `${field}-msg` }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5" data-cy="item-form">
      <FormField id="name" label="Item name" error={errors.name}>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={update}
          maxLength={NAME_MAX}
          placeholder="e.g. Rice (10kg bag)"
          className={inputClass('name')}
          data-cy="item-name"
          {...a11y('name')}
        />
      </FormField>

      <FormField
        id="description"
        label="Description (optional)"
        hint={`${[...values.description].length}/${DESCRIPTION_MAX}`}
        error={errors.description}
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          onChange={update}
          placeholder="Short note for donors"
          className={inputClass('description')}
          data-cy="item-description"
          {...a11y('description')}
        />
      </FormField>

      <FormField
        id="target_qty"
        label="Target quantity"
        hint={pledgedQty > 0 ? `${pledgedQty} already pledged.` : undefined}
        error={errors.target_qty}
      >
        <input
          id="target_qty"
          name="target_qty"
          inputMode="numeric"
          value={values.target_qty}
          onChange={update}
          placeholder="10"
          className={inputClass('target_qty')}
          data-cy="item-target"
          {...a11y('target_qty')}
        />
      </FormField>

      <FormField
        id="unit_price"
        label="Price per unit (optional)"
        hint="Leave empty if the item has no fixed price."
        error={errors.unit_price}
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">RM</span>
          <input
            id="unit_price"
            name="unit_price"
            inputMode="decimal"
            value={values.unit_price}
            onChange={update}
            placeholder="0.00"
            className={`${inputClass('unit_price')} pl-12`}
            data-cy="item-price"
            {...a11y('unit_price')}
          />
        </div>
      </FormField>

      {/* Urgency: two big tap targets. Real radio buttons underneath, so
          keyboards and screen readers work; has-checked: styles the chosen one.
          The ✓ means the choice isn't shown by colour alone. */}
      <fieldset>
        <legend className="mb-2 font-semibold text-ink">Urgency</legend>
        <div className="grid grid-cols-2 gap-3">
          {urgencyOptions.map((opt) => (
            <label
              key={opt.value}
              className={`group flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-line bg-white font-semibold text-muted has-focus-visible:ring-2 has-focus-visible:ring-primary ${opt.selected}`}
              data-cy={`item-urgency-${opt.value}`}
            >
              <input
                type="radio"
                name="urgency"
                value={opt.value}
                checked={values.urgency === opt.value}
                onChange={update}
                className="sr-only"
              />
              <span aria-hidden="true" className="hidden group-has-checked:inline">✓</span>
              {opt.label}
            </label>
          ))}
        </div>
        {errors.urgency && <p className="mt-1 text-sm text-urgent-text">{errors.urgency}</p>}
      </fieldset>

      {saveError && (
        <p role="alert" className="rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text" data-cy="item-save-error">
          {saveError}
        </p>
      )}

      {/* Cancel + Save, side by side like the Figma sheet */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          to="/admin/wishlist"
          className="flex items-center justify-center rounded-xl border-2 border-primary py-3 font-semibold text-primary"
          data-cy="item-cancel"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          data-cy="item-save"
        >
          {saving ? 'Saving…' : 'Save item'}
        </button>
      </div>
    </form>
  )
}
