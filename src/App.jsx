import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Wishlist from './pages/Wishlist'
import KidsHeroes from './pages/KidsHeroes'
import PledgeForm from './pages/PledgeForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Wishlist />} />
          <Route path="/kids-heroes" element={<KidsHeroes />} />
          <Route path="/pledge/:id" element={<PledgeForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}