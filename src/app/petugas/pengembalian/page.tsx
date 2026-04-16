"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPetugas";
import { CheckCircle, Loader } from "lucide-react";

export default function PetugasPengembalianPage() {
    const [data, setData] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);

    const fetchData = async () => {
        const res = await fetch("/api/peminjaman");
        const json = await res.json();

        const filtered = json.filter(
            (p: any) =>
                p.status === "menunggu_pengembalian" ||
                p.status === "selesai"
        );

        setData(filtered);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔥 READY RETURN
    const readyReturn = data.filter(
        (p) => p.status === "menunggu_pengembalian"
    );

    // 🔥 FORMAT DATE
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // 🔥 FORMAT RUPIAH
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(num);
    };

    // 🔥 DURASI
    const getDurasi = (p: any) => {
        const start = new Date(p.tanggalPinjam);
        const end = new Date(p.tanggalRencanaKembali);

        return Math.ceil(
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    };

    // 🔥 TELAT
    const getTelat = (p: any) => {
        const rencana = new Date(p.tanggalRencanaKembali);

        const compareDate = p.pengembalian
            ? new Date(p.pengembalian.tanggalKembaliAktual)
            : new Date();

        let telat = Math.ceil(
            (compareDate.getTime() - rencana.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (telat < 0) telat = 0;

        return telat;
    };

    // 🔥 STATUS STYLE (ASLI LU)
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "disetujui":
                return {
                    icon: <Loader size={12} />,
                    class: "bg-yellow-100 text-yellow-600",
                    text: "Dipinjam",
                };

            case "menunggu_pengembalian":
                return {
                    icon: <Loader size={12} />,
                    class: "bg-blue-100 text-blue-600",
                    text: "Menunggu",
                };

            case "selesai":
                return {
                    icon: <CheckCircle size={12} />,
                    class: "bg-green-100 text-green-600",
                    text: "Selesai",
                };

            default:
                return {
                    icon: null,
                    class: "",
                    text: status,
                };
        }
    };

    // 🔥 APPROVE (AUTO)
    const handleApprove = async (p: any) => {
        if (!confirm("Setujui pengembalian ini?")) return;

        try {
            const res = await fetch("/api/pengembalian", {
                method: "POST",
                body: JSON.stringify({
                    peminjamanId: p.id,
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

    return (
        <Layout>
            <div className="p-4 space-y-4">

                {/* 🔵 REQUEST */}
                <div className="bg-blue-500 p-4 rounded-xl text-white shadow">
                    <h2 className="font-bold mb-3">
                        🔄 Request Pengembalian
                    </h2>

                    {readyReturn.length === 0 && (
                        <div className="bg-white/20 p-4 rounded text-sm text-center">
                            Tidak ada request
                        </div>
                    )}

                    <div className="space-y-2">
                        {readyReturn.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white text-black p-3 rounded flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-semibold">
                                        #{p.id} - {p.peminjam?.nama}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        Target: {formatDate(p.tanggalRencanaKembali)}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelected(p)}
                                        className="bg-gray-200 px-3 py-1 rounded text-sm"
                                    >
                                        Detail
                                    </button>

                                    <button
                                        onClick={() => handleApprove(p)}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN */}
                <div className="flex gap-4">

                    {/* LIST */}
                    <div className="w-1/3 bg-white rounded-xl border overflow-hidden">
                        {data.map((p) => {
                            const style = getStatusStyle(p.status);

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelected(p)}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selected?.id === p.id ? "bg-blue-50" : ""}`}
                                >
                                    <div className="font-semibold text-black">
                                        #{p.id}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {p.peminjam?.nama}
                                    </div>

                                    <div className="text-xs text-gray-400">
                                        {p.status}
                                    </div>

                                    <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${style.class}`}>
                                        {style.icon}
                                        {style.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DETAIL */}
                    <div className="w-2/3">
                        {!selected && (
                            <div className="p-10 text-center text-gray-400 bg-white rounded-xl border">
                                Pilih data untuk melihat detail
                            </div>
                        )}

                        {selected && (
                            <div className="bg-white border rounded-xl p-5 shadow relative">

                                <button
                                    onClick={() => setSelected(null)}
                                    className="absolute top-3 right-3 text-gray-400"
                                >
                                    ✖
                                </button>

                                <h2 className="font-bold text-lg text-black mb-2">
                                    Pengembalian #{selected.id}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {selected.peminjam?.nama}
                                </p>

                                {/* 🔥 DETAIL INFO */}
                                <div className="mt-4 text-sm text-gray-700 space-y-1">

                                    <div>
                                        Pinjam: {formatDate(selected.tanggalPinjam)}
                                    </div>

                                    <div>
                                        Target: {formatDate(selected.tanggalRencanaKembali)}{" "}
                                        ({getDurasi(selected)} Hari)
                                    </div>

                                    <div>
                                        Telat: {getTelat(selected)} hari
                                    </div>

                                    <div>
                                        Denda:{" "}
                                        {selected.pengembalian
                                            ? formatRupiah(selected.pengembalian.totalDenda)
                                            : "-"}
                                    </div>
                                </div>

                                {/* STATUS */}
                                <div className="mt-3">
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
                                        <div key={d.id} className="border p-2 rounded mb-2 text-sm">
                                            {d.alatUnit.kodeUnit} - {d.alatUnit.alat.nama}
                                        </div>
                                    ))}
                                </div>

                                {/* 🔥 APPROVE DI DETAIL */}
                                {selected.status === "menunggu_pengembalian" && !selected.pengembalian && (
                                    <button
                                        onClick={() => handleApprove(selected)}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
                                    >
                                        Setujui Pengembalian
                                    </button>
                                )}

                                {/* DONE */}
                                {selected.pengembalian && (
                                    <div className="mt-4 text-green-600 text-sm flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        Sudah dikembalikan |{" "}
                                        <span className="text-red-500">
                                            {formatRupiah(selected.pengembalian.totalDenda)}
                                        </span>
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