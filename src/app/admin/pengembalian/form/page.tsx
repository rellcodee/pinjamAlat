"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PengembalianFormPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        peminjamanId: 0,
        tanggalKembaliAktual: "",
    });

    const [peminjamanList, setPeminjamanList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchPeminjaman = async () => {
        setIsFetching(true);
        try {
            const res = await fetch("/api/peminjaman");
            const json = await res.json();
            const filtered = json.data.filter((p: any) => !p.pengembalian);
            setPeminjamanList(filtered);
        } catch (error) {
            console.error("Gagal mengambil data", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchPeminjaman();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === "peminjamanId" ? Number(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.peminjamanId || !form.tanggalKembaliAktual) {
            alert("Harap lengkapi semua field yang diperlukan.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/pengembalian", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            router.push("/admin/pengembalian");
            router.refresh();
        } catch (err: any) {
            alert("Error: " + err.message);
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <AppLayout>
                <div className="p-6 flex justify-center items-center h-48 text-gray-500 gap-2">
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    Memuat data peminjaman...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/pengembalian"
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 bg-white border border-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Proses Pengembalian Baru</h1>
                            <p className="text-gray-500 text-sm mt-1">Pilih transaksi peminjaman yang akan dikembalikan secara paksa/normal.</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">

                        <div className="grid grid-cols-1 gap-6">

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Peminjaman <span className="text-red-500">*</span></label>
                                <select
                                    name="peminjamanId"
                                    value={form.peminjamanId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none"
                                    required
                                >
                                    <option value={0}>Pilih Transaksi Peminjaman</option>
                                    {peminjamanList.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            #{p.id} - Peminjam: {p.peminjam?.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pengembalian Aktual <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="tanggalKembaliAktual"
                                    value={form.tanggalKembaliAktual}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:bg-white transition-all outline-none"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Sistem akan secara otomatis menghitung jumlah telat dari opsi tanggal ini dengan Tanggal Rencana Kembali untuk menentukan denda jika diatur di Pengaturan.</p>
                            </div>

                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 border-t border-gray-100">
                            <Link
                                href="/admin/pengembalian"
                                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium"
                            >
                                {isLoading ? "Memproses..." : <><ArchiveRestore size={18} /> Simpan Pengembalian</>}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </AppLayout>
    );
}
