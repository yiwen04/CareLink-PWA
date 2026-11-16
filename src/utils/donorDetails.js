// Checks for the donor's name, email and phone on the Kids Heroes checkout.
// Limits match the subscriptions table: name 1–100, email ≤ 200, phone ≤ 30.
// Messages and patterns are the same as the pledge form, so both feel alike.

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9+\-\s]{8,15}$/

// details: { name, email, phone } as typed. Returns { field: message }; {} = all good.
export function validateDonor(details) {
  const errors = {}
  const name = details.name.trim()
  const email = details.email.trim()
  const phone = details.phone.trim()

  if (!name) errors.name = 'Please enter your name.'
  else if ([...name].length > 100) errors.name = 'Please keep your name under 100 characters.'

  if (!emailPattern.test(email) || email.length > 200) {
    errors.email = 'Please enter a valid email, e.g. name@example.com.'
  }

  if (phone && !phonePattern.test(phone)) errors.phone = 'Please enter a valid phone number.'

  return errors
}

// Cleaned-up values for the database (empty phone → null)
export function cleanDonor(details) {
  return {
    donor_name: details.name.trim(),
    donor_email: details.email.trim(),
    donor_phone: details.phone.trim() || null,
  }
}
