// Label + input + hint/error, laid out the same way for every form field.
// Put the actual <input> or <textarea> inside as children.
// id must match the input's id so tapping the label focuses the input.
export default function FormField({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-ink">
        {label}
      </label>
      {children}
      {/* Show the error if there is one, otherwise the hint */}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="mt-1 text-sm text-urgent-text" data-cy={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="mt-1 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
