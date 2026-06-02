"use client";

import { useEffect, useState, use } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Plus, AlertCircle, Save, X } from "lucide-react";

export default function AlatDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [alat, setAlat] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
    const [editUnitForm, setEditUnitForm] = useState({ kondisi: "", status: "" });

    const fetchAlat = async () => {
        try {
            const res = await fetch(`/api/alat/${id}`);
            if (!res.ok) throw new Error("Alat tidak ditemukan");
            const data = await res.json();
            setAlat(data);
        } catch (error) {
            console.error(error);
            alert("Gagal memuat alat");
            router.push("/admin/alat");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlat();
    }, [id]);

    const handleDeleteAlat = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus alat ini berserta seluruh unitnya?")) return;
        try {
            const res = await fetch(`/api/alat?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus alat");
            router.push("/admin/alat");
        } catch (err: any) {
            alert(err.message);
        }
    };

    // --- Unit Management ---
    const handleAddUnit = async () => {
        try {
            const res = await fetch("/api/alat-unit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alatId: Number(id) })
            });
            if (!res.ok) throw new Error("Gagal menambahkan unit");
            fetchAlat();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteUnit = async (unitId: number) => {
        if (!confirm("Hapus unit ini?")) return;
        try {
            const res = await fetch(`/api/alat-unit?id=${unitId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus unit");
            fetchAlat();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const startEditUnit = (unit: any) => {
        setEditingUnitId(unit.id);
        setEditUnitForm({ kondisi: unit.kondisi, status: unit.status });
    };

    const saveEditUnit = async (unitId: number) => {
        try {
            const res = await fetch("/api/alat-unit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: unitId,
                    kondisi: editUnitForm.kondisi,
                    status: editUnitForm.status
                })
            });
            if (!res.ok) throw new Error("Gagal menyimpan unit");
            setEditingUnitId(null);
            fetchAlat();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </AppLayout>
        );
    }

    if (!alat) return null;

    return (
        <AppLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Back */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/alat"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} /> Kembali ke Katalog
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href={`/admin/alat/form?id=${alat.id}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Pencil size={16} /> Edit Data Alat
                        </Link>
                        <button
                            onClick={handleDeleteAlat}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Hapus Alat
                        </button>
                    </div>
                </div>

                {/* Info Card Alat */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                            <img
                                src={alat.image || "/noalat.jpg"}
                                alt={alat.nama}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/noalat.jpg' }}
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold tracking-wide uppercase">
                            {alat.kategori?.nama || "Umum"}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{alat.nama}</h1>
                        <h3 className="text-lg font-medium text-gray-600">Product By {alat.merk}</h3>
                        <div className="flex items-center gap-6 py-4 border-y border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Stok Tersedia</p>
                                <p className="text-2xl font-bold text-blue-600">{alat.stok} <span className="text-sm font-medium text-gray-500">Unit</span></p>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Keseluruhan Unit</p>
                                <p className="text-2xl font-bold text-gray-800">{alat.alatUnit?.length || 0}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Spesifikasi</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {alat.deskripsi || "Belum ada deskripsi yang ditambahkan untuk alat ini."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Manajemen Unit */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Manajemen Unit</h2>
                            <p className="text-sm text-gray-500">Kelola kondisi dan status setiap unit secara individual</p>
                        </div>
                        <button
                            onClick={handleAddUnit}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} />Unit Baru
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Kode Unit</th>
                                    <th className="px-6 py-4">Kondisi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {!alat.alatUnit || alat.alatUnit.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            Belum ada unit yang terdaftar. Klik "Tambah Unit Baru" untuk memulai.
                                        </td>
                                    </tr>
                                ) : (
                                    alat.alatUnit.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {u.kodeUnit}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUnitId === u.id ? (
                                                    <select
                                                        value={editUnitForm.kondisi}
                                                        onChange={(e) => setEditUnitForm({ ...editUnitForm, kondisi: e.target.value })}
                                                        className="border border-gray-200 rounded-lg p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                    >
                                                        <option value="baik">Baik</option>
                                                        <option value="rusak_ringan">Rusak Ringan</option>
                                                        <option value="rusak_berat">Rusak Berat</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.kondisi === 'baik' ? 'bg-green-50 text-green-700' :
                                                        u.kondisi === 'rusak_ringan' ? 'bg-yellow-50 text-yellow-700' :
                                                            'bg-red-50 text-red-700'
                                                        }`}>
                                                        {u.kondisi.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUnitId === u.id ? (
                                                    <select
                                                        value={editUnitForm.status}
                                                        onChange={(e) => setEditUnitForm({ ...editUnitForm, status: e.target.value })}
                                                        className="border border-gray-200 rounded-lg p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                    >
                                                        <option value="tersedia">Tersedia</option>
                                                        <option value="dipinjam">Dipinjam</option>
                                                        <option value="tidak_tersedia">Tidak Tersedia</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${u.status === 'tersedia' ? 'bg-blue-50 text-blue-700' :
                                                        u.status === 'dipinjam' ? 'bg-orange-50 text-orange-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {u.status.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {editingUnitId === u.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => saveEditUnit(u.id)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Simpan"
                                                            >
                                                                <Save size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingUnitId(null)}
                                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Batal"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEditUnit(u)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Unit"
                                                            >
                                                                <Pencil size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUnit(u.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus Unit"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
