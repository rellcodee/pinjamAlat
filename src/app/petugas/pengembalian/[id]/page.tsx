"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import { ArrowLeft, CheckCircle, Clock, Info, Box, Receipt } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PetugasDetailPengembalianPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchDetail = async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`/api/peminjaman`);
            const json = await res.json();
            const target = json.data.find((p: any) => p.id === Number(id));
            if (!target) throw new Error("Data tidak ditemukan");
            setData(target);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat detail pengembalian.");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleLunas = async () => {
        if (!data.pengembalian) return;
        if (!confirm("Tandai denda ini sebagai Lunas?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/pengembalian`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: data.pengembalian.id,
                    dendaLunas: true
                }),
            });
            if (!res.ok) throw new Error("Gagal mengupdate status lunas");

            fetchDetail();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Layout>
                <div className="p-6 flex justify-center items-center h-48 text-slate-500 gap-2">
                    <Clock size={20} className="animate-spin text-blue-600" /> Memuat detail...
                </div>
            </Layout>
        );
    }

    const pengembalian = data.pengembalian;
    const hasDenda = pengembalian && pengembalian.totalDenda > 0;
    const isLunas = pengembalian && pengembalian.dendaLunas;

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/petugas/pengembalian" className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 bg-white/50 border border-slate-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Detail Pengembalian #{id}</h1>
                        <p className="text-sm text-slate-500 mt-1">Status dan rincian denda pengembalian</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Informasi Peminjam</label>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">{data.peminjam.nama}</p>
                                        <p className="text-sm text-slate-500 inline-flex items-center gap-1.5 mt-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 font-medium">
                                            {data.peminjam.username} • {data.peminjam.kelas || "T/A"}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm flex items-center gap-2 ${data.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${data.status === 'selesai' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        {data.status.replace("_", " ")}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Terlambat</label>
                                        <p className={`text-3xl font-black ${hasDenda ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {pengembalian ? pengembalian.jumlahHariTerlambat : 0} <span className="text-sm">Hari</span>
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Total Denda</label>
                                        <p className={`text-3xl font-black ${hasDenda ? 'text-rose-500' : 'text-slate-900'}`}>
                                            Rp {pengembalian ? pengembalian.totalDenda.toLocaleString("id-ID") : 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Unit yang Dikembalikan</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {data.details.map((d: any) => (
                                            <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all cursor-default group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                        <Box size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{d.alatUnit.kodeUnit}</p>
                                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{d.alatUnit.alat.nama}</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 uppercase group-hover:text-blue-500 group-hover:border-blue-200 transition-all">
                                                    Dikembalikan
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Box */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-slate-300">
                            <h4 className="text-[10px] font-black tracking-widest uppercase mb-6 text-slate-500">Timeline Pengembalian</h4>
                            <div className="space-y-6 relative ml-4 border-l-2 border-slate-800 pl-8 pb-2">
                                <div className="relative">
                                    <div className="absolute -left-[45px] top-1 w-6 h-6 bg-slate-900 rounded-full border-4 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Rencana Kembali</p>
                                    <p className="text-sm font-bold text-white">{new Date(data.tanggalRencanaKembali).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="relative">
                                    <div className={`absolute -left-[45px] top-1 w-6 h-6 bg-slate-900 rounded-full border-4 ${hasDenda ? 'border-rose-500' : 'border-emerald-500'}`} />
                                    <p className={`text-[10px] font-black uppercase mb-1 ${hasDenda ? 'text-rose-400' : 'text-emerald-400'}`}>Tgl Kembali Aktual</p>
                                    <p className="text-sm font-bold text-white">
                                        {pengembalian ? new Date(pengembalian.tanggalKembaliAktual).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
                            <div className="p-8 space-y-6">
                                <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                                    <Receipt size={24} className="text-blue-500" /> Payment Result
                                </h3>

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Subtotal</span>
                                        <span className="text-slate-900 font-bold tabular-nums">Rp {pengembalian ? pengembalian.totalDenda.toLocaleString("id-ID") : 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isLunas ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {isLunas ? 'Lunas' : 'Belum Lunas'}
                                        </span>
                                    </div>
                                </div>

                                {hasDenda && !isLunas ? (
                                    <button
                                        onClick={handleLunas}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 group hover:-translate-y-1 active:translate-y-0"
                                    >
                                        <CheckCircle size={20} className="group-hover:rotate-12 transition-transform" /> Konfirmasi Lunas
                                    </button>
                                ) : hasDenda && isLunas ? (
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center gap-2">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                                            <CheckCircle size={24} className="text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-black text-emerald-900 uppercase">Payment Verified</p>
                                        <p className="text-xs text-emerald-600 font-medium">Beban denda sebesar Rp {pengembalian.totalDenda.toLocaleString("id-ID")} telah diselesaikan.</p>
                                    </div>
                                ) : (
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-2">
                                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">No Payment Needed</p>
                                        <p className="text-xs text-emerald-600 font-medium">Peminjam mengembalikan alat tepat waktu.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                <Info size={32} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-blue-200 tracking-widest mb-1 italic">Note Petugas</p>
                                <p className="text-sm font-medium leading-relaxed">Pastikan kondisi unit alat sudah sesuai sebelum menutup sesi peminjaman ini.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
