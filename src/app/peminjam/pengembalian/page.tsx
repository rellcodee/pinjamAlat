"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import {
    RotateCcw,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Box,
    Receipt,
    Loader,
    ChevronRight,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PengembalianPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get all my loans including pengembalian data
            const res = await fetch("/api/peminjaman/me");
            const json = await res.json();

            if (!Array.isArray(json)) {
                setData([]);
                return;
            }

            // Extract only items that have a pengembalian record
            const returns = json
                .filter((p: any) => p.pengembalian)
                .map((p: any) => ({
                    ...p.pengembalian,   // spread pengembalian fields (id, totalDenda, dendaLunas, etc.)
                    peminjaman: p         // attach full peminjaman for detail (includes .details[].alatUnit.alat)
                }));

            setData(returns);
        } catch (error) {
            console.error("Fetch error:", error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalDendaUnpaid = data
        .filter(r => !r.dendaLunas && r.totalDenda > 0)
        .reduce((acc, curr) => acc + curr.totalDenda, 0);

    const totalAlatReturned = data.reduce((acc, curr) => acc + (curr.peminjaman?.details?.length || 0), 0);

    if (isLoading) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="animate-spin text-emerald-500" size={40} />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Menyusun Histori...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* 🔵 TOP SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Alat Kembali</p>
                            <h2 className="text-4xl font-black text-emerald-600 tracking-tighter">{totalAlatReturned}</h2>
                            <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                <TrendingUp size={12} /> Dari {data.length} transaksi
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <Box size={32} />
                        </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between group hover:-translate-y-1 transition-all relative overflow-hidden ${totalDendaUnpaid > 0 ? 'bg-rose-600 shadow-rose-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Receipt size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${totalDendaUnpaid > 0 ? 'text-rose-100' : 'text-emerald-100'}`}>
                                {totalDendaUnpaid > 0 ? 'Denda Belum Lunas' : 'Semua Denda Lunas'}
                            </p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                Rp {totalDendaUnpaid.toLocaleString("id-ID")}
                            </h2>
                            <p className={`text-[10px] font-bold mt-1 italic ${totalDendaUnpaid > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
                                {totalDendaUnpaid > 0 ? 'Segera hubungi petugas.' : 'Tidak ada tunggakan.'}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                            <Receipt size={32} />
                        </div>
                    </div>
                </div>

                {/* 🔵 HEADER */}
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <RotateCcw className="text-emerald-600" /> Histori Pengembalian
                    </h2>
                    <p className="text-slate-500 font-medium italic mt-1">
                        Daftar alat yang telah kamu kembalikan secara resmi.
                    </p>
                </div>

                {/* 🔵 LIST */}
                {data.length === 0 ? (
                    <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                            <RotateCcw size={32} />
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">
                            Belum ada pengembalian tercatat
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {data.map((r) => {
                            const firstAlat = r.peminjaman?.details?.[0]?.alatUnit?.alat;
                            const extraCount = (r.peminjaman?.details?.length || 1) - 1;

                            return (
                                <div
                                    key={r.id}
                                    onClick={() => router.push(`/peminjam/pengembalian/${r.id}`)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border-2 border-white shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6"
                                >
                                    <div className={`w-16 h-16 ${r.dendaLunas ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        {r.dendaLunas ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                Pengembalian #{r.id}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${r.dendaLunas ? 'bg-emerald-100 text-emerald-700' : r.totalDenda > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {r.dendaLunas ? 'LUNAS' : r.totalDenda > 0 ? 'BELUM LUNAS' : 'TIDAK ADA DENDA'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                                            {firstAlat?.nama || "Alat tidak diketahui"}
                                            {extraCount > 0 && ` & ${extraCount} lainnya`}
                                        </h3>
                                        <div className="flex items-center gap-6 pt-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Calendar size={14} className="text-slate-300" />
                                                Kembali:{" "}
                                                <span className="text-slate-500 font-bold">
                                                    {new Date(r.tanggalKembaliAktual).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right border-r border-slate-100 pr-6 hidden sm:block">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nominal Denda</p>
                                            <p className={`text-xl font-black ${r.totalDenda > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                                                Rp {r.totalDenda.toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all flex-shrink-0">
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
