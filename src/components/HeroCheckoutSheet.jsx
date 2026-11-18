import { useState } from 'react'
import BottomSheet from './BottomSheet'
import FormField from './FormField'
import TransferDetails from './TransferDetails'
import ReceiptUpload from './ReceiptUpload'
import { useSubscribe } from '../hooks/useSubscribe'
import { cleanDonor, validateDonor } from '../utils/donorDetails'
import { formatHeroAmount } from '../utils/heroAmount'
import { validateReceipt, validateRequiredReceipt } from '../utils/receipt'

// Kids Hero checkout (Figma "5 Checkout sheet" and "5b Checkout error and retry").
// Donor details + transfer details + receipt (required) + Submit.
// tier: the chosen tier row. amount: the monthly amount (tier amount or custom).
// onSuccess(id) is called with the new subscription id.
export default function HeroCheckoutSheet({ tier, amount, onClose, onSuccess }) {
  const { submit, submitting, submitError } = useSubscribe()
  const [details, setDetails] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [receipt, setReceipt] = useState(null)
  const [receiptError, setReceiptError] = useState(null)

  const monthly = formatHeroAmount(amount)

  // Update one field and clear its error while the donor types
  function update(e) {
    const { name, value } = e.target
    setDetails((d) => ({ ...d, [name]: value }))
    setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  function chooseReceipt(file) {
    setReceipt(file)
    setReceiptError(validateReceipt(file))
  }

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser reloading the page

    const newErrors = validateDonor(details)
    setErrors(newErrors)
    const receiptProblem = validateRequiredReceipt(receipt)
    setReceiptError(receiptProblem)
    if (Object.keys(newErrors).length > 0 || receiptProblem) return

    // Everything the donor typed stays in this sheet's state,
    // so after a failure "Try again" sends exactly the same details.
    const id = await submit({ tier_id: tier.id, amount, ...cleanDonor(details) }, receipt)
    if (id) onSuccess(id)
  }

  // Same box style as the other forms; red border when the field has an error
  function inputClass(field) {
    return `w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-primary ${
      errors[field] ? 'border-urgent-text' : 'border-line'
    }`
  }
  function a11y(field) {
    return { 'aria-invalid': !!errors[field], 'aria-describedby': `${field}-msg` }
  }

  const hasFieldErrors = Object.values(errors).some(Boolean)

  return (
    // While sending, ignore taps on the dark background / Close
    <BottomSheet title={`Kids Hero: ${monthly} / month`} onClose={() => !submitting && onClose()}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5" data-cy="hero-checkout">
        {/* Failure banner at the top, as in Figma 5b */}
        {submitError && (
          <p role="alert" className="rounded-xl border border-urgent-text bg-urgent-bg px-4 py-3 font-semibold text-urgent-text" data-cy="hero-submit-error">
            {submitError}
          </p>
        )}

        <FormField id="name" label="Your name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" value={details.name} onChange={update}
            placeholder="Full name" className={inputClass('name')} data-cy="hero-name" {...a11y('name')} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" value={details.email} onChange={update}
            placeholder="name@example.com" className={inputClass('email')} data-cy="hero-email" {...a11y('email')} />
        </FormField>

        <FormField id="phone" label="Phone (optional)" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={details.phone} onChange={update}
            placeholder="012-345 6789" className={inputClass('phone')} data-cy="hero-phone" {...a11y('phone')} />
        </FormField>

        <TransferDetails title={`Transfer ${monthly} every month to:`} />

        <ReceiptUpload file={receipt} onChange={chooseReceipt} error={receiptError} disabled={submitting} required />

        {/* Second copy of the problem next to the button, so it's seen
            even when the donor has scrolled down to here */}
        {(submitError || hasFieldErrors) && (
          <p className="text-sm text-urgent-text" data-cy="hero-submit-hint">
            {submitError ?? 'Please fix the highlighted fields above.'}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          data-cy="hero-submit"
        >
          {submitting ? 'Sending…' : submitError ? 'Try again' : `Become a Kids Hero (${monthly} / month)`}
        </button>

        <p className="text-center text-xs text-muted">
          The home confirms your transfer, then your Kids Hero badge appears.
        </p>
      </form>
    </BottomSheet>
  )
}
