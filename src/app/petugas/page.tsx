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

export default function DashboardPetugas() {
    const router = useRouter();

    const [summary, setSummary] = useState({
        dipinjam: 0,
        selesai: 0,
        totalDenda: 0
    });
    const [chartData, setChartData] = useState([]);
    const [pengembalian, setPengembalian] = useState([]);

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
    const exportPeminjaman = async () => {
        const res = await fetch("/api/export/peminjaman");
        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "peminjaman.xlsx";
        a.click();
    };

    const exportPengembalian = async () => {
        const res = await fetch("/api/export/pengembalian");
        const blob = await res.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "pengembalian.xlsx";
        a.click();
    };
    return (
        <LayoutPetugas>
            <div className="space-y-6">

                {/* =======================
                CARD SUMMARY
            ======================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Sedang Dipinjam</p>
                        <h2 className="text-2xl font-bold text-blue-600 mt-1">
                            {summary.dipinjam}
                        </h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Sudah Dikembalikan</p>
                        <h2 className="text-2xl font-bold text-green-600 mt-1">
                            {summary.selesai}
                        </h2>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Total Denda</p>
                        <h2 className="text-2xl font-bold text-red-500 mt-1">
                            Rp {summary.totalDenda.toLocaleString("id-ID")}
                        </h2>
                    </div>

                </div>

                {/* =======================
                CHART + ACTION
            ======================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* CHART */}
                    <div className="bg-white p-5 rounded-xl shadow-sm lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-700">
                                Statistik Peminjaman (Bulan Ini)
                            </h3>
                        </div>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="namaAlat" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#3774c9ff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ACTION */}
                    <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between">

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-4">
                                Export Data
                            </h3>

                            <div className="space-y-3">

                                <button onClick={exportPeminjaman}
                                    className="w-full text-sm bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Export Peminjaman
                                </button>

                                <button onClick={exportPengembalian}
                                    className="w-full text-sm bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                                >
                                    Export Pengembalian
                                </button>

                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-6">
                            Download laporan dalam format Excel
                        </p>

                    </div>

                </div>

                {/* =======================
                TABLE
            ======================= */}
                <div className="bg-white p-5 rounded-xl shadow-sm">

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">
                            Pengembalian Terbaru
                        </h3>

                        <button
                            onClick={() => router.push("/petugas/pengembalian")}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-700">

                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th>Nama</th>
                                    <th>Tanggal</th>
                                    <th>Terlambat</th>
                                    <th>Denda</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pengembalian.map((item: any) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => router.push("/petugas/pengembalian")}
                                    >
                                        <td className="py-2">{item.peminjaman.peminjam.nama}</td>
                                        <td>
                                            {new Date(item.tanggalKembaliAktual).toLocaleDateString("id-ID")}
                                        </td>

                                        <td
                                            className={
                                                item.jumlahHariTerlambat > 0
                                                    ? "text-red-500 font-medium"
                                                    : "text-green-500"
                                            }
                                        >
                                            {item.jumlahHariTerlambat} hari
                                        </td>

                                        <td>
                                            Rp {item.totalDenda.toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>

                </div>

            </div>
        </LayoutPetugas>

    );
}