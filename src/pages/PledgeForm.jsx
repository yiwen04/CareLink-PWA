import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomSheet from '../components/BottomSheet'
import PaymentDetails from '../components/PaymentDetails'
import ItemTypeChip from '../components/ItemTypeChip'
import ReceiptUpload from '../components/ReceiptUpload'
import { receiptPath, validateReceipt, validateRequiredReceipt } from '../utils/receipt'
import { useAvailability } from '../hooks/useAvailability'
import { overPledgedMessage, readOverPledgedError, remainingQty, reservedQty } from '../utils/pledgeLimits'
import { savePledgeId } from '../utils/pledgeStorage'

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
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [showCheckout, setShowCheckout] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [receiptError, setReceiptError] = useState(null)
  const [allowGeneralFund, setAllowGeneralFund] = useState(true)
  const [pageError, setPageError] = useState(null) // e.g. "someone just pledged this item"
  // Reserved quantity: confirmed + pending pledges both count as taken
  const { availability, loading: availLoading, reload: reloadAvailability } = useAvailability(id)

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
  if (!item || availLoading) return <p className="text-muted">Loading…</p>

  const remaining = remainingQty(item, availability)
  const reserved = reservedQty(item, availability)
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
    if (validate()) {
      setSubmitError(null)
      setPageError(null)
      setShowCheckout(true)
    }
  }

  function chooseReceipt(file) {
    setReceipt(file)
    setReceiptError(validateReceipt(file))
  }

  // Save the pledge as "pending". An admin confirms it after the transfer arrives.
  // No .select() after insert: visitors may create pledges but not read them back (RLS).
  // So we make the pledge id here, upload the receipt under it first, then save the row.
  async function confirmPledge() {
    // A receipt is required: stop here (and say why) if none was chosen
    const receiptProblem = validateRequiredReceipt(receipt)
    if (receiptProblem) {
      setReceiptError(receiptProblem)
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const pledgeId = crypto.randomUUID()
    const path = receiptPath(pledgeId, receipt)
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(path, receipt, { contentType: receipt.type, upsert: false })
    if (uploadError) {
      setSubmitting(false)
      setSubmitError('Sorry, we could not upload your receipt. Please try again, or choose a different file.')
      return
    }

    const { error } = await supabase.from('pledges').insert({
      id: pledgeId,
      wishlist_item_id: item.id,
      donor_name: form.name.trim(),
      donor_email: form.email.trim(),
      donor_phone: form.phone.trim() || null,
      qty,
      receipt_path: path,
      allow_general_fund: allowGeneralFund,
    })
    setSubmitting(false)
    if (error) {
      // The database says someone else took the last units first
      const taken = readOverPledgedError(error)
      if (taken) {
        const row = await reloadAvailability() // show the fresh number
        const left = row ? row.qty_remaining : taken.remaining
        setQty(Math.max(1, Math.min(qty, left)))
        setShowCheckout(false)
        setPageError(overPledgedMessage(left))
        return
      }
      setSubmitError('Sorry, we could not save your pledge. Please try again.')
      return
    }

    savePledgeId(pledgeId) // so the donor can find the status page again

    // Go to the thank-you page. "replace" swaps this form out of the history,
    // so pressing Back returns to the wishlist instead of a filled-in form.
    // The summary travels as router state, never in the URL (keeps the name private).
    navigate('/thank-you', {
      replace: true,
      state: {
        name: form.name.trim(),
        itemName: item.name,
        qty,
        amount,
        reference: pledgeId.slice(0, 8).toUpperCase(),
        pledgeId,
        hasReceipt: !!path,
      },
    })
  }

  if (remaining <= 0) {
    return (
      <div>
        {pageError && (
          <p role="alert" data-cy="pledge-taken-error" className="mb-4 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text">
            {pageError}
          </p>
        )}
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
        <div className="mt-1">
          <ItemTypeChip type={item.item_type} />
        </div>
        <p className="mt-1 text-sm text-brand">
          {reserved} of {item.target_qty} pledged, {remaining} still needed
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
      <p className="mt-2 text-sm text-muted" data-cy="pledge-max-note">Only {remaining} still needed</p>
      {price && <p className="mt-1 text-xs text-muted">Price: RM {price.toFixed(2)} each</p>}

      {/* Donor details */}
      <div className="mt-6 space-y-5">
        <Field label="Your name" name="name" placeholder="Full name" value={form.name} onChange={updateField} error={errors.name} />
        <Field label="Email" name="email" type="email" placeholder="name@example.com" value={form.email} onChange={updateField} error={errors.email} />
        <Field label="Phone (optional)" name="phone" type="tel" placeholder="012-345 6789" value={form.phone} onChange={updateField} error={errors.phone} />
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          checked={allowGeneralFund}
          onChange={(e) => setAllowGeneralFund(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-primary"
          data-cy="pledge-general-fund"
        />
        <span className="text-sm text-ink">
          If this item is already fully funded, use my donation for the General Fund (daily needs).
        </span>
      </label>

      <p className="mt-4 text-sm text-muted">
        We only use your details to confirm your pledge.
      </p>

      {pageError && (
        <p role="alert" data-cy="pledge-taken-error" className="mt-4 rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text">
          {pageError}
        </p>
      )}

      <button data-cy="pledge-submit" onClick={handlePledge} className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white">
        Pledge
      </button>

      {showCheckout && (
        <BottomSheet title="Confirm your pledge" onClose={() => !submitting && setShowCheckout(false)}>
          <div className="space-y-1 text-ink">
            <p>
              <span className="font-semibold">{qty} × {item.name}</span>
            </p>
            {amount !== null && <p className="text-2xl font-bold text-brand">RM {amount.toFixed(2)}</p>}
            <p className="text-sm text-muted">
              {form.name.trim()} · {form.email.trim()}
            </p>
          </div>

          <div className="mt-4">
            <PaymentDetails />
          </div>

          <p className="mt-4 text-sm text-muted">
            Please transfer by bank or DuitNow QR. Your pledge stays pending until we confirm the payment.
          </p>

          <div className="mt-5">
            <ReceiptUpload file={receipt} onChange={chooseReceipt} error={receiptError} disabled={submitting} required />
          </div>

          {submitError && (
            <p data-cy="pledge-error" className="mt-4 text-sm text-urgent-text">{submitError}</p>
          )}

          <button
            data-cy="pledge-confirm"
            onClick={confirmPledge}
            disabled={submitting || !!receiptError}
            className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Uploading…' : 'Confirm pledge'}
          </button>
        </BottomSheet>
      )}
    </div>
  )
}