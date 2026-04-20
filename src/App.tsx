import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from '@/store/useAuthStore';

import { MainLayout } from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import LandingPage from '@/features/public/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import CartPage from '@/features/cart/CartPage';
import ProfilePage from '@/features/profile/ProfilePage';

import AdminLoginPage from '@/features/admin/AdminLoginPage';
import AdminDashboard from '@/features/admin/AdminDashboard';
import AdminOrders from '@/features/admin/AdminOrders';
import AdminUsers from '@/features/admin/AdminUsers';
import AdminPayments from '@/features/admin/AdminPayments';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children, requireRole }: { children: JSX.Element, requireRole?: 'USER' | 'ADMIN' }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

const RedirectAdmin = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated() && role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>

              {/* Public & User Routes */}
              <Route element={
                <RedirectAdmin>
                  <MainLayout />
                </RedirectAdmin>
              }>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/cart" element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } />

                <Route path="/profile/*" element={
                  <ProtectedRoute requireRole="USER">
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Admin Login Route */}
              <Route path="/admin" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requireRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="payments" element={<AdminPayments />} />

                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
  );
}