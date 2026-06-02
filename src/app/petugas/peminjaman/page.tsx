"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import {
    CheckCircle,
    XCircle,
    Loader,
    Search,
    Filter,
    Eye,
    Calendar,
    ChevronRight,
    ClipboardCheck,
    BellRing
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PetugasPeminjamanPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    const fetchData = async (p = 1) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/peminjaman?page=${p}&limit=10`);
            const json = await res.json();
            setData(json.data);
            setMeta(json.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const updateStatus = async (id: number, status: string) => {
        if (!confirm(`Yakin ingin ${status} peminjaman ini?`)) return;
        try {
            await fetch("/api/peminjaman", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            fetchData(page);
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Filter Logic (Client-side for sub-filtering within the page, though usually better handled by API for full set)
    // For now, I'll keep the client-side filter for fine-tuning, but API handles main pagination.
    const filteredData = data.filter(p => {
        const matchSearch = p.peminjam?.nama.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || p.status === filterStatus;
        const matchDate = !filterDate || p.tanggalPinjam.startsWith(filterDate);
        return matchSearch && matchStatus && matchDate;
    });

    const pendingList = data.filter((p) => p.status === "pending");

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "disetujui":
                return "bg-amber-100 text-amber-600 border border-amber-200";
            case "menunggu_pengembalian":
                return "bg-blue-100 text-blue-600 border border-blue-200";
            case "selesai":
                return "bg-emerald-100 text-emerald-600 border border-emerald-200";
            case "ditolak":
                return "bg-rose-100 text-rose-600 border border-rose-200";
            default:
                return "bg-slate-100 text-slate-500 border border-slate-200";
        }
    };

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <ClipboardCheck className="text-blue-600 hover:rotate-12 transition-transform" size={32} /> Peminjaman
                        </h1>
                        <p className="text-slate-500 font-medium h-5 tracking-tight italic">Kelola data peminjaman alat oleh siswa secara efisien.</p>
                    </div>
                </div>

                {/* 🔵 REQUEST BOX (NOTIFIKASI PERMINTAAN) */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                        <BellRing size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <BellRing size={24} className="group-hover:animate-swing" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-widest">Permintaan Peminjaman</h2>
                            {pendingList.length > 0 && (
                                <span className="bg-rose-500 text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                                    {pendingList.length} BARU
                                </span>
                            )}
                        </div>

                        {pendingList.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur-lg p-12 rounded-[2rem] text-center border border-white/20">
                                <p className="text-sm font-black opacity-60 uppercase tracking-[0.2em]">Antrean Kosong</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pendingList.map((p) => (
                                    <div key={p.id} className="bg-white text-slate-900 flex justify-between items-center p-6 rounded-[1.5rem] shadow-xl group transition-all hover:-translate-y-1">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-lg">
                                                #{p.id}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 truncate max-w-[150px] leading-tight">
                                                    {p.peminjam?.nama}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    {p.details.length} Unit Alat
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex gap-1.5 mr-2 border-r border-slate-100 pr-3">
                                                <button
                                                    onClick={() => updateStatus(p.id, "disetujui")}
                                                    className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                    title="Setujui"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(p.id, "ditolak")}
                                                    className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                                                    title="Tolak"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/petugas/peminjaman/${p.id}`)}
                                                className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama peminjam..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-black focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-black appearance-none focus:ring-4 focus:ring-blue-100 outline-none cursor-pointer transition-all"
                            >
                                <option value="all">SEMUA STATUS</option>
                                <option value="pending">PENDING</option>
                                <option value="disetujui">DIPINJAM</option>
                                <option value="menunggu_pengembalian">MENUNGGU</option>
                                <option value="selesai">SELESAI</option>
                                <option value="ditolak">DITOLAK</option>
                            </select>
                        </div>

                        <div className="relative min-w-[200px]">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-black focus:ring-4 focus:ring-blue-100 outline-none appearance-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">ID</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Peminjam</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal Pinjam</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-5">
                                                <Loader className="animate-spin text-blue-500" size={32} />
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Processing Data</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <p className="text-slate-200 font-black text-4xl uppercase tracking-[0.5em] italic select-none">No Results</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="px-8 py-7 font-black text-slate-400 group-hover:text-blue-600 transition-colors italic">#{p.id}</td>
                                            <td className="px-8 py-7">
                                                <div className="font-black text-slate-800 text-lg tracking-tight">{p.peminjam?.nama}</div>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 group-hover:text-blue-400">{p.details.length} Unit Diproses</div>
                                            </td>
                                            <td className="px-8 py-7 font-bold text-slate-500 uppercase text-xs tabular-nums">
                                                {new Date(p.tanggalPinjam).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-7">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(p.status)}`}>
                                                    {p.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <button
                                                    onClick={() => router.push(`/petugas/peminjaman/${p.id}`)}
                                                    className="inline-flex h-12 w-12 items-center justify-center bg-white border-2 border-slate-100 rounded-2xl text-slate-300 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {!isLoading && meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 py-6">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            Prev
                        </button>
                        <div className="flex gap-2">
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${page === n
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={page === meta.totalPages}
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </Layout>
    );
}