"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

export default function AlatPage() {
    const [alat, setAlat] = useState<any[]>([]);
    const [kategori, setKategori] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filterKategori, setFilterKategori] = useState("all");

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resAlat, resKat] = await Promise.all([
                    fetch("/api/alat"),
                    fetch("/api/kategori")
                ]);
                setAlat(await resAlat.json());
                const katJson = await resKat.json();
                setKategori(katJson.data || katJson);
            } catch (error) {
                console.error("Gagal mengambil data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filteredAlat = alat.filter((a) => {
        const matchName = a.nama.toLowerCase().includes(search.toLowerCase());
        const matchKategori = filterKategori === "all" || a.kategoriId.toString() === filterKategori;
        return matchName && matchKategori;
    });

    return (
        <AppLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Katalog Alat</h1>
                        <p className="text-gray-500 text-sm">Kelola seluruh inventaris alat dan perlengkapan</p>
                    </div>

                    <Link
                        href="/admin/alat/form"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 font-medium w-full md:w-auto"
                    >
                        <Plus size={18} />
                        Tambah Alat
                    </Link>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama alat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                        />
                    </div>

                    <div className="relative min-w-[200px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium appearance-none"
                        >
                            <option value="all">Semua Kategori</option>
                            {kategori.map((k) => (
                                <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredAlat.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Alat tidak ditemukan</h3>
                        <p className="text-gray-500 text-sm">Coba sesuaikan kata kunci atau filter pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAlat.map((a) => (
                            <Link
                                href={`/admin/alat/${a.id}`}
                                key={a.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                                    <img
                                        src={a.image || "/noalat.jpg"}
                                        alt={a.nama}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/noalat.jpg' }}
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
                                            {a.kategori?.nama || "Umum"}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-sm ${a.stok > 0 ? "bg-blue-600/90 text-white" : "bg-red-500/90 text-white"
                                            }`}>
                                            Stok: {a.stok}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h4 className="text-gray-600 text-sm font-bold line-clamp-2 mt-auto">
                                        {a.merk}
                                    </h4>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {a.nama}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mt-auto">
                                        {a.deskripsi || "Tidak ada deskripsi tersedia."}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}