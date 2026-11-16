import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tells a component who is logged in and whether they are an admin.
// Returns { session, isAdmin, loading, error }.
export function useAuth() {
  // undefined = "not known yet", null = "nobody logged in", object = logged in
  const [session, setSession] = useState(undefined)
  // Remember WHICH user the admin check was for, so a stale answer is never used.
  const [adminCheck, setAdminCheck] = useState({ userId: null, isAdmin: false, error: null })

  // 1. Listen for login / logout / token refresh.
  //    Supabase fires INITIAL_SESSION right away with the saved session (or null),
  //    so this also covers "already logged in when the app opens".
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Only save the session here. Supabase advises not to await other
      // Supabase calls inside this callback, so the admin check is in step 2.
      setSession(newSession)
    })
    // Cleanup: stop listening when the component goes away.
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  // 2. Whenever the logged-in USER changes (not on every token refresh),
  //    ask the database if they are an admin.
  useEffect(() => {
    if (!userId) return
    let cancelled = false // ignore the answer if the user changed meanwhile
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (cancelled) return
      setAdminCheck({
        userId,
        isAdmin: !error && data === true,
        error: error ? 'We could not check your access. Please try again.' : null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const checkedThisUser = userId !== null && adminCheck.userId === userId
  const loading = session === undefined || (userId !== null && !checkedThisUser)

  return {
    session,
    isAdmin: checkedThisUser && adminCheck.isAdmin,
    loading,
    error: checkedThisUser ? adminCheck.error : null,
  }
}
