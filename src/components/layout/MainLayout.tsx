import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

export const MainLayout = () => {
    const { isAuthenticated, logout } = useAuthStore();
    const totalItems = useCartStore((state) => state.getTotalItems());
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface-50/50 font-sans text-surface-900 selection:bg-primary-100">

            <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-surface-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight">
                                Market<span className="text-primary-600">.local</span>
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-1 sm:gap-3">
                            <Link
                                to="/cart"
                                className={`relative p-2.5 rounded-xl transition-all ${
                                    location.pathname === '/cart'
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-surface-500 hover:bg-surface-100'
                                }`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white animate-fade-in">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            <div className="h-6 w-px bg-surface-200 mx-1 hidden sm:block" />

                            {isAuthenticated() ? (
                                <div className="flex items-center gap-1">
                                    <Link
                                        to="/profile"
                                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-surface-600 hover:text-primary-600 rounded-xl transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95"
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
                <Outlet />
            </main>

            <footer className="border-t border-surface-200 bg-white py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-surface-500 text-sm font-medium">
                        © 2026 Market Local. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};