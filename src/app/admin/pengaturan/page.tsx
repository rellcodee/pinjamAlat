"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Settings, Save, AlertCircle } from "lucide-react";

export default function PengaturanPage() {
    const [denda, setDenda] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/pengaturan?kunci=DENDA_PER_HARI");
            const data = await res.json();
            if (res.ok && data.nilai) {
                setDenda(data.nilai);
            } else {
                setDenda("0"); // Default
            }
        } catch (error) {
            console.error("Gagal memuat pengaturan", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatRupiah = (value: string) => {
        const numberValue = Number(value);
        if (isNaN(numberValue)) return "";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(numberValue);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!denda || isNaN(Number(denda)) || Number(denda) < 0) {
            setMessage({ type: 'error', text: 'Nominal denda tidak valid.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/pengaturan", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kunci: "DENDA_PER_HARI", nilai: denda }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal menyimpan pengaturan.");
            }

            setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pengaturan Sistem</h1>
                            <p className="text-gray-500 text-sm mt-1">Konfigurasi variabel dan aturan sistem aplikasi.</p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">

                        {message && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <div className="space-y-4 max-w-xl">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Denda Keterlambatan</h2>
                                <p className="text-sm text-gray-500 mb-4">Tentukan nominal denda per hari yang dikenakan kepada peminjam jika terlambat mengembalikan alat.</p>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-medium">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={denda}
                                        onChange={(e) => setDenda(e.target.value)}
                                        disabled={isLoading}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium w-full sm:w-auto"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Pengaturan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
