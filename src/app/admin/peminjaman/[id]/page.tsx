"use client";

import { useEffect, useState, use } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Trash2, Box, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DetailPeminjamanPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [form, setForm] = useState({
        id: Number(id),
        peminjamId: 0,
        tanggalPinjam: "",
        tanggalRencanaKembali: "",
        alatUnitIds: [] as number[],
    });

    const [status, setStatus] = useState("");
    const [units, setUnits] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchAll = async () => {
        setIsFetching(true);
        try {
            const [peminjamanRes, unitRes, userRes] = await Promise.all([
                fetch(`/api/peminjaman?id=${id}`), // Wait, GET /api/peminjaman returns all. Let's filter client-side or use existing data.
                fetch("/api/alat-unit"),
                fetch("/api/user")
            ]);

            const [peminjamanDataList, unitData, userData] = await Promise.all([
                peminjamanRes.json(),
                unitRes.json(),
                userRes.json()
            ]);

            const targetPeminjaman = peminjamanDataList.data.find((p: any) => p.id === Number(id));

            if (!targetPeminjaman) throw new Error("Peminjaman tidak ditemukan");

            setForm({
                id: targetPeminjaman.id,
                peminjamId: targetPeminjaman.peminjamId,
                tanggalPinjam: targetPeminjaman.tanggalPinjam.split("T")[0],
                tanggalRencanaKembali: targetPeminjaman.tanggalRencanaKembali.split("T")[0],
                alatUnitIds: targetPeminjaman.details.map((d: any) => d.alatUnitId),
            });
            setStatus(targetPeminjaman.status);

            setUnits(unitData);
            setUsers(userData);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat detail peminjaman.");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [id]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === "peminjamId" ? Number(value) : value,
        });
    };

    const toggleUnit = (unitId: number) => {
        if (form.alatUnitIds.includes(unitId)) {
            setForm({
                ...form,
                alatUnitIds: form.alatUnitIds.filter((u) => u !== unitId),
            });
        } else {
            setForm({
                ...form,
                alatUnitIds: [...form.alatUnitIds, unitId],
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch("/api/peminjaman", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            router.push("/admin/peminjaman");
            router.refresh();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Peringatan: Sebagai Admin, Anda dapat menghapus data ini sepenuhnya secara paksa. Yakin hapus peminjaman?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/peminjaman?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Gagal menghapus");

            router.push("/admin/peminjaman");
            router.refresh();
        } catch (err: any) {
            alert("Error: " + err.message);
            setIsDeleting(false);
        }
    };

    if (isFetching) {
        return (
            <AppLayout>
                <div className="p-6 flex justify-center items-center h-48 text-gray-500 gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Memuat data...
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
                            href="/admin/peminjaman"
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 bg-white border border-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Detail Peminjaman #{id}</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Status: <span className="font-semibold text-gray-700 uppercase bg-gray-100 px-2 py-0.5 rounded">{status?.replace("_", " ")}</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-xl transition-all shadow-sm font-medium text-sm"
                        >
                            <Trash2 size={16} /> {isDeleting ? "Menghapus..." : "Hapus Data"}
                        </button>
                    </div>
                </div>

                <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-4 rounded-xl flex items-start gap-3 text-sm">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <b className="block mb-1">Akses Spesial Admin</b>
                        Sebagai Administrator sistem, Anda diizinkan untuk mengabaikan prasyarat dan memodifikasi isi transaksi ini secara paksa atau menghapusnya jika terindikasi kerusakan data.
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleUpdate} className="p-6 md:p-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-4 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Peminjam</label>
                                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700">
                                    {users.find(u => u.id === form.peminjamId)?.nama || "Unknown User"}
                                </div>
                                <input type="hidden" name="peminjamId" value={form.peminjamId} />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pinjam</label>
                                <input
                                    type="date"
                                    name="tanggalPinjam"
                                    value={form.tanggalPinjam}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal Rencana Kembali</label>
                                <input
                                    type="date"
                                    name="tanggalRencanaKembali"
                                    value={form.tanggalRencanaKembali}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2 mt-4">
                                <label className="block text-sm font-medium text-gray-700">Unit Alat Dipinjam</label>
                                <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 min-h-[160px] max-h-[300px] overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {units
                                            .filter((u) => u.status === "tersedia" || form.alatUnitIds.includes(u.id))
                                            .map((u) => {
                                                const isSelected = form.alatUnitIds.includes(u.id);
                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => toggleUnit(u.id)}
                                                        className={`p-3 cursor-pointer rounded-xl border flex items-center gap-3 transition-colors ${isSelected
                                                                ? "bg-blue-50 border-blue-600 text-blue-700"
                                                                : "bg-white border-transparent hover:border-gray-300 text-gray-700"
                                                            }`}
                                                    >
                                                        <Box size={18} className={isSelected ? "text-blue-600" : "text-gray-400"} />
                                                        <div>
                                                            <div className="font-semibold text-sm">{u.kodeUnit}</div>
                                                            <div className="text-xs opacity-80 truncate">{u.alat?.nama}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">Total alat: {form.alatUnitIds.length}</p>
                            </div>

                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/peminjaman")}
                                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium"
                            >
                                {isLoading ? "Menyimpan..." : <><Save size={18} /> Update Data Peminjaman</>}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </AppLayout>
    );
}
