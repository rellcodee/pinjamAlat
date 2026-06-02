"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import { 
    ClipboardList, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ChevronRight, 
    Box,
    Loader,
    Filter,
    ArrowUpRight,
    LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RiwayatPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/peminjaman/me");
            const json = await res.json();
            setData(Array.isArray(json) ? json : []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatShortDate = (date: string) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusConfig = (status: string): { icon: LucideIcon, color: string, bg: string, label: string } => {
        switch (status) {
            case "pending":
                return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "MENUNGGU" };
            case "disetujui":
                return { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", label: "DISETUJUI" };
            case "menunggu_pengembalian":
                return { icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50", label: "PROSES KEMBALI" };
            case "selesai":
                return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "SELESAI" };
            case "ditolak":
                return { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "DITOLAK" };
            default:
                return { icon: Clock, color: "text-slate-400", bg: "bg-slate-50", label: status.toUpperCase() };
        }
    };

    const activeLoansCount = data.filter(p => p.status === "disetujui" || p.status === "menunggu_pengembalian").length;

    const filteredData = data.filter(p => {
        if (filterStatus === "all") return true;
        if (filterStatus === "ongoing") return p.status === "disetujui" || p.status === "menunggu_pengembalian" || p.status === "pending";
        if (filterStatus === "completed") return p.status === "selesai";
        return p.status === filterStatus;
    });

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* 🔵 TOP SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Peminjaman</p>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{data.length}</h2>
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                            <ClipboardList size={32} />
                        </div>
                    </div>

                    <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-100 flex items-center justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Box size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Sedang Dipinjam</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">{activeLoansCount}</h2>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white relative z-10">
                            <Box size={32} />
                        </div>
                    </div>
                </div>

                {/* 🔵 FILTER & HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 italic">
                        Riwayat Aktivitas
                    </h2>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <button 
                            onClick={() => setFilterStatus("all")}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            SEMUA
                        </button>
                        <button 
                            onClick={() => setFilterStatus("ongoing")}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'ongoing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            BERLANGSUNG
                        </button>
                        <button 
                            onClick={() => setFilterStatus("completed")}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            SELESAI
                        </button>
                    </div>
                </div>

                {/* 🔵 LIST RIWAYAT */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-blue-500" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Memuat Riwayat...</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Tidak ada data riwayat sesuai filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredData.map((p) => {
                            const config = getStatusConfig(p.status);
                            const StatusIcon = config.icon;

                            return (
                                <div 
                                    key={p.id} 
                                    onClick={() => router.push(`/peminjam/peminjaman/${p.id}`)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-white shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6"
                                >
                                    <div className={`w-16 h-16 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <StatusIcon size={28} />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Peminjaman #{p.id}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight transition-colors group-hover:text-blue-600">
                                            {p.details.length > 1 
                                                ? `${p.details[0]?.alatUnit?.alat?.nama} & ${p.details.length - 1} alat lainnya` 
                                                : p.details[0]?.alatUnit?.alat?.nama || "Alat tidak terdaftar"
                                            }
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Calendar size={14} className="text-slate-300" /> 
                                                <span className="text-slate-500 font-bold">{formatShortDate(p.tanggalPinjam)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Clock size={14} className="text-slate-300" /> 
                                                <span className="text-slate-500 font-bold">Target: {formatShortDate(p.tanggalRencanaKembali)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {p.pengembalian && (
                                            <div className="text-right hidden sm:block pr-4 border-r border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Denda</p>
                                                <p className={`text-sm font-black ${p.pengembalian.totalDenda > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                    {p.pengembalian.totalDenda > 0 ? `Rp ${p.pengembalian.totalDenda.toLocaleString()}` : 'Rp 0'}
                                                </p>
                                            </div>
                                        )}
                                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </Layout>
    );
}