import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getHeroId } from '../utils/heroStorage'
import { getPledgeId } from '../utils/pledgeStorage'

const baseLinks = [
  { to: '/', label: 'Wish list' },
  { to: '/kids-heroes', label: 'Kids Heroes' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)

  // Read on every render, so the link appears as soon as a donor subscribes
  // (opening the menu re-renders this component).
  const heroId = getHeroId()
  const pledgeId = getPledgeId()
  const links = [
    ...baseLinks,
    ...(pledgeId ? [{ to: `/pledge/status/${pledgeId}`, label: 'My latest pledge', cy: 'drawer-pledge-status' }] : []),
    ...(heroId ? [{ to: `/hero/${heroId}`, label: 'My Kids Hero badge', cy: 'drawer-hero-badge' }] : []),
  ]

  return (
    <div className="min-h-screen bg-page font-sans text-ink">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-xl text-primary"
        >
          ☰
        </button>
        {/* Logo + name link home. The mark is the cropped icon so it stays readable at this size. */}
        <Link
          to="/"
          aria-label="CareLink home"
          data-cy="header-home"
          className="flex items-center gap-2.5 rounded-xl transition-opacity active:opacity-70"
        >
          <img
            src="/logo-mark.png"
            alt=""
            width="48"
            height="48"
            className="h-12 w-12 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span className="text-xl font-bold tracking-tight text-brand">CareLink</span>
        </Link>
      </header>

      {/* Drawer menu */}
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <nav
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-lg font-semibold text-brand">Menu</p>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                data-cy={link.cy}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-1 block rounded-xl px-3 py-2 ${isActive ? 'bg-accent font-semibold text-primary' : 'text-muted'}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Staff-only entry, kept small and separate from the donor links */}
            <div className="mt-6 border-t border-line pt-4">
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-muted"
                data-cy="drawer-admin-login"
              >
                Admin login
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Page content goes here */}
      <main className="mx-auto max-w-md px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}