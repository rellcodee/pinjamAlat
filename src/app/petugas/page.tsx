"use client";
import { useState, useEffect } from "react";
import LayoutPetugas from "@/components/layout/LayoutPetugas";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Download,
    ChevronRight,
    FileText,
    Table as TableIcon,
    History,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from "lucide-react";

export default function DashboardPetugas() {
    const router = useRouter();

    const [summary, setSummary] = useState({
        dipinjam: 0,
        selesai: 0,
        totalDenda: 0
    });
    const [chartData, setChartData] = useState([]);
    const [pengembalian, setPengembalian] = useState([]);
    const [isExporting, setIsExporting] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/dashboard");
            const data = await res.json();

            setSummary(data.summary);
            setChartData(data.grafik);
            setPengembalian(data.pengembalian);
        };

        fetchData();
    }, []);

    const exportPeminjaman = async (format: 'excel' | 'pdf') => {
        setIsExporting(`peminjaman-${format}`);
        try {
            const res = await fetch("/api/peminjaman?limit=1000");
            const json = await res.json();
            const data = json.data;

            if (format === 'excel') {
                const resExcel = await fetch("/api/export/peminjaman");
                const blob = await resExcel.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "peminjaman.xlsx";
                a.click();
            } else {
                const doc = new jsPDF();
                doc.text("Laporan Peminjaman Alat", 14, 15);

                const tableData = data.map((p: any) => [
                    p.id,
                    p.peminjam.nama,
                    new Date(p.tanggalPinjam).toLocaleDateString("id-ID"),
                    new Date(p.tanggalRencanaKembali).toLocaleDateString("id-ID"),
                    p.status,
                    p.details.map((d: any) => d.alatUnit.kodeUnit).join(", "),
                    p.details.length,
                ]);

                autoTable(doc, {
                    head: [['ID', 'Peminjam', 'Tgl Pinjam', 'Target', 'Status', 'Kode Unit', 'Jumlah']],
                    body: tableData,
                    startY: 20
                });


                doc.save("laporan-peminjaman.pdf");
            }
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setIsExporting(null);
        }
    };

    const exportPengembalian = async (format: 'excel' | 'pdf') => {
        setIsExporting(`pengembalian-${format}`);
        try {
            if (format === 'excel') {
                const res = await fetch("/api/export/pengembalian");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "pengembalian.xlsx";
                a.click();
            } else {
                const res = await fetch("/api/pengembalian?limit=1000");
                const json = await res.json();
                const data = json.data;

                const doc = new jsPDF();
                doc.text("Laporan Pengembalian Alat", 14, 15);

                const tableData = data.map((p: any) => [
                    p.id,
                    p.peminjaman.peminjam.nama,
                    new Date(p.tanggalKembaliAktual).toLocaleDateString("id-ID"),
                    p.jumlahHariTerlambat,
                    `Rp ${p.totalDenda.toLocaleString("id-ID")}`,
                    p.dendaLunas ? 'Lunas' : 'Belum'
                ]);

                autoTable(doc, {
                    head: [['ID', 'Peminjam', 'Tgl Kembali', 'Telat (Hari)', 'Denda (Rp)', 'Lunas/Belum']],
                    body: tableData,
                    startY: 20
                });

                doc.save("laporan-pengembalian.pdf");
            }
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <LayoutPetugas>
            <div className="space-y-8 p-1">


                {/* =======================
                CARD SUMMARY
            ======================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-500 p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">Active Loans</p>
                            <h2 className="text-4xl font-black text-white mt-2 mb-1 tracking-tighter">
                                {summary.dipinjam}
                            </h2>
                            <p className="text-xs text-white font-medium flex items-center gap-1">
                                <TrendingUp size={12} /> Unit sedang digunakan
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} />
                        </div>
                    </div>

                    <div className="bg-emerald-500 p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">Completed</p>
                            <h2 className="text-4xl font-black text-white mt-2 mb-1 tracking-tighter">
                                {summary.selesai}
                            </h2>
                            <p className="text-xs text-white font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Transaksi berhasil
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <CheckCircle size={32} />
                        </div>
                    </div>

                    <div className="bg-rose-500 p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-widest">Unpaid Fines</p>
                            <h2 className="text-4xl font-black text-white mt-2 mb-1 tracking-tighter">
                                Rp {summary.totalDenda.toLocaleString("id-ID")}
                            </h2>
                            <p className="text-xs text-white font-medium flex items-center gap-1">
                                <AlertCircle size={12} /> Piutang denda saat ini
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                            <AlertCircle size={32} />
                        </div>
                    </div>
                </div>

                {/* =======================
                CHART + ACTION
            ======================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* CHART */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-2">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
                                <History className="text-blue-600" /> Statistik Alat Terpopuler
                            </h3>
                        </div>

                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="namaAlat" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis hide={true} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ACTION */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Download size={150} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-black text-lg uppercase mb-8 tracking-widest flex items-center gap-3">
                                <Download size={20} className="text-blue-400" /> Export Laporan
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Peminjaman</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => exportPeminjaman('excel')}
                                            disabled={!!isExporting}
                                            className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group"
                                        >
                                            <TableIcon size={16} className="text-emerald-400" />
                                            <span className="text-xs font-bold uppercase tracking-tight">Excel</span>
                                        </button>
                                        <button
                                            onClick={() => exportPeminjaman('pdf')}
                                            disabled={!!isExporting}
                                            className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <FileText size={16} className="text-rose-400" />
                                            <span className="text-xs font-bold uppercase tracking-tight">PDF</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Pengembalian</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => exportPengembalian('excel')}
                                            disabled={!!isExporting}
                                            className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <TableIcon size={16} className="text-emerald-400" />
                                            <span className="text-xs font-bold uppercase tracking-tight">Excel</span>
                                        </button>
                                        <button
                                            onClick={() => exportPengembalian('pdf')}
                                            disabled={!!isExporting}
                                            className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            <FileText size={16} className="text-rose-400" />
                                            <span className="text-xs font-bold uppercase tracking-tight">PDF</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-12 relative z-10 font-bold uppercase tracking-widest text-center italic">
                            Format PDF & XLSX Tersedia
                        </p>
                    </div>

                </div>


            </div>
        </LayoutPetugas>
    );
}