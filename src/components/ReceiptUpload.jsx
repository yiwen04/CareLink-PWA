import { RECEIPT_TYPES } from '../utils/receipt'

// File picker for the bank transfer receipt (optional)
export default function ReceiptUpload({ file, onChange, error, disabled }) {
  return (
    <div>
      <p className="font-semibold text-ink">Transfer receipt (optional)</p>
      <p className="mt-1 text-sm text-muted">
        Already transferred? Upload a screenshot or PDF of your receipt so we can confirm faster.
      </p>

      <label
        className={`mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-4 text-center font-semibold ${
          error ? 'border-urgent-text text-urgent-text' : 'border-line text-primary'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          data-cy="receipt-input"
          type="file"
          accept={Object.keys(RECEIPT_TYPES).join(',')}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? 'Choose a different file' : 'Choose file'}
      </label>

      {file && (
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <span data-cy="receipt-name" className="truncate text-ink">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="shrink-0 font-semibold text-primary"
          >
            Remove
          </button>
        </div>
      )}
      {error && <p data-cy="receipt-error" className="mt-1 text-sm text-urgent-text">{error}</p>}
      <p className="mt-1 text-xs text-muted">JPG, PNG, WEBP or PDF, up to 5 MB.</p>
    </div>
  )
}
