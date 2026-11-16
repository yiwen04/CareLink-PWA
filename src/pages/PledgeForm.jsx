import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One reusable input box with label + error message
function Field({ label, name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold text-ink">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-primary ${
          error ? 'border-urgent-text' : 'border-line'
        }`}
      />
      {error && <span className="mt-1 block text-sm text-urgent-text">{error}</span>}
    </label>
  )
}

export default function PledgeForm() {
  const { id } = useParams() // the item id from the address /pledge/:id
  const [item, setItem] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [showCheckout, setShowCheckout] = useState(false)

  // Load this one item from Supabase
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle()

      if (error || !data) setLoadError('This item is no longer available.')
      else setItem(data)
    }
    load()
  }, [id])

  if (loadError) {
    return (
      <div>
        <p className="text-muted">{loadError}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">← Back to wishlist</Link>
      </div>
    )
  }
  if (!item) return <p className="text-muted">Loading…</p>

  const remaining = item.target_qty - item.pledged_qty
  const price = item.unit_price ? Number(item.unit_price) : null
  const amount = price ? qty * price : null

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Please enter your name.'
    if (!emailPattern.test(form.email.trim())) newErrors.email = 'Please enter a valid email, e.g. name@example.com.'
    if (form.phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(form.phone.trim()))
      newErrors.phone = 'Please enter a valid phone number.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 // true = no errors
  }

  function handlePledge() {
    if (validate()) setShowCheckout(true)
  }

  if (remaining <= 0) {
    return (
      <div>
        <p className="text-muted">This item is fully pledged. Thank you!</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">← Back to wishlist</Link>
      </div>
    )
  }

  const stepButton =
    'flex h-11 w-11 items-center justify-center rounded-xl border-2 border-primary text-xl text-primary disabled:opacity-30'

  return (
    <div>
      <Link to="/" className="text-sm font-semibold text-primary">← Back to wishlist</Link>
      <h1 className="mt-4 text-2xl font-bold text-ink">Pledge an item</h1>

      {/* Item summary */}
      <div className="mt-4 rounded-2xl bg-accent p-4">
        <p className="font-semibold text-brand">{item.name}</p>
        <p className="mt-1 text-sm text-brand">
          {item.pledged_qty} of {item.target_qty} pledged, {remaining} still needed
        </p>
      </div>

      {/* Quantity + amount */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted">Quantity</p>
          <div className="mt-2 flex items-center gap-4">
            <button type="button" className={stepButton} onClick={() => setQty(qty - 1)} disabled={qty <= 1}>−</button>
            <span className="w-6 text-center text-lg font-semibold">{qty}</span>
            <button type="button" className={stepButton} onClick={() => setQty(qty + 1)} disabled={qty >= remaining}>+</button>
          </div>
        </div>
        {amount !== null && (
          <div>
            <p className="text-muted">Pledge amount</p>
            <p className="mt-2 text-2xl font-bold text-brand">RM {amount.toFixed(2)}</p>
          </div>
        )}
      </div>
      {price && <p className="mt-2 text-xs text-muted">Price: RM {price.toFixed(2)} each</p>}

      {/* Donor details */}
      <div className="mt-6 space-y-5">
        <Field label="Your name" name="name" placeholder="Full name" value={form.name} onChange={updateField} error={errors.name} />
        <Field label="Email" name="email" type="email" placeholder="name@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <Field label="Phone (optional)" name="phone" type="tel" placeholder="012-345 6789" value={form.phone} onChange={updateField} error={errors.phone} />
      </div>

      <p className="mt-4 text-sm text-muted">
        We only use your details to confirm your pledge. No account is needed.
      </p>

      <button onClick={handlePledge} className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white">
        Pledge
      </button>

      {/* TEMPORARY: replaced by the checkout sheet in E3 */}
      {showCheckout && <p className="mt-4 text-center text-sm text-green-700">✓ Form looks good. Checkout sheet comes in E3.</p>}
    </div>
  )
}