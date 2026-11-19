import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page on submit
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    // 1. Ask Supabase Auth to check the email + password.
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (loginError) {
      setLoading(false)
      // One message for both "wrong email" and "wrong password", so the form
      // does not reveal which emails have accounts.
      setError('Email or password is incorrect.')
      return
    }

    // 2. Logged in. Now ask the database whether this user is an admin.
    //    is_admin() runs on the server, so the answer cannot be faked.
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin')
    if (rpcError || !isAdmin) {
      await supabase.auth.signOut() // throw away the session
      setLoading(false)
      setError(
        rpcError
          ? 'We could not check your access. Please try again.'
          : "This account doesn't have admin access."
      )
      return
    }

    // 3. Admin confirmed. "replace" so Back doesn't return to the login form.
    navigate('/admin/wishlist', { replace: true })
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink outline-none focus:border-primary'

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-ink">
      {/* Navy header band */}
      <header className="bg-brand px-4 pb-10 pt-8 text-center">
        {/* White tile keeps the colourful logo readable on the navy band */}
        <img
          src="/logo-mark.png"
          alt=""
          width="112"
          height="112"
          className="mx-auto h-28 w-28 rounded-3xl bg-white object-contain p-2 shadow-md"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <p className="mt-3 text-3xl font-bold tracking-tight text-white">CareLink</p>
        <p className="text-sm text-accent">Admin portal</p>
      </header>

      <main className="mx-auto -mt-6 w-full max-w-md flex-1 px-4">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
          data-cy="admin-login-form"
        >
          <h1 className="text-2xl font-bold text-ink">Admin log in</h1>

          <label className="block">
            <span className="mb-2 block font-semibold text-ink">Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              data-cy="admin-email"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-semibold text-ink">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              data-cy="admin-password"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-urgent-bg px-4 py-3 text-sm text-urgent-text"
              data-cy="admin-login-error"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
            data-cy="admin-login-submit"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-sm font-semibold text-primary">
          ← Back to wishlist
        </Link>
      </main>
    </div>
  )
}
