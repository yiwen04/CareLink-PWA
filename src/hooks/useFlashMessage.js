import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// A one-time success message passed from another page, e.g.
//   navigate('/admin/donations', { state: { message: 'Confirmed …' } })
// Returns [message, setMessage] like useState.
export function useFlashMessage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Copy the message into this page's own state when the page opens...
  const [message, setMessage] = useState(() => location.state?.message ?? null)

  // ...then remove it from browser history, so a refresh doesn't show it again
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  return [message, setMessage]
}
