// Remember this donor's Kids Hero subscription id on THIS device,
// so they can find their badge again without an account.
// localStorage can be blocked (private browsing, strict settings),
// so every call is wrapped in try/catch and simply does nothing then.

const KEY = 'carelinkHeroId'

export function getHeroId() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function saveHeroId(id) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // Not saved: the donor can still use the /hero/<id> link they're on
  }
}

export function forgetHeroId() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to do
  }
}
