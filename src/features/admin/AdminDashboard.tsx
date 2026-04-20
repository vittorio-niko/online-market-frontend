import dashboardImage from '@/assets/dashboard.png';

export default function AdminDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-[2.5rem] border border-surface-200 shadow-sm p-12 text-center animate-fade-in">
            <div className="hidden lg:block w-80 h-56 bg-white/10 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl rotate-3">
                <img src={dashboardImage} alt="Dashboard" className="w-full h-full object-cover opacity-90" />
            </div>

            <h1 className="text-4xl font-black text-surface-900 mb-4 tracking-tight">
                Welcome to the Admin Portal
            </h1>
            <p className="text-surface-500 text-lg max-w-xl mx-auto font-medium">
                Select a module from the sidebar to manage products, view orders, handle user accounts, or analyze payments.
            </p>
        </div>
    );
}