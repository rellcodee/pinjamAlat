"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KategoriFormPage() {
    const router = useRouter();
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/kategori", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, deskripsi }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push("/admin/kategori");
            router.refresh();
        } catch (err: any) {
            alert(err.message);
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/admin/kategori"
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tambah Kategori Baru</h1>
                        <p className="text-gray-500 text-sm mt-1">Masukkan informasi detail kategori untuk mengelompokkan alat.</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Kamera, Lensa, Audio..."
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Kategori</label>
                                <textarea
                                    rows={4}
                                    placeholder="Penjelasan opsional tentang kategori ini..."
                                    value={deskripsi}
                                    onChange={(e) => setDeskripsi(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none resize-y"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                            <Link
                                href="/admin/kategori"
                                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading || !nama}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Kategori
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </AppLayout>
    );
}
