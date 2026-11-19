import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { usePendingCount } from '../hooks/usePendingCount'

// showCount: this tab gets the "how many are waiting" badge
const tabs = [
  { to: '/admin/wishlist', label: 'Wishlist', icon: '🎁', cy: 'admin-tab-wishlist' },
  { to: '/admin/donations', label: 'Donations waiting', icon: '🧾', cy: 'admin-tab-donations', showCount: true },
]

// Frame around every admin page: top bar, page content, bottom tab bar.
export default function AdminLayout() {
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  // Count pending pledges + Kids Heroes again every time the admin changes page
  const { pathname } = useLocation()
  const pendingCount = usePendingCount(pathname).total

  async function handleLogout() {
    setLoggingOut(true)
    setLogoutError(null)
    const { error } = await supabase.auth.signOut()
    // No navigate() needed: useAuth hears the logout and
    // RequireAdmin sends the user to /admin/login by itself.
    if (error) {
      setLoggingOut(false)
      setLogoutError('Could not log out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-page font-sans text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-brand px-4 py-3">
        {/* White tile keeps the colourful logo readable on the dark bar */}
        <img
          src="/logo-mark.png"
          alt=""
          width="44"
          height="44"
          className="h-11 w-11 rounded-xl bg-white object-contain p-0.5"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <span className="text-xl font-bold tracking-tight text-white">
          CareLink <span className="font-normal text-accent">Admin</span>
        </span>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="ml-auto rounded-xl border border-accent px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          data-cy="admin-logout"
        >
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </header>

      {logoutError && (
        <p role="alert" className="bg-urgent-bg px-4 py-2 text-center text-sm text-urgent-text">
          {logoutError}
        </p>
      )}

      {/* Page content. pb-28 leaves room so the bottom nav never covers it. */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-6">
        <Outlet />
      </main>

      {/* Bottom tab bar, fixed to the bottom of the screen */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              data-cy={tab.cy}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 border-t-4 text-xs ${
                  isActive
                    ? 'border-highlight font-semibold text-brand'
                    : 'border-transparent text-muted'
                }`
              }
            >
              <span className="flex items-center gap-1">
                <span aria-hidden="true" className="text-xl">{tab.icon}</span>
                {/* Count badge (Figma: amber pill next to the icon). Hidden when 0. */}
                {tab.showCount && pendingCount > 0 && (
                  <span
                    className="min-w-5 rounded-full bg-needed-bg px-1.5 text-center text-xs font-semibold text-needed-text"
                    data-cy="admin-pending-count"
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </span>
              {tab.label}
              {/* Screen readers hear "Donations waiting, 3 waiting" */}
              {tab.showCount && pendingCount > 0 && <span className="sr-only">, {pendingCount} waiting</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
