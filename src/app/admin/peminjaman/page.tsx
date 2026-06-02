"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { Plus, Search, ClipboardList, ChevronRight, ChevronLeft } from "lucide-react";

export default function PeminjamanPage() {
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchData = async (p: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/peminjaman?page=${p}&limit=10`);
            if (!res.ok) throw new Error("Failed to fetch data");
            const json = await res.json();
            setData(json.data || json);
            setMeta(json.meta || { totalPages: 1, total: (json.data || json).length });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const filteredData = data.filter(p =>
        p.peminjam?.nama?.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toString().includes(search)
    );

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Kelola Peminjaman</h1>
                            <p className="text-gray-500 text-sm mt-1">Total <span className="font-semibold text-gray-700">{meta.total}</span> transaksi peminjaman.</p>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-3">
                        <div className="relative flex-1 md:min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari peminjam / ID..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm h-10 outline-none"
                            />
                        </div>
                        <Link
                            href="/admin/peminjaman/form"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm h-10 shrink-0 font-medium text-sm"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Tambah Peminjaman</span>
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6 text-center w-20">ID</th>
                                    <th className="p-4">Peminjam</th>
                                    <th className="p-4">Tanggal Pinjam</th>
                                    <th className="p-4">Rencana Kembali</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-500">
                                            <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
                                            Tidak ada data peminjaman.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 pl-6 text-center font-medium text-gray-500">#{p.id}</td>
                                            <td className="p-4 font-medium text-gray-800">{p.peminjam?.nama || "Unknown"}</td>
                                            <td className="p-4 text-gray-600">{new Date(p.tanggalPinjam).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
                                            <td className="p-4 text-gray-600">{new Date(p.tanggalRencanaKembali).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-semibold ${p.status === "selesai" ? "bg-green-50 text-green-600 border border-green-100" :
                                                        p.status === "pending" ? "bg-yellow-50 text-yellow-600 border border-yellow-100" :
                                                            p.status === "ditolak" ? "bg-red-50 text-red-600 border border-red-100" :
                                                                "bg-blue-50 text-blue-600 border border-blue-100"
                                                    }`}>
                                                    {p.status?.toUpperCase().replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link href={`/admin/peminjaman/${p.id}`}
                                                    className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all gap-1.5 shadow-sm">
                                                    Detail <ChevronRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-sm text-gray-500">Halaman <span className="font-medium text-gray-700">{page}</span> dari <span className="font-medium text-gray-700">{meta.totalPages}</span></p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    <ChevronLeft size={15} /> Prev
                                </button>
                                <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}