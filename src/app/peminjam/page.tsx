"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import {
    ShoppingCart,
    Search,
    Filter,
    Box,
    Plus,
    Check,
    ArrowRight,
    Loader,
    Info,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function PeminjamPage() {
    const [alat, setAlat] = useState<any[]>([]);
    const [kategori, setKategori] = useState<any[]>([]);
    const [cart, setCart] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedKategori, setSelectedKategori] = useState("all");

    // 🔥 FETCH DATA
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resAlat, resKategori] = await Promise.all([
                fetch("/api/alat"),
                fetch("/api/kategori")
            ]);
            const jsonAlat = await resAlat.json();
            const jsonKategori = await resKategori.json();

            setAlat(jsonAlat);
            setKategori(jsonKategori.data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const toggleCart = (id: number) => {
        setCart((prev) => {
            if (prev[id]) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            return { ...prev, [id]: 1 };
        });
    };

    const isSelected = (id: number) => !!cart[id];
    const totalItem = Object.keys(cart).length;

    const filteredAlat = alat.filter(a => {
        const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase());
        const matchKategori = selectedKategori === "all" || a.kategoriId === Number(selectedKategori);
        const hasStock = a.stok > 0;
        return matchSearch && matchKategori && hasStock;
    });

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-700">

                {/* 🔵 TOP SECTION: WELCOME & SEARCH */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Box className="text-blue-600" size={32} /> Pinjam Alat
                        </h1>
                        <p className="text-slate-500 font-medium h-5 tracking-tight italic">Pilih alat yang kamu butuhkan untuk kegiatan belajar.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-xl">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Cari nama alat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold focus:border-blue-500 transition-all outline-none shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                value={selectedKategori}
                                onChange={(e) => setSelectedKategori(e.target.value)}
                                className="bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-10 pr-10 text-sm font-semibold appearance-none focus:border-blue-500 outline-none cursor-pointer shadow-sm min-w-[160px]"
                            >
                                <option value="all">SEMUA</option>
                                {kategori.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 🔵 SHOPPING CART FLOATER (Only if mobile or small) */}
                {totalItem > 0 && (
                    <Link href="/peminjam/cart" className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 animate-bounce">
                        <ShoppingCart size={24} />
                        <span className="font-black text-sm">{totalItem}</span>
                    </Link>
                )}

                {/* 🔵 ALAT GRID */}
                {isLoading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-blue-500" size={40} />
                        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Sinkronisasi Data</p>
                    </div>
                ) : filteredAlat.length === 0 ? (
                    <div className="py-32 flex flex-col items-center text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                            <Box size={40} />
                        </div>
                        <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Alat Tidak Ditemukan</h2>
                        <p className="text-slate-400 max-w-xs text-sm font-medium leading-relaxed">Coba cari kata kunci lain atau pilih kategori yang berbeda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredAlat.map((a) => (
                            <div
                                key={a.id}
                                className={`
                                    group bg-gray-200 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden
                                    ${isSelected(a.id)
                                        ? 'border-blue-500 shadow-2xl shadow-blue-100 ring-4 ring-blue-50'
                                        : 'border-gray-200 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-100'
                                    }
                                `}
                            >
                                {/* CARD IMAGE */}
                                <div className="h-56 relative overflow-hidden bg-slate-100 italic font-black uppercase flex items-center justify-center tracking-widest text-[8px] text-slate-300/50">
                                    {a.image ? (
                                        <img src={a.image} alt={a.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        "IMAGE PLACEHOLDER"
                                    )}

                                    {/* BADGE CATEGORY */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                                            {a.kategori?.nama}
                                        </span>
                                    </div>

                                    {/* BADGE STOK */}
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-slate-900/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                                            Stok: {a.stok}
                                        </span>
                                    </div>
                                </div>

                                {/* CARD CONTENT */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors truncate">
                                            {a.nama}
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-2">
                                            Product by {a.merk || "No Brand"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 pt-2">
                                        <button
                                            onClick={() => toggleCart(a.id)}
                                            className={`
                                                flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                                                ${isSelected(a.id)
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100'
                                                }
                                            `}
                                        >
                                            {isSelected(a.id) ? (
                                                <>
                                                    <Check size={16} /> Ditambahkan
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={16} /> Masuk Cart
                                                </>
                                            )}
                                        </button>
                                        <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-300 rounded-2xl hover:text-blue-500 hover:bg-blue-50 transition-all">
                                            <Info size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🔵 SUMMARY BAR (DESKTOP) */}
                {totalItem > 0 && !isLoading && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-2xl border border-blue-100 px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(59,130,246,0.15)] flex items-center gap-8 animate-in slide-in-from-bottom-10">
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siap Dipinjam</p>
                            <p className="text-lg font-black text-slate-800">{totalItem} Alat Terpilih</p>
                        </div>
                        <Link
                            href="/peminjam/cart"
                            className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-200"
                        >
                            Proses Sekarang <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

            </div>
        </Layout>
    );
}