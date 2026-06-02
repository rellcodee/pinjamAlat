"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import { 
    ChevronLeft, 
    RotateCcw, 
    Calendar, 
    Receipt, 
    Box, 
    CheckCircle2, 
    AlertCircle, 
    Loader,
    ShieldCheck,
    Clock,
    TrendingUp
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function DetailPengembalianPage() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/pengembalian/${id}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader className="animate-spin text-emerald-500" size={40} />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Sinkronisasi Data Pengembalian...</p>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300">
                        <RotateCcw size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Data Tidak Ditemukan</h2>
                    <button onClick={() => router.back()} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100">Kembali</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-6xl mx-auto py-4">
                
                {/* 🔵 NAVIGATION */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors group"
                >
                    <div className="w-10 h-10 border-2 border-slate-100 rounded-xl flex items-center justify-center group-hover:border-emerald-100 group-hover:bg-emerald-50 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Kembali ke Histori</span>
                </button>

                {/* 🔵 HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Pengembalian #{data.id}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${data.dendaLunas ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border border-current opacity-80`}>
                                {data.dendaLunas ? 'TRANSAKSI LUNAS' : 'TUNGGAKAN DENDA'}
                            </span>
                        </div>
                        <p className="text-slate-400 font-medium italic">Diproses pada {new Date(data.createdAt).toLocaleString("id-ID", { dateStyle: 'full' })}</p>
                    </div>

                    <button className="bg-white border-2 border-slate-100 text-slate-400 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-sm flex items-center gap-3 cursor-not-allowed opacity-50">
                        <Receipt size={18} /> Cetak Bukti Kembali
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* 🔵 LEFT: SUMMARY DATA */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* DENDA BOX */}
                        <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden ${data.dendaLunas ? 'bg-emerald-600 border-emerald-500 shadow-emerald-100 shadow-2xl' : 'bg-rose-600 border-rose-500 shadow-rose-100 shadow-2xl'} text-white group`}>
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                <Receipt size={150} />
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Total Denda Yang Dikenakan</p>
                                    <h2 className="text-5xl font-black tracking-tighter">Rp {data.totalDenda.toLocaleString("id-ID")}</h2>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4">
                                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Keterlambatan</p>
                                        <p className="text-sm font-black italic">{data.jumlahHariTerlambat} Hari</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Status Pembayaran</p>
                                        <p className="text-sm font-black italic">{data.dendaLunas ? 'Lunas Terbayar' : 'Belum Dibayar'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UNIT LIST */}
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm space-y-6">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                                <Box className="text-emerald-600" /> Detail Alat Kembali
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.peminjaman?.details.map((d: any) => (
                                    <div key={d.id} className="group bg-slate-50/50 hover:bg-white p-5 rounded-3xl border border-transparent hover:border-emerald-100 transition-all flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                            {d.alatUnit.alat.image ? (
                                                <img src={d.alatUnit.alat.image} alt={d.alatUnit.alat.nama} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><Box /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">{d.alatUnit.alat.nama}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">S/N: {d.alatUnit.kodeUnit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 🔵 RIGHT: INFO BOX */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-white shadow-sm space-y-8">
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tanggal Kembali</p>
                                        <p className="text-sm font-bold">{new Date(data.tanggalKembaliAktual).toLocaleDateString("id-ID", { dateStyle: 'long' })}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Diverifikasi Oleh</p>
                                        <p className="text-sm font-bold">{data.petugas?.nama || "Sistem"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-blue-500" size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan Pelajar</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                                        {data.totalDenda > 0 
                                            ? "Segera hubungi petugas untuk penyelesaian denda keterlambatan agar dapat meminjam alat kembali." 
                                            : "Terima kasih telah mengembalikan alat tepat waktu dan menjaga kondisi alat dengan baik."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!data.dendaLunas && data.totalDenda > 0 && (
                            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-1">Ingin Bayar Sekarang?</h4>
                                    <p className="text-[10px] text-blue-100 font-medium leading-relaxed opacity-80">Datangi ruang inventaris dan tunjukkan ID Pengembalian ini ke petugas.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
}
