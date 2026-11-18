// Remember this donor's latest pledge id on THIS device, so they can find
// its status page again without an account. (Stopgap until donor accounts.)
// localStorage can be blocked, so every call is wrapped in try/catch.

const KEY = 'carelinkPledgeId'

export function getPledgeId() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function savePledgeId(id) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // Not saved: the donor can still use the link on the thank-you page
  }
}

export function forgetPledgeId() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to do
  }
}
