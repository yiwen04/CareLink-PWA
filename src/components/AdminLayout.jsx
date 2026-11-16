import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const tabs = [
  { to: '/admin/wishlist', label: 'Wishlist', icon: '🎁', cy: 'admin-tab-wishlist' },
  { to: '/admin/donations', label: 'Donations waiting', icon: '🧾', cy: 'admin-tab-donations' },
]

// Frame around every admin page: top bar, page content, bottom tab bar.
export default function AdminLayout() {
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

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
        <img
          src="/logo.png"
          alt=""
          className="h-7 w-7"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <span className="text-lg font-semibold text-white">
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
              <span aria-hidden="true" className="text-xl">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
