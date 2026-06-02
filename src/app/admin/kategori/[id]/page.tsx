"use client";

import { useEffect, useState, use } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Box, Edit, Trash2, X, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DetailKategoriPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [kategori, setKategori] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editNama, setEditNama] = useState("");
    const [editDeskripsi, setEditDeskripsi] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchDetail = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/kategori/${id}`);
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setKategori(data);
            setEditNama(data.nama);
            setEditDeskripsi(data.deskripsi || "");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/kategori`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: Number(id), nama: editNama, deskripsi: editDeskripsi }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setKategori({ ...kategori, nama: editNama, deskripsi: editDeskripsi });
            setIsEditing(false);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus kategori ini? Kategori yang memiliki alat tidak dapat dihapus.`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/kategori?id=${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus kategori");

            router.push("/admin/kategori");
            router.refresh();
        } catch (err: any) {
            alert(err.message);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="p-6 flex justify-center items-center h-48 text-gray-500 gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Memuat detail kategori...
                </div>
            </AppLayout>
        );
    }

    if (!kategori) {
        return (
            <AppLayout>
                <div className="p-6 text-center text-gray-500">
                    Kategori tidak ditemukan.
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/kategori"
                            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors text-gray-600 shadow-sm"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Detail Kategori</h1>
                            <p className="text-gray-500 text-sm mt-1">Kelola informasi dan lihat alat di dalam kategori ini.</p>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all shadow-sm font-medium text-sm"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting || kategori.alat?.length > 0}
                                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all shadow-sm font-medium text-sm"
                                title={kategori.alat?.length > 0 ? "Kategori tidak dapat dihapus karena masih menampung alat" : "Hapus kategori"}
                            >
                                <Trash2 size={16} /> {isDeleting ? "Menghapus..." : "Hapus"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Card / Edit Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
                    {isEditing ? (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Edit Informasi Kategori</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={editNama}
                                    onChange={(e) => setEditNama(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={editDeskripsi}
                                    onChange={(e) => setEditDeskripsi(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t mt-4">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditNama(kategori.nama);
                                        setEditDeskripsi(kategori.deskripsi || "");
                                    }}
                                    className="px-5 py-2.5 rounded-xl font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isSaving || !editNama.trim()}
                                    className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm font-medium"
                                >
                                    {isSaving ? "Menyimpan..." : <><Save size={18} /> Simpan Perubahan</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Kategori</h3>
                                <p className="text-xl font-bold text-gray-800">{kategori.nama}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</h3>
                                <p className="text-gray-600 whitespace-pre-line">{kategori.deskripsi ? kategori.deskripsi : <span className="italic text-gray-400">Tidak ada deskripsi.</span>}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* List Alat di Kategori ini */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Daftar Alat</h2>
                            <p className="text-sm text-gray-500">Alat-alat yang tergabung dalam kategori ini.</p>
                        </div>
                        <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 font-medium">
                            Total: {kategori.alat?.length || 0} Alat
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {!kategori.alat || kategori.alat.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center text-gray-400">
                                <Box size={40} className="mb-3 text-gray-300" />
                                <p className="font-medium text-gray-500">Belum ada alat di kategori ini</p>
                            </div>
                        ) : (
                            kategori.alat.map((alat: any) => (
                                <div key={alat.id} className="p-4 md:p-6 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Box size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{alat.nama}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-2xl">{alat.deskripsi || "Tidak ada deskripsi"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end shrink-0 pl-14 md:pl-0">
                                        <span className="text-sm font-medium text-gray-500 mb-1">Total Unit</span>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold inline-block">
                                            {alat.units?.length || 0} Unit
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}