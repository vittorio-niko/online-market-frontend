import { useState } from 'react';
import { useGetItemsPublic } from '@/api/generated/user-order-service';
import { ProductModal } from './ProductModal';
import { Helmet } from 'react-helmet-async';
import {
    Search,
    ChevronDown,
    ArrowUpDown,
    X,
    ShoppingBag
} from 'lucide-react';
import marketImage from '@/assets/intro.png';
import placeholderProductImage from '@/assets/product.png';

export default function LandingPage() {
    const [page, setPage] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const [name, setName] = useState('');
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [sort, setSort] = useState<string>('id,desc');

    const { data: response, isLoading } = useGetItemsPublic({
        page,
        size: 12,
        name: name || undefined,
        minPrice,
        maxPrice,
        sort: [sort]
    });

    const pageData = response?.status === 200 ? response.data : null;
    const items = pageData?.content || [];

    const handleFilterChange = () => setPage(0);

    return (
        <>
            <Helmet>
                <title>Market Local | Assortment</title>
            </Helmet>

            <div className="space-y-10">
                {/* Hero Section */}
                <section className="bg-surface-900 rounded-[2.5rem] p-8 md:p-12 flex items-center justify-between shadow-premium text-white overflow-hidden relative">
                    <div className="max-w-lg z-10">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Welcome to Market Local</h1>
                        <p className="text-lg text-surface-400">Discover a curated collection of everything you need, delivered to your doorstep.</p>
                    </div>
                    <div className="hidden lg:block w-80 h-56 bg-white/10 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl rotate-3">
                        <img src={marketImage} alt="Market" className="w-full h-full object-cover opacity-90" />
                    </div>
                </section>

                {/* Controls Section: Search, Filter, Sort */}
                <section className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between bg-white p-6 rounded-[2rem] border border-surface-200 shadow-sm">

                        {/* Search & Price Filters */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); handleFilterChange(); }}
                                    className="w-full pl-11 pr-4 py-3 bg-surface-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2 bg-surface-50 p-1.5 rounded-2xl border border-surface-100">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Min $"
                                    value={minPrice ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                        if (val !== undefined && val < 0) return;
                                        setMinPrice(val);
                                        handleFilterChange();
                                    }}
                                    className="w-20 bg-transparent border-none text-xs font-bold focus:ring-0 placeholder:text-surface-400"
                                />
                                <div className="w-px h-4 bg-surface-200" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Max $"
                                    value={maxPrice ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                        if (val !== undefined && val < 0) return;
                                        setMaxPrice(val);
                                        handleFilterChange();
                                    }}
                                    className="w-20 bg-transparent border-none text-xs font-bold focus:ring-0 placeholder:text-surface-400"
                                />
                            </div>
                        </div>

                        {/* Sorting & Pagination */}
                        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="relative min-w-[160px]">
                                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <select
                                    value={sort}
                                    onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
                                    className="w-full pl-11 pr-10 py-3 bg-surface-50 border-none rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                                >
                                    <option value="id,desc">Newest First</option>
                                    <option value="price,asc">Price: Low to High</option>
                                    <option value="price,desc">Price: High to Low</option>
                                    <option value="name,asc">Name: A-Z</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0 || isLoading}
                                    className="p-3 bg-surface-900 text-white rounded-xl disabled:opacity-20 transition-all hover:bg-primary-600 active:scale-95 shadow-lg"
                                >
                                    <ChevronDown className="w-4 h-4 rotate-90" />
                                </button>
                                <span className="text-xs font-black uppercase tracking-widest text-surface-400 px-2">
                                    Page {page + 1}
                                </span>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={pageData?.last || isLoading}
                                    className="p-3 bg-surface-900 text-white rounded-xl disabled:opacity-20 transition-all hover:bg-primary-600 active:scale-95 shadow-lg"
                                >
                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white border border-surface-100 h-80 rounded-[2rem]"></div>
                            ))}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedProductId(item.id!)}
                                    className="group bg-white border border-surface-200 rounded-[2rem] p-5 cursor-pointer hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-square bg-surface-50 rounded-[1.5rem] mb-6 overflow-hidden relative">
                                        <img
                                            src={placeholderProductImage}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-surface-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Quick View
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-surface-900 truncate px-1">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-3 px-1">
                                        <p className="text-primary-600 font-black text-xl tracking-tighter">${item.price?.toFixed(2)}</p>
                                        <div className="p-2 bg-surface-50 text-surface-400 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-surface-50 rounded-[3rem] border border-dashed border-surface-200">
                            <X className="mx-auto mb-4 text-surface-300" size={48} />
                            <h3 className="text-xl font-bold text-surface-900">No results found</h3>
                            <p className="text-surface-500">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </section>

                {/* Product Modal */}
                {selectedProductId && (
                    <ProductModal
                        id={selectedProductId}
                        onClose={() => setSelectedProductId(null)}
                    />
                )}
            </div>
        </>
    );
}