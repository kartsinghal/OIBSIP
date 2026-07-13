import { Routes, Route } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import HomePage from '../pages/HomePage';
import MenuPage from '../pages/MenuPage';
import AboutPage from '../pages/AboutPage';
import TrackOrderPage from '../pages/TrackOrderPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminPortal from '../pages/AdminPortal';
import AdminDashboard from '../pages/AdminDashboard';
import AdminInventory from '../pages/AdminInventory';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import ContactPage from '../pages/ContactPage';

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Public routes (with Navbar + Footer) ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ── Admin routes (with AdminLayout sidebar, no public Footer) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPortal />} />
          <Route path="orders" element={<AdminDashboard />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>

      </Routes>
    </>
  );
}

export default AppRouter;
