"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Folder, ChevronRight, ChevronLeft } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KategoriPage() {
    const router = useRouter();
    const [kategori, setKategori] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const fetchKategori = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/kategori?page=${page}&limit=10&search=${search}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const resData = await res.json();
            setKategori(resData.data);
            setTotalPages(resData.meta.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounceInterval = setTimeout(() => {
            fetchKategori();
        }, 500);
        return () => clearTimeout(debounceInterval);
    }, [page, search]);

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Kategori Alat</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola daftar kategori dan detail alat di dalamnya.</p>
                    </div>

                    <div className="flex w-full md:w-auto items-center gap-3">
                        <div className="relative flex-1 md:min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari ketegori..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1); // reset page on search
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm h-10"
                            />
                        </div>
                        <Link
                            href="/admin/kategori/form"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md h-10 shrink-0 font-medium text-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Tambah Kategori</span>
                        </Link>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6 whitespace-nowrap">Kode</th>
                                    <th className="p-4 pl-6 whitespace-nowrap">Nama Kategori</th>
                                    <th className="p-4">Deskripsi</th>
                                    <th className="p-4 text-center">Jumlah Alat</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

                                            </div>
                                        </td>
                                    </tr>
                                ) : kategori.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Folder size={48} className="mb-3 text-gray-300" />
                                                <p className="font-medium text-gray-500">Tidak ada kategori ditemukan</p>
                                                <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    kategori.map((k, i) => (
                                        <tr
                                            key={k.id}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="p-4 text-gray-500 ml-4 max-w-xs truncate">
                                                <span className="inline-flex items-center justify-center bg-gray-100 text-blue-600 px-2.5 py-1 rounded-full text-xs font-medium min-w-[2rem]">
                                                    {k.kode}
                                                </span>
                                            </td>

                                            <td className="p-4 pl-6 font-medium text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <Folder size={16} />
                                                    </div>
                                                    {k.nama}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 max-w-xs truncate">
                                                {k.deskripsi || <span className="italic text-gray-400">Tidak ada deskripsi</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium min-w-[2rem]">
                                                    {k.alat?.length || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link
                                                    href={`/admin/kategori/${k.id}`}
                                                    className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all gap-1.5 shadow-sm"
                                                >
                                                    Detail
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                        <span className="text-sm text-gray-500">
                            Halaman <span className="font-medium text-gray-800">{page}</span> dari <span className="font-medium text-gray-800">{totalPages}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}