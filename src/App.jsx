import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Wishlist from './pages/Wishlist'
import KidsHeroes from './pages/KidsHeroes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Wishlist />} />
          <Route path="/kids-heroes" element={<KidsHeroes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}