import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Wishlist from './pages/Wishlist'
import KidsHeroes from './pages/KidsHeroes'
import PledgeForm from './pages/PledgeForm'
import PledgeThankYou from './pages/PledgeThankYou'
import AdminLogin from './pages/AdminLogin'
import AdminWishlist from './pages/AdminWishlist'
import AdminItemForm from './pages/AdminItemForm'
import AdminDonations from './pages/AdminDonations'
import RequireAdmin from './components/RequireAdmin'
import AdminLayout from './components/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Wishlist />} />
          <Route path="/kids-heroes" element={<KidsHeroes />} />
          <Route path="/pledge/:id" element={<PledgeForm />} />
          <Route path="/thank-you" element={<PledgeThankYou />} />
        </Route>

        {/* Admin pages: outside <Layout /> so the donor menu doesn't show */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Everything inside RequireAdmin needs a logged-in admin */}
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/wishlist" replace />} />
            <Route path="/admin/wishlist" element={<AdminWishlist />} />
            {/* Same page for add and edit. React Router picks the exact
                "new" match over ":id", so "new" is never treated as an id. */}
            <Route path="/admin/wishlist/new" element={<AdminItemForm />} />
            <Route path="/admin/wishlist/:id" element={<AdminItemForm />} />
            <Route path="/admin/donations" element={<AdminDonations />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
