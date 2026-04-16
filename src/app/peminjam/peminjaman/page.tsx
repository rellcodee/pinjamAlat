"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";

export default function RiwayatPage() {
    const [data, setData] = useState<any[]>([]);

    const fetchData = async () => {
        const res = await fetch("/api/peminjaman/me");
        const json = await res.json();
        setData(json);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-gray-100 text-gray-600";
            case "disetujui":
                return "bg-yellow-100 text-yellow-600";
            case "menunggu_pengembalian":
                return "bg-blue-100 text-blue-600";
            case "selesai":
                return "bg-green-100 text-green-600";
            case "ditolak":
                return "bg-red-100 text-red-600";
            default:
                return "";
        }
    };

    return (
        <Layout>
            <div className="p-4 space-y-4">

                <h1 className="text-lg font-bold text-gray-700">
                    Riwayat Peminjaman
                </h1>

                {data.length === 0 && (
                    <div className="text-center text-gray-400">
                        Belum ada riwayat
                    </div>
                )}

                {data.map((p) => (
                    <div
                        key={p.id}
                        className="bg-white p-4 rounded-xl shadow border space-y-3"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <div className="font-semibold text-gray-800">
                                Peminjaman #{p.id}
                            </div>

                            <div
                                className={`px-2 py-1 rounded text-xs ${getStatusStyle(p.status)}`}
                            >
                                {p.status}
                            </div>
                        </div>

                        {/* TANGGAL */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <div>
                                Pinjam: {formatDate(p.tanggalPinjam)}
                            </div>
                            <div>
                                Target: {formatDate(p.tanggalRencanaKembali)}
                            </div>
                        </div>

                        {/* LIST ALAT */}
                        <div className="space-y-1">
                            {p.details.map((d: any) => (
                                <div
                                    key={d.id}
                                    className="text-sm text-gray-700"
                                >
                                    • {d.alatUnit.alat.nama}
                                </div>
                            ))}
                        </div>

                        {/* PENGEMBALIAN */}
                        {p.pengembalian && (
                            <div className="text-xs text-green-600 space-y-1">
                                <div>
                                    Dikembalikan: {formatDate(p.pengembalian.tanggalKembaliAktual)}
                                </div>
                                <div>
                                    Denda:{" "}
                                    {p.pengembalian.totalDenda > 0
                                        ? `Rp ${p.pengembalian.totalDenda}`
                                        : "-"}
                                </div>
                            </div>
                        )}
                        {/* ACTION */}
                        <div className="mt-3 flex gap-2">

                            {/* AJUKAN */}
                            {p.status === "disetujui" && (
                                <button
                                    onClick={async () => {
                                        const res = await fetch("/api/peminjaman/request-pengembalian", {
                                            method: "POST",
                                            body: JSON.stringify({ id: p.id }),
                                        });

                                        const json = await res.json();
                                        if (!res.ok) return alert(json.error);

                                        alert("Pengembalian diajukan");
                                        location.reload();
                                    }}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                                >
                                    Ajukan Pengembalian
                                </button>
                            )}

                            {/* BATAL */}
                            {p.status === "menunggu_pengembalian" && (
                                <button
                                    onClick={async () => {
                                        const res = await fetch("/api/peminjaman/request-pengembalian", {
                                            method: "PUT",
                                            body: JSON.stringify({ id: p.id }),
                                        });

                                        const json = await res.json();
                                        if (!res.ok) return alert(json.error);

                                        alert("Dibatalkan");
                                        location.reload();
                                    }}
                                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                                >
                                    Batal Pengembalian
                                </button>
                            )}

                        </div>
                    </div>
                ))}

            </div>
        </Layout>
    );
}