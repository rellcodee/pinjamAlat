"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function PetugasPeminjamanPage() {
    const [data, setData] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);

    const fetchData = async () => {
        const res = await fetch("/api/peminjaman");
        const json = await res.json();
        setData(json);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        await fetch("/api/peminjaman", {
            method: "PUT",
            body: JSON.stringify({ id, status }),
        });

        setSelected(null);
        fetchData();
    };

    const handleApprove = async () => {
        try {
            const res = await fetch("/api/pengembalian", {
                method: "POST",
                body: JSON.stringify({
                    peminjamanId: selected.id,
                    tanggalKembaliAktual: new Date().toISOString(),
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            alert("Pengembalian disetujui");

            setSelected(null);
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const pendingList = data.filter((p) => p.status === "pending");


    // 🔥 STATUS STYLE
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "disetujui":
                return {
                    icon: <Loader size={12} />,
                    class: "bg-yellow-100 text-yellow-600",
                    text: "Di Pinjam",
                };
            case "menunggu_pengembalian":
                return {
                    icon: <Loader size={12} />,
                    class: "bg-blue-100 text-blue-600",
                    text: "Menunggu Pengembalian",
                };
            case "selesai":
                return {
                    icon: <CheckCircle size={12} />,
                    class: "bg-green-100 text-green-600",
                    text: "Selesai",
                };
            case "ditolak":
                return {
                    icon: <XCircle size={12} />,
                    class: "bg-red-100 text-red-600",
                    text: "Di Tolak",
                };
            default:
                return {
                    icon: null,
                    class: "",
                    text: status,
                };
        }
    };

    return (
        <Layout>
            <div className="p-6 space-y-4">

                {/* 🔵 NOTIF */}
                <div className="bg-blue-500 p-5 rounded-xl text-white">
                    <h2 className="font-bold mb-3">
                        Permintaan Peminjaman
                    </h2>

                    {pendingList.length === 0 && (
                        <div className="bg-white/20 p-4 rounded text-center text-sm">
                            Tidak ada request
                        </div>
                    )}

                    <div className="space-y-2">
                        {pendingList.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white text-black flex justify-between items-center p-3 rounded"
                            >
                                <div>
                                    <div className="font-semibold">
                                        #{p.id} - {p.peminjam?.nama}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {p.details.length} unit
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateStatus(p.id, "disetujui")}
                                        className="bg-green-500 text-white px-2 py-1 rounded"
                                    >
                                        ✔
                                    </button>

                                    <button
                                        onClick={() => updateStatus(p.id, "ditolak")}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN */}
                <div className="flex gap-4">

                    {/* LIST */}
                    <div className="w-1/3 bg-white border rounded-xl">
                        {data.length === 0 && (
                            <div className="p-6 text-center text-gray-400">
                                Belum ada data
                            </div>
                        )}

                        {data.map((p) => {
                            const style = getStatusStyle(p.status);

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelected(p)}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 
                                ${selected?.id === p.id ? "bg-blue-50" : ""}`}
                                >
                                    <div className="font-semibold text-black">
                                        #{p.id}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {p.peminjam?.nama}
                                    </div>

                                    {/* 🔥 BADGE STATUS */}
                                    <div
                                        className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${style.class}`}
                                    >
                                        {style.icon}
                                        {style.text}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* DETAIL */}
                    <div className="w-2/3">
                        {!selected && (
                            <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">
                                Pilih data peminjaman
                            </div>
                        )}

                        {selected && (
                            <div className="bg-white border rounded-xl p-5 relative">

                                <button
                                    onClick={() => setSelected(null)}
                                    className="absolute top-3 right-3 text-gray-400"
                                >
                                    ✖
                                </button>

                                <h2 className="font-bold text-lg mb-2">
                                    Peminjaman #{selected.id}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {selected.peminjam?.nama}
                                </p>

                                {/* STATUS */}
                                <div className="mt-2">
                                    {(() => {
                                        const style = getStatusStyle(selected.status);

                                        return (
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded ${style.class}`}>
                                                {style.icon}
                                                <span className="text-sm font-medium">
                                                    {style.text}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* UNIT */}
                                <div className="mt-4">
                                    {selected.details.map((d: any) => (
                                        <div
                                            key={d.id}
                                            className="border p-2 rounded mb-2 text-sm"
                                        >
                                            {d.alatUnit.kodeUnit} - {d.alatUnit.alat.nama}
                                        </div>
                                    ))}
                                </div>

                                {/* AKSI */}
                                {selected.status === "pending" && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() =>
                                                updateStatus(selected.id, "disetujui")
                                            }
                                            className="bg-green-500 text-white px-3 py-1 rounded"
                                        >
                                            Setujui
                                        </button>

                                        <button
                                            onClick={() =>
                                                updateStatus(selected.id, "ditolak")
                                            }
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}