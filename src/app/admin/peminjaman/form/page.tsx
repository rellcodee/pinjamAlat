"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Box } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PeminjamanFormPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        peminjamId: 0,
        tanggalPinjam: "",
        tanggalRencanaKembali: "",
        alatUnitIds: [] as number[],
    });

    const [units, setUnits] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchAll = async () => {
        setIsFetching(true);
        try {
            const [unitRes, userRes] = await Promise.all([
                fetch("/api/alat-unit"),
                fetch("/api/user")
            ]);
            const [unitData, userData] = await Promise.all([
                unitRes.json(),
                userRes.json()
            ]);
            setUnits(unitData);
            setUsers(userData);
        } catch (error) {
            console.error("Gagal mengambil data", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === "peminjamId" ? Number(value) : value,
        });
    };

    const toggleUnit = (id: number) => {
        if (form.alatUnitIds.includes(id)) {
            setForm({
                ...form,
                alatUnitIds: form.alatUnitIds.filter((u) => u !== id),
            });
        } else {
            setForm({
                ...form,
                alatUnitIds: [...form.alatUnitIds, id],
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.peminjamId || !form.tanggalPinjam || !form.tanggalRencanaKembali || form.alatUnitIds.length === 0) {
            alert("Harap lengkapi semua field dan pilih minimal satu unit alat.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/peminjaman", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            router.push("/admin/peminjaman");
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
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Halaman Buat Peminjaman</h1>
                            <p className="text-gray-500 text-sm mt-1">Isi detail lengkap untuk membuat peminjaman baru sesuai prosedur admin.</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Peminjam <span className="text-red-500">*</span></label>
                                <select
                                    name="peminjamId"
                                    value={form.peminjamId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                                    required
                                >
                                    <option value={0}>Pilih Peminjam</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal Pinjam <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="tanggalPinjam"
                                    value={form.tanggalPinjam}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal Rencana Kembali <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    name="tanggalRencanaKembali"
                                    value={form.tanggalRencanaKembali}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4 md:col-span-2 mt-4">
                                <label className="block text-sm font-medium text-gray-700">Pilih Unit Alat <span className="text-red-500">*</span></label>
                                <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 min-h-[160px] max-h-[300px] overflow-y-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {units
                                            .filter((u) => u.status === "tersedia")
                                            .map((u) => {
                                                const isSelected = form.alatUnitIds.includes(u.id);
                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => toggleUnit(u.id)}
                                                        className={`p-3 cursor-pointer rounded-xl border flex items-center gap-3 transition-colors ${
                                                            isSelected
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
                                        {units.filter((u) => u.status === "tersedia").length === 0 && (
                                            <p className="text-gray-500 text-sm col-span-full">Tidak ada unit tersedia.</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">Pilih satu atau lebih alat yang tersedia. Total alat dipilih: {form.alatUnitIds.length}</p>
                            </div>

                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 border-t border-gray-100">
                            <Link
                                href="/admin/peminjaman"
                                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium"
                            >
                                {isLoading ? "Menyimpan..." : <><Save size={18} /> Simpan Peminjaman</>}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </AppLayout>
    );
}
