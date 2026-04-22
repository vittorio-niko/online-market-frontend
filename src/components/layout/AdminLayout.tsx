import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Package, Users, CreditCard, Settings, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();

    let adminEmail = 'admin@market.local';
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            adminEmail = decoded.email || decoded.preferred_username || decoded.sub || adminEmail;
        } catch (e) {
            console.error("Failed to decode admin token");
        }
    }

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    const menuItems = [
        { name: 'Products', path: '/admin/products', icon: ShoppingBag },
        { name: 'Orders', path: '/admin/orders', icon: Package },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    ];

    const pageTitle = location.pathname.includes('/admin/dashboard')
        ? 'Dashboard Overview'
        : menuItems.find(i => location.pathname.includes(i.path))?.name || 'Dashboard Overview';

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-surface-200">
            {/* Sidebar - Nudged to w-60 (240px) */}
            <aside className="w-60 bg-white border-r border-surface-200 flex flex-col fixed h-full z-20 shadow-sm">
                <div className="p-6">
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 mb-10 px-1 group cursor-pointer"
                    >
                        <div className="bg-surface-900 text-white p-2 rounded-2xl shadow-xl shadow-surface-200 transition-transform group-hover:scale-105">
                            <Settings className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-surface-900 group-hover:text-primary-600 transition-colors">
                            Admin Central
                        </span>
                    </Link>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.includes(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                        isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-100 translate-x-1'
                                            : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-surface-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="flex-1 ml-60 flex flex-col min-h-screen min-w-0">

                {/* Header - px-3 (Gains 20px of width over the px-8 version) */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-surface-200/50 sticky top-0 z-10 px-3 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-surface-800 ml-2">
                        {pageTitle}
                    </h2>

                    <div className="flex items-center gap-6">
                        <div className="relative group flex items-center cursor-help">
                            <div className="w-10 h-10 rounded-full bg-surface-900 border-2 border-surface-200 overflow-hidden flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                                <ShieldCheck className="w-5 h-5" />
                            </div>

                            <div className="absolute top-12 right-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-surface-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl whitespace-nowrap pointer-events-none shadow-xl">
                                {adminEmail}
                                <div className="absolute -top-1 right-4 w-2 h-2 bg-surface-900 rotate-45"></div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl text-sm font-bold transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="px-3 py-8 w-full animate-fade-in flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};