"use client";

import { useEffect, useState, use } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Trash2, ArchiveRestore, Info, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatTanggal(tanggal: string) {
    const date = new Date(tanggal);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `0${month}/${day}/${year}`;
}

export default function DetailPengembalianPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [form, setForm] = useState({
        id: Number(id),
        peminjamanId: 0,
        tanggalKembaliAktual: "",
    });

    const [pengembalianInfo, setPengembalianInfo] = useState<any>(null);
    const [peminjamanList, setPeminjamanList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLunas, setIsLunas] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchAll = async () => {
        setIsFetching(true);
        try {
            // Get all pages of pengembalian to find the item
            const pengembalianRes = await fetch(`/api/pengembalian?limit=1000`);
            const peminjamanRes = await fetch(`/api/peminjaman?limit=1000`);

            const [pengembalianJson, peminjamanJson] = await Promise.all([
                pengembalianRes.json(),
                peminjamanRes.json()
            ]);

            const pengembalianData = pengembalianJson.data || pengembalianJson;
            const peminjamanData = peminjamanJson.data || peminjamanJson;

            const targetPengembalian = pengembalianData.find((p: any) => p.id === Number(id));
            if (!targetPengembalian) throw new Error("Data Pengembalian tidak ditemukan");

            setForm({
                id: targetPengembalian.id,
                peminjamanId: targetPengembalian.peminjamanId,
                tanggalKembaliAktual: targetPengembalian.tanggalKembaliAktual?.split("T")[0],
            });
            setPengembalianInfo(targetPengembalian);
            setIsLunas(targetPengembalian.dendaLunas);

            const availablePeminjaman = peminjamanData.filter((p: any) => !p.pengembalian || p.id === targetPengembalian.peminjamanId);
            setPeminjamanList(availablePeminjaman);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat detail pengembalian.");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => { fetchAll(); }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === "peminjamanId" ? Number(value) : value });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/pengembalian", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            router.push("/admin/pengembalian");
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Ini akan me-rollback data (status peminjaman kembali ke 'disetujui'). Lanjut?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/pengembalian?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus");
            router.push("/admin/pengembalian");
        } catch (err: any) {
            alert("Error: " + err.message);
            setIsDeleting(false);
        }
    };

    const handleTandaiLunas = async () => {
        if (!confirm("Tandai denda ini sebagai LUNAS? Tindakan ini tidak dapat dibatalkan.")) return;
        try {
            const res = await fetch("/api/pengembalian", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: Number(id) }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setIsLunas(true);
            setPengembalianInfo((prev: any) => ({ ...prev, dendaLunas: true }));
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (isFetching) {
        return (
            <AppLayout>
                <div className="p-6 flex justify-center items-center h-48 text-gray-500 gap-2">
                    <Loader2 size={20} className="animate-spin text-green-600" /> Memuat data...
                </div>
            </AppLayout>
        );
    }

    const hasDenda = (pengembalianInfo?.totalDenda ?? 0) > 0;

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/pengembalian" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 bg-white border border-gray-200">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Detail Pengembalian #{id}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${pengembalianInfo?.jumlahHariTerlambat > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"}`}>
                                    {pengembalianInfo?.jumlahHariTerlambat > 0 ? `TELAT ${pengembalianInfo.jumlahHariTerlambat} HARI` : "TEPAT WAKTU"}
                                </span>
                                {hasDenda && (
                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isLunas ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                                        {isLunas ? <><CheckCircle2 size={12} /> Lunas</> : "Belum Lunas"}
                                    </span>
                                )}
                                {hasDenda && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                                        Rp {pengembalianInfo.totalDenda.toLocaleString("id-ID")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {hasDenda && !isLunas && (
                            <button onClick={handleTandaiLunas}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm font-medium text-sm">
                                <CheckCircle2 size={16} /> Tandai Lunas
                            </button>
                        )}
                        <button onClick={handleDelete} disabled={isDeleting}
                            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-xl transition-all shadow-sm font-medium text-sm">
                            <Trash2 size={16} /> {isDeleting ? "Menghapus..." : "Hapus"}
                        </button>
                    </div>
                </div>

                {/* Alert */}
                <div className="bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-sm">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <div>
                        <b>Pengaturan Paksa (Admin Override)</b> — Ubah tanggal untuk memanipulasi perhitungan denda. Denda dihitung ulang otomatis berdasarkan <b>DENDA_PER_HARI</b> di halaman Pengaturan Sistem.
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleUpdate} className="p-6 md:p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Peminjaman Asal</label>
                            <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700">
                                #{pengembalianInfo?.peminjamanId} - {pengembalianInfo?.peminjaman?.peminjam?.nama}
                            </div>
                            <input type="hidden" name="peminjamanId" value={form.peminjamanId} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="space-y-4">
                                <label htmlFor="tanggalPinjam" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pinjam</label>
                                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none">
                                    <label htmlFor="tanggalPinjam">{formatTanggal(pengembalianInfo?.peminjaman?.tanggalPinjam)}</label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label htmlFor="tanggalPinjam" className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengembalian</label>
                                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none">
                                    <label htmlFor="tanggalPinjam">{formatTanggal(pengembalianInfo?.peminjaman?.tanggalRencanaKembali)}</label>
                                </div>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengembalian Aktual</label>
                            <input type="date" name="tanggalKembaliAktual" value={form.tanggalKembaliAktual} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none" />
                        </div>

                        {/* Unit yang dikembalikan */}
                        {pengembalianInfo?.peminjaman?.details?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Yang Dikembalikan</label>
                                <div className="border border-gray-200 rounded-xl bg-gray-50 p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {pengembalianInfo.peminjaman.details.map((d: any) => (
                                            <div key={d.id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                <div className="text-sm font-semibold text-gray-800 font-mono">{d.alatUnit?.kodeUnit}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{d.alatUnit?.alat?.nama}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Denda */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Denda</label>
                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none">
                                <label htmlFor="tanggalPinjam">Rp {pengembalianInfo?.totalDenda?.toLocaleString("id-ID")}</label>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                            <button type="button" onClick={() => router.push("/admin/pengembalian")}
                                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                Kembali
                            </button>
                            <button type="submit" disabled={isLoading}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium">
                                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Update & Hitung Ulang Denda</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
