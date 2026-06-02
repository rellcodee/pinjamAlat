"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import {
    ChevronLeft,
    Calendar,
    Clock,
    Box,
    ShieldCheck,
    Loader,
    Info,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    LucideIcon
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function DetailPeminjamanPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/peminjaman/${id}`);
            const json = await res.json();
            setData(json.id ? json : null);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleRequestReturn = async () => {
        if (!confirm("Ajukan pengembalian untuk seluruh alat dalam peminjaman ini?")) return;
        setIsRequesting(true);
        try {
            const res = await fetch("/api/peminjaman/request-pengembalian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: data.id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Gagal mengajukan");
            alert("Berhasil diajukan! Petugas akan segera memproses pengembalian.");
            fetchData(); // Refresh data
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsRequesting(false);
        }
    };

    const handleCancelReturn = async () => {
        if (!confirm("Batalkan pengajuan pengembalian?")) return;
        setIsRequesting(true);
        try {
            const res = await fetch("/api/peminjaman/request-pengembalian", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: data.id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Gagal dibatalkan");
            alert("Pengajuan pengembalian dibatalkan.");
            fetchData();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsRequesting(false);
        }
    };

    const getStatusConfig = (status: string): { icon: LucideIcon; color: string; bg: string; label: string } => {
        switch (status) {
            case "pending":
                return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "MENUNGGU PERSETUJUAN" };
            case "disetujui":
                return { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", label: "SEDANG DIPINJAM" };
            case "menunggu_pengembalian":
                return { icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50", label: "MENUNGGU PENGEMBALIAN" };
            case "selesai":
                return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "SELESAI" };
            case "ditolak":
                return { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "DITOLAK" };
            default:
                return { icon: Info, color: "text-slate-400", bg: "bg-slate-50", label: status?.toUpperCase() || "UNKNOWN" };
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="animate-spin text-blue-500" size={40} />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Memuat Detail...</p>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                        <Box size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Tidak Ditemukan</h2>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
                    >
                        Kembali
                    </button>
                </div>
            </Layout>
        );
    }

    const config = getStatusConfig(data.status);
    const StatusIcon = config.icon;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-6xl mx-auto py-4">

                {/* NAVIGATION */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group"
                >
                    <div className="w-10 h-10 border-2 border-slate-100 rounded-xl flex items-center justify-center group-hover:border-blue-100 group-hover:bg-blue-50 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Kembali ke Riwayat</span>
                </button>

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
                                Peminjaman #{data.id}
                            </h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border border-current border-opacity-30`}>
                                {config.label}
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium italic">
                            Diajukan pada{" "}
                            {new Date(data.createdAt).toLocaleString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 flex-shrink-0">
                        {data.status === "disetujui" && (
                            <button
                                onClick={handleRequestReturn}
                                disabled={isRequesting}
                                className="bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isRequesting ? <Loader className="animate-spin" size={18} /> : <ArrowUpRight size={18} />}
                                Ajukan Pengembalian
                            </button>
                        )}
                        {data.status === "menunggu_pengembalian" && (
                            <button
                                onClick={handleCancelReturn}
                                disabled={isRequesting}
                                className="bg-white border-2 border-slate-200 text-slate-600 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.15em] hover:border-rose-200 hover:text-rose-600 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isRequesting ? <Loader className="animate-spin" size={18} /> : <XCircle size={18} />}
                                Batal Pengajuan
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* UNIT LIST */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm space-y-6">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                <Box className="text-blue-600" /> Daftar Alat Dipinjam
                            </h2>

                            {data.details?.length === 0 ? (
                                <p className="text-slate-400 italic text-sm font-medium">Tidak ada detail alat.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.details?.map((d: any) => (
                                        <div key={d.id} className="group bg-slate-50/50 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-blue-100 transition-all flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                                {d.alatUnit?.alat?.image ? (
                                                    <img
                                                        src={d.alatUnit.alat.image}
                                                        alt={d.alatUnit.alat.nama}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                        <Box size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                                    {d.alatUnit?.alat?.nama || "Alat"}
                                                </h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    S/N: {d.alatUnit?.kodeUnit || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PENGEMBALIAN INFO (if exists) */}
                        {data.pengembalian && (
                            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm space-y-4">
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-600" /> Info Pengembalian
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tgl. Kembali</p>
                                        <p className="text-sm font-black text-slate-700">
                                            {new Date(data.pengembalian.tanggalKembaliAktual).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterlambatan</p>
                                        <p className={`text-sm font-black ${data.pengembalian.jumlahHariTerlambat > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {data.pengembalian.jumlahHariTerlambat} Hari
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Denda</p>
                                        <p className={`text-sm font-black ${data.pengembalian.totalDenda > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            Rp {data.pengembalian.totalDenda.toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: TIMELINE */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Clock size={160} />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Timeline Peminjaman</p>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="text-blue-400" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tanggal Pinjam</p>
                                        <p className="text-sm font-bold">
                                            {new Date(data.tanggalPinjam).toLocaleDateString("id-ID", { dateStyle: "long" })}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-px h-6 bg-white/10 ml-5"></div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock className="text-rose-400" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Target Kembali</p>
                                        <p className="text-sm font-bold">
                                            {new Date(data.tanggalRencanaKembali).toLocaleDateString("id-ID", { dateStyle: "long" })}
                                        </p>
                                    </div>
                                </div>

                                {data.status === "selesai" && data.pengembalian && (
                                    <>
                                        <div className="w-px h-6 bg-white/10 ml-5"></div>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="text-emerald-400" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Dikembalikan</p>
                                                <p className="text-sm font-bold">
                                                    {new Date(data.pengembalian.tanggalKembaliAktual).toLocaleDateString("id-ID", { dateStyle: "long" })}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-blue-400" size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Penanggung Jawab</p>
                                    </div>
                                    {data.petugas ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-sm">
                                                {data.petugas.nama?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{data.petugas.nama}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase italic">Staf Inventaris</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic font-medium">Menunggu verifikasi...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ALERT for special statuses */}
                        {data.status === "pending" && (
                            <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-100 flex gap-4">
                                <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-black text-amber-700 text-xs uppercase tracking-widest mb-1">Menunggu Persetujuan</h4>
                                    <p className="text-[11px] text-amber-600 font-medium leading-relaxed">
                                        Permintaan kamu sedang ditinjau oleh petugas. Harap tunggu konfirmasi.
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.status === "ditolak" && (
                            <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-100 flex gap-4">
                                <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-black text-rose-700 text-xs uppercase tracking-widest mb-1">Peminjaman Ditolak</h4>
                                    <p className="text-[11px] text-rose-600 font-medium leading-relaxed">
                                        Hubungi petugas inventaris langsung untuk informasi lebih lanjut.
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.status === "menunggu_pengembalian" && (
                            <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 flex gap-4">
                                <ArrowUpRight className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-black text-indigo-700 text-xs uppercase tracking-widest mb-1">Diproses Petugas</h4>
                                    <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
                                        Petugas sedang memproses pengembalianmu. Serahkan alat ke ruang inventaris.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
}
