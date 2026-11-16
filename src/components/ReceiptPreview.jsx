import { useState } from 'react'
import { isPdfReceipt } from '../utils/receipt'

// Shows the donor's transfer receipt.
// Photo → shown on the page (tap to open full size).
// PDF → an "Open receipt" button (opens in a new tab).
// url is a short-lived signed link from usePledge.
export default function ReceiptPreview({ path, url, error }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (!path) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted" data-cy="receipt-none">
        No receipt uploaded. Check your bank statement for a matching transfer.
      </p>
    )
  }

  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-urgent-bg p-4 text-sm text-urgent-text" data-cy="receipt-error">
        {error}
      </p>
    )
  }

  // rel="noopener noreferrer": the new tab can't reach back into this page
  const openLink = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-3 font-semibold text-primary"
      data-cy="receipt-open"
    >
      <span aria-hidden="true">📄</span> Open receipt
    </a>
  )

  // PDFs, or a picture that couldn't be shown: give a link instead
  if (isPdfReceipt(path) || imageFailed) return openLink

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block" data-cy="receipt-image">
      <img
        src={url}
        alt="Donor's transfer receipt"
        onError={() => setImageFailed(true)}
        className="max-h-96 w-full rounded-2xl border border-line bg-white object-contain"
      />
      <span className="mt-1 block text-center text-xs text-muted">Tap to open full size</span>
    </a>
  )
}
