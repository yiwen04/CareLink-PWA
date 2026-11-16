import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Guard for admin pages. Used as a parent route in App.jsx:
// the admin pages inside it only show if the user is a logged-in admin.
// Note: this is for user experience. The real protection is RLS in the database.
export default function RequireAdmin() {
  const { session, isAdmin, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page font-sans text-muted">
        Checking access…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-4 text-center font-sans">
        <p className="text-urgent-text">{error}</p>
        <Link to="/admin/login" className="font-semibold text-primary">Go to admin log in</Link>
      </div>
    )
  }

  // Not logged in, or logged in but not an admin: send to the login page.
  // "replace" so pressing Back doesn't bounce the user straight back here.
  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  // Admin confirmed: show the page for the current address.
  return <Outlet />
}
