import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';

import LandingPage from './pages/customer/LandingPage';
import CustomerHome from './pages/customer/CustomerHome';
import ProductList from './pages/customer/ProductList';
import CartPage from './pages/customer/CartPage';
import OrderTracking from './pages/customer/OrderTracking';
import OrderHistory from './pages/customer/OrderHistory';
import BulkOrderPage from './pages/customer/BulkOrderPage';
import DigitalBillPage from './pages/customer/DigitalBillPage';
import CustomerChat from './pages/customer/CustomerChat';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import AdminOrders from './pages/admin/AdminOrders';
import AdminBulkOrders from './pages/admin/AdminBulkOrders';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminChat from './pages/admin/AdminChat';
import AdminReports from './pages/admin/AdminReports';
import AdminTeam from './pages/admin/AdminTeam';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Protected Route Helpers
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-500">
        Verifying permissions...
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }
  return children;
};

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-500">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout Shell
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#fffbf5] flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        {/* Admin Sidebar */}
        {isAdminRoute && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<CustomerHome />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<CustomerRoute><OrderHistory /></CustomerRoute>} />
            <Route path="/orders/:id" element={<CustomerRoute><OrderTracking /></CustomerRoute>} />
            <Route path="/bulk-orders" element={<BulkOrderPage />} />
            <Route path="/bills" element={<CustomerRoute><DigitalBillPage /></CustomerRoute>} />
            <Route path="/bills/:orderId" element={<CustomerRoute><DigitalBillPage /></CustomerRoute>} />
            <Route path="/chat" element={<CustomerRoute><CustomerChat /></CustomerRoute>} />
            <Route path="/profile" element={<CustomerRoute><ProfilePage /></CustomerRoute>} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/bulk-orders" element={<AdminRoute><AdminBulkOrders /></AdminRoute>} />
            <Route path="/admin/calendar" element={<AdminRoute><AdminCalendar /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
            <Route path="/admin/chat" element={<AdminRoute><AdminChat /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/team" element={<AdminRoute><AdminTeam /></AdminRoute>} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Customer Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
