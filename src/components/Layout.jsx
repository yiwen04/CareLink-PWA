import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Wish list' },
  { to: '/kids-heroes', label: 'Kids Heroes' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)

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
        <img src="/logo.png" alt="" className="h-7 w-7" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <span className="text-lg font-semibold text-brand">CareLink</span>
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
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-1 block rounded-xl px-3 py-2 ${isActive ? 'bg-accent font-semibold text-primary' : 'text-muted'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
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