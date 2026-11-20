import { useEffect, useRef, useState } from 'react'
import { paymentDetails } from '../config/payment'
import { accountNumberForCopy } from '../utils/copyText'

// title: heading of the box (Kids Heroes passes e.g. "Transfer RM50 every month to:")
// reference: optional pledge/subscription reference. Only shown where one already exists.
export default function PaymentDetails({ title = 'Transfer to:', reference }) {
  const { bankName, accountName, accountNumber, duitNowQr, duitNowQrFileName, qrShortName } = paymentDetails
  const [enlarged, setEnlarged] = useState(false)
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const showToast = (message) => {
    setToast(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2000)
  }

  // Clipboard can be blocked (e.g. non-secure page), so tell the donor instead of failing silently
  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(accountNumberForCopy(accountNumber))
      showToast('Copied')
    } catch {
      showToast('Could not copy. Please copy it manually.')
    }
  }

  return (
    <div className="rounded-2xl bg-accent p-4 text-brand" data-cy="payment-details">
      <p className="font-semibold">{title}</p>

      <button
        type="button"
        onClick={() => setEnlarged(true)}
        className="mx-auto mt-3 block rounded-xl bg-white p-2"
        aria-label="Enlarge DuitNow QR code"
        data-cy="payment-qr"
      >
        <img src={duitNowQr} alt={`DuitNow QR code for ${qrShortName}`} className="h-48 w-48 object-contain" />
      </button>
      <p className="mt-1 text-center text-xs text-muted">Tap the QR to enlarge</p>

      <a
        href={duitNowQr}
        download={duitNowQrFileName}
        className="mx-auto mt-2 block w-fit rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
        data-cy="payment-save-qr"
      >
        Save QR
      </a>

      <dl className="mt-4 space-y-2">
        <div>
          <dt className="text-xs text-muted">Bank</dt>
          <dd className="font-semibold">{bankName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Account name</dt>
          <dd className="font-semibold">{accountName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Account number</dt>
          <dd className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold tracking-wide" data-cy="payment-account-number">{accountNumber}</span>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              data-cy="payment-copy"
            >
              Copy
            </button>
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-sm text-muted">
        The QR shows {qrShortName}, which is the registered short name of the same account.
      </p>

      {reference && (
        <p className="mt-3 text-sm text-muted" data-cy="payment-reference-note">
          Please put the reference <span className="font-semibold text-ink">{reference}</span> in the
          recipient reference field of your transfer.
        </p>
      )}

      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
          data-cy="payment-toast"
        >
          <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg">{toast}</span>
        </div>
      )}

      {enlarged && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="DuitNow QR code, enlarged"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-4"
          onClick={() => setEnlarged(false)}
          data-cy="payment-qr-enlarged"
        >
          <img
            src={duitNowQr}
            alt={`DuitNow QR code for ${qrShortName}`}
            className="max-h-[75vh] w-full max-w-sm rounded-xl bg-white object-contain p-3"
          />
          <button type="button" className="rounded-xl bg-white px-5 py-2 font-semibold text-primary">
            Close
          </button>
        </div>
      )}
    </div>
  )
}
