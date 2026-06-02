"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import {
    CheckCircle,
    Loader,
    Search,
    Filter,
    Eye,
    Calendar,
    ChevronRight,
    RotateCcw,
    Undo2,
    CalendarCheck,
    Receipt
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PetugasPengembalianPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Filters
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterLunas, setFilterLunas] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    const fetchData = async (p = 1) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/peminjaman?page=${p}&limit=10`);
            const json = await res.json();

            // Only show disetujui, menunggu_pengembalian, and selesai for returning context
            const filtered = json.data.filter(
                (p: any) =>
                    p.status === "disetujui" ||
                    p.status === "menunggu_pengembalian" ||
                    p.status === "selesai"
            );

            setData(filtered);
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

    const handleApproveReturn = async (id: number) => {
        if (!confirm("Konfirmasi pengembalian alat ini secara manual?")) return;
        try {
            const res = await fetch("/api/pengembalian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    peminjamanId: id,
                    tanggalKembaliAktual: new Date().toISOString(),
                }),
            });
            if (!res.ok) throw new Error("Gagal memproses pengembalian");
            fetchData(page);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filter & Sort Logic
    const filteredData = data
        .filter(p => {
            const matchSearch = p.peminjam?.nama.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === "all" || p.status === filterStatus;
            const matchDate = !filterDate || p.tanggalRencanaKembali.startsWith(filterDate);

            let matchLunas = true;
            if (filterLunas !== "all") {
                const isLunas = p.pengembalian?.dendaLunas;
                matchLunas = filterLunas === "lunas" ? isLunas === true : isLunas === false;
            }

            return matchSearch && matchStatus && matchDate && matchLunas;
        })
        .sort((a, b) => {
            if (!sortBy) return 0;

            let valA = 0;
            let valB = 0;

            if (sortBy === 'denda') {
                valA = a.pengembalian?.totalDenda || 0;
                valB = b.pengembalian?.totalDenda || 0;
            }

            return sortOrder === 'asc' ? valA - valB : valB - valA;
        });

    const readyReturn = data.filter((p) => p.status === "menunggu_pengembalian");

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <RotateCcw className="text-blue-600 hover:rotate-180 transition-transform duration-700" size={32} /> Pengembalian
                        </h1>
                        <p className="text-slate-500 font-medium h-5 tracking-tight italic">Manajemen pengembalian dan penyelesaian denda siswa.</p>
                    </div>
                </div>

                {/* 🟢 REQUEST BOX (NOTIFIKASI PENGEMBALIAN) */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <Undo2 size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[1rem] flex items-center justify-center">
                                <Undo2 size={24} className="group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-shadow-sm">Antrean Pengembalian</h2>
                            {readyReturn.length > 0 && (
                                <span className="bg-white text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-md">
                                    {readyReturn.length} REQUEST
                                </span>
                            )}
                        </div>

                        {readyReturn.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur-lg p-12 rounded-[2rem] text-center border border-white/20">
                                <p className="text-sm font-black opacity-60 uppercase tracking-[0.2em] italic">Bersih. Tidak ada antrean pengembalian.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {readyReturn.map((p) => (
                                    <div key={p.id} className="bg-white/95 backdrop-blur-md text-slate-900 flex justify-between items-center p-6 rounded-[1.5rem] shadow-xl hover:-translate-y-1 transition-all group/card">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center font-black text-emerald-600 text-lg">
                                                #{p.id}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 truncate max-w-[150px] leading-tight text-lg tracking-tight">
                                                    {p.peminjam?.nama}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                                    <CalendarCheck size={12} className="text-emerald-400" />
                                                    Tenggat: {new Date(p.tanggalRencanaKembali).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveReturn(p.id)}
                                                className="h-12 px-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] hover:bg-blue-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 flex items-center gap-2 group/btn uppercase tracking-tighter"
                                            >
                                                <CheckCircle size={18} className="group-hover/btn:scale-125 transition-transform" /> Approve
                                            </button>
                                            <button
                                                onClick={() => router.push(`/petugas/pengembalian/${p.id}`)}
                                                className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
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
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama peminjam..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-black focus:bg-white focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="relative min-w-[180px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={filterLunas}
                                onChange={(e) => setFilterLunas(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-[11px] font-black appearance-none focus:ring-4 focus:ring-emerald-100 outline-none cursor-pointer transition-all uppercase tracking-widest"
                            >
                                <option value="all">SST. DENDA</option>
                                <option value="lunas">LUNAS</option>
                                <option value="belum">BELUM LUNAS</option>
                            </select>
                        </div>

                        <div className="relative min-w-[200px]">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-black focus:ring-4 focus:ring-emerald-100 outline-none appearance-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">ID</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Peminjam</th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tgl Pinjam</th>
                                    <th
                                        className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center cursor-pointer hover:text-blue-500 transition-colors"
                                        onClick={() => {
                                            if (sortBy === 'denda') {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy('denda');
                                                setSortOrder('desc');
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Beban Denda
                                            <Filter size={10} className={sortBy === 'denda' ? 'text-emerald-500' : 'opacity-20'} />
                                        </div>
                                    </th>
                                    <th className="px-8 py-7 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-5">
                                                <Loader className="animate-spin text-emerald-500" size={32} />
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Synchronizing</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <p className="text-slate-200 font-black text-4xl uppercase tracking-[0.5em] italic">No Records</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((p) => {
                                        const isDone = p.status === "selesai";
                                        const hasDenda = p.pengembalian && p.pengembalian.totalDenda > 0;
                                        const isLunas = p.pengembalian && p.pengembalian.dendaLunas;

                                        return (
                                            <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                                                <td className="px-8 py-7 font-black text-slate-300 group-hover:text-blue-600 transition-colors italic">#{p.id}</td>
                                                <td className="px-8 py-7">
                                                    <div className="font-black text-slate-800 text-lg tracking-tight group-hover:translate-x-1 transition-transform">{p.peminjam?.nama}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {p.status.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-7 font-bold text-slate-500 uppercase text-xs tabular-nums">
                                                    {new Date(p.tanggalPinjam).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="px-8 py-7 text-center">
                                                    {p.pengembalian ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`text-base font-black tracking-tight ${hasDenda ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                                Rp {p.pengembalian.totalDenda.toLocaleString("id-ID")}
                                                            </span>
                                                            {hasDenda && (
                                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${isLunas ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'}`}>
                                                                    {isLunas ? 'PAID' : 'PENDING PAYMENT'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] italic">On Progress</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-7 text-right">
                                                    <button
                                                        onClick={() => router.push(`/petugas/pengembalian/${p.id}`)}
                                                        className="inline-flex h-12 px-6 items-center justify-center bg-white border-2 border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 transition-all font-black text-[10px] gap-2 uppercase tracking-widest"
                                                    >
                                                        Details <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Prev
                        </button>
                        <div className="flex gap-2">
                            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all active:scale-95 ${page === n
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
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
                            className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                )}

            </div>
        </Layout>
    );
}
