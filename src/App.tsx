import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import LandingPage from '@/features/public/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import CartPage from '@/features/cart/CartPage';
import ProfilePage from '@/features/profile/ProfilePage';
import AdminDashboard from '@/features/admin/AdminDashboard';
import AdminOrders from '@/features/admin/AdminOrders';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireRole }: { children: JSX.Element, requireRole?: 'USER' | 'ADMIN' }) => {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/'} />;
  }
  return children;
};

export default function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public & User Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={
                <ProtectedRoute><CartPage /></ProtectedRoute>
              } />
              <Route path="/profile/*" element={
                <ProtectedRoute requireRole="USER"><ProfilePage /></ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="ADMIN"><AdminLayout /></ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              {/* Add Users and Payments routes here */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
  );
}