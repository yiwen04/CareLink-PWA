import { useState } from 'react'
import BottomSheet from './BottomSheet'
import FormField from './FormField'
import { HERO_MIN, validateCustomAmount } from '../utils/heroAmount'

// "Choose your amount" (Figma "4b Custom amount sheet").
// initial: what was typed before (so reopening keeps it).
// onContinue(amount) is called with a whole number once it's valid.
export default function CustomAmountSheet({ initial = '', onClose, onContinue }) {
  const [text, setText] = useState(initial)
  const [error, setError] = useState(null)

  // Live summary only when the amount is valid
  const isValid = validateCustomAmount(text) === null

  function handleSubmit(e) {
    e.preventDefault() // stop the browser reloading the page
    const message = validateCustomAmount(text)
    setError(message)
    if (!message) onContinue(Number(text.trim()), text)
  }

  return (
    <BottomSheet title="Choose your amount" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <p className="text-muted">Choose how much you would like to give each month.</p>

        <div className="mt-4">
          <FormField id="custom_amount" label="Monthly amount (RM)" hint={`Minimum RM${HERO_MIN} a month.`} error={error}>
            <input
              id="custom_amount"
              inputMode="numeric"
              autoFocus
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError(null)
              }}
              placeholder="e.g. 75"
              aria-invalid={!!error}
              aria-describedby="custom_amount-msg"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-primary ${
                error ? 'border-urgent-text' : 'border-line'
              }`}
              data-cy="hero-custom-input"
            />
          </FormField>
        </div>

        {isValid && (
          <p className="mt-4 rounded-xl bg-accent px-4 py-3 font-semibold text-brand" data-cy="hero-custom-summary">
            You will donate RM{Number(text.trim())} every month.
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white"
          data-cy="hero-custom-continue"
        >
          Continue to transfer details
        </button>
      </form>
    </BottomSheet>
  )
}
