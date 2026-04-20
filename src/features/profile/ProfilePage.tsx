import { useState } from 'react';
import ProfileInfoTab from './ProfileInfoTab';
import MyCardsTab from './MyCardsTab';
import MyOrdersTab from './MyOrdersTab';
import { Helmet } from 'react-helmet-async';
import { User, CreditCard, Package } from 'lucide-react'; // Using icons for extra polish

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'CARDS' | 'ORDERS'>('PROFILE');

    return (
        <>
            <Helmet>
                <title>My profile | Market Local</title>
            </Helmet>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
                {/* Sidebar */}
                <aside className="w-full md:w-72 flex-shrink-0">
                    <div className="bg-white border border-surface-200 rounded-[2rem] p-5 sticky top-24 shadow-sm">
                        <h2 className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] mb-6 px-4">
                            Account Settings
                        </h2>
                        <nav className="flex flex-col space-y-2">
                            <button
                                onClick={() => setActiveTab('PROFILE')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
                                    activeTab === 'PROFILE'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                                        : 'text-surface-500 hover:bg-surface-50'
                                }`}
                            >
                                <User size={18} />
                                Profile Info
                            </button>
                            <button
                                onClick={() => setActiveTab('CARDS')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
                                    activeTab === 'CARDS'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                                        : 'text-surface-500 hover:bg-surface-50'
                                }`}
                            >
                                <CreditCard size={18} />
                                My Cards
                            </button>
                            <button
                                onClick={() => setActiveTab('ORDERS')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
                                    activeTab === 'ORDERS'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-100'
                                        : 'text-surface-500 hover:bg-surface-50'
                                }`}
                            >
                                <Package size={18} />
                                My Orders
                            </button>
                        </nav>
                    </div>
                </aside>


                <div className="flex-1 flex flex-col items-center">
                    {/* Inner wrapper to control form width */}
                    <div className="w-full max-w-2xl animate-fade-in">
                        {activeTab === 'PROFILE' && <ProfileInfoTab />}
                        {activeTab === 'CARDS' && <MyCardsTab />}
                        {activeTab === 'ORDERS' && <MyOrdersTab />}
                    </div>
                </div>
            </div>
        </>
    );
}