"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import { ArrowLeft, CheckCircle, XCircle, Loader, Info, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PetugasDetailPeminjamanPage({ params }: { params: Promise<{ id: string }> }) {
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
            alert("Gagal memuat detail peminjaman.");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const updateStatus = async (status: "disetujui" | "ditolak") => {
        if (!confirm(`Konfirmasi untuk ${status} peminjaman ini?`)) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/peminjaman", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: Number(id), status }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            
            router.refresh();
            fetchDetail();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Layout>
                <div className="p-6 flex justify-center items-center h-48 text-slate-500 gap-2">
                    <Loader size={20} className="animate-spin text-blue-600" /> Memuat detail...
                </div>
            </Layout>
        );
    }

    const isPending = data.status === "pending";

    return (
        <Layout>
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/petugas/peminjaman" className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 bg-white/50 border border-slate-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Detail Peminjaman #{id}</h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola permohonan peminjaman alat</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peminjam</label>
                                    <p className="text-lg font-bold text-slate-800">{data.peminjam.nama}</p>
                                    <p className="text-sm text-slate-500">{data.peminjam.kelas || "Tanpa Kelas"}</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                                    data.status === 'pending' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                                    data.status === 'disetujui' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                    data.status === 'ditolak' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                                    'bg-blue-100 text-blue-600 border border-blue-200'
                                }`}>
                                    {data.status.replace("_", " ")}
                                </div>
                            </div>

                            <hr className="border-slate-50" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Pinjam</label>
                                    <p className="font-semibold text-slate-700">{new Date(data.tanggalPinjam).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rencana Kembali</label>
                                    <p className="font-semibold text-slate-700">{new Date(data.tanggalRencanaKembali).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Alat Dipinjam</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.details.map((d: any) => (
                                        <div key={d.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <Box size={20} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{d.alatUnit.kodeUnit}</p>
                                                <p className="text-xs text-slate-500">{d.alatUnit.alat.nama}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Info size={18} className="text-blue-500" /> Aksi Petugas
                            </h3>
                            
                            {isPending ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => updateStatus("disetujui")}
                                        disabled={isLoading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} /> Setujui Permintaan
                                    </button>
                                    <button
                                        onClick={() => updateStatus("ditolak")}
                                        disabled={isLoading}
                                        className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <XCircle size={20} /> Tolak Permintaan
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                    <p className="text-sm text-slate-500">Peminjaman ini sudah diproses dan tidak dapat diubah lagi statusnya.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Petugas Pengolah</h4>
                            {data.petugas ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                                        {data.petugas.nama.charAt(0)}
                                    </div>
                                    <p className="text-sm font-bold text-blue-900">{data.petugas.nama}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-500 italic">Belum diproses</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
