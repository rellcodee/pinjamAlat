"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function PengembalianPage() {
    const [data, setData] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [peminjaman, setPeminjaman] = useState<any[]>([]);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        id: null as number | null,
        peminjamanId: 0,
        tanggalKembaliAktual: "",
    });

    // 🔥 FETCH
    const fetchData = async () => {
        const res = await fetch("/api/pengembalian");
        const json = await res.json();
        setData(json);
    };

    const fetchPeminjaman = async () => {
        const res = await fetch("/api/peminjaman");
        const json = await res.json();

        // hanya yg belum dikembalikan
        const filtered = json.filter((p: any) => !p.pengembalian);
        setPeminjaman(filtered);
    };

    const fetchAll = async () => {
        await Promise.all([fetchData(), fetchPeminjaman()]);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // 🔥 INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: name === "peminjamanId" ? Number(value) : value,
        });
    };

    // 🔥 SUBMIT
    const handleSubmit = async () => {
        try {

            if (!form.tanggalKembaliAktual) {
                alert("Tanggal kembali wajib diisi");
                return;
            }

            if (!form.peminjamanId) {
                alert("Pilih peminjaman dulu");
                return;
            }
            const method = form.id ? "PUT" : "POST";
            console.log("form", form)

            const res = await fetch("/api/pengembalian", {
                method,
                body: JSON.stringify(form),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setShowForm(false);
            setForm({
                id: null,
                peminjamanId: 0,
                tanggalKembaliAktual: "",
            });
            fetchAll();
        } catch (err: any) {
            alert(err.message);
            console.log("error nih", err)
        }
    };

    // 🔥 DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ Ini akan rollback data. Lanjut?")) return;

        await fetch(`/api/pengembalian?id=${id}`, {
            method: "DELETE",
        });

        setSelected(null);
        fetchAll();
    };

    // 🔥 EDIT
    const handleEdit = (p: any) => {
        setShowForm(true);

        setForm({
            id: p.id,
            peminjamanId: p.peminjamanId,
            tanggalKembaliAktual: p.tanggalKembaliAktual?.split("T")[0],
        });
    };

    return (
        <AppLayout>
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-black">
                        Pengembalian
                    </h1>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {showForm ? "Tutup Form" : "+ Pengembalian"}
                    </button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div className="border p-4 rounded-xl mb-6 shadow bg-white">
                        <h2 className="font-semibold mb-3 text-gray-700">
                            {form.id ? "Edit Pengembalian" : "Tambah Pengembalian"}
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="peminjamanId" className="text-gray-700 font-semibold">Peminjaman</label>
                                {/* PEMINJAMAN */}
                                <select
                                    name="peminjamanId"
                                    value={form.peminjamanId}
                                    onChange={handleChange}
                                    className="border p-2 text-gray-700"
                                >
                                    <option value={0}>Pilih Peminjaman</option>
                                    {peminjaman.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            #{p.id} - {p.peminjam?.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="peminjamanId" className="text-gray-700 font-semibold">Tanggal Kembali</label>

                                {/* TANGGAL */}
                                <input
                                    type="date"
                                    name="tanggalKembaliAktual"
                                    value={form.tanggalKembaliAktual}
                                    onChange={handleChange}
                                    className="border p-2 text-gray-700"
                                />
                            </div>

                        </div>

                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                        >
                            {form.id ? "Update" : "Simpan"}
                        </button>
                    </div>
                )}

                {/* MASTER DETAIL */}
                <div className="flex gap-4">

                    {/* LIST */}
                    <div className="w-1/3 border rounded-xl bg-white">
                        {data.length === 0 && (
                            <p className="text-gray-500 p-4">Belum ada data Pengembalian !</p>
                        )}
                        {data.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelected(p)}
                                className={`p-3 border-b cursor-pointer ${selected?.id === p.id ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="font-semibold text-black">
                                    #{p.id}
                                </div>

                                <div className="text-sm text-gray-500">
                                    {p.peminjaman?.peminjam?.nama}
                                </div>

                                <div className="text-xs text-gray-400">
                                    Denda: Rp {p.totalDenda}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DETAIL */}
                    <div className="w-2/3">

                        {!selected && (
                            <div className="text-gray-400 text-center">
                                Pilih data pengembalian
                            </div>
                        )}

                        {selected && (
                            <div className="border rounded-xl p-4 bg-white shadow relative">

                                {/* CLOSE */}
                                <button
                                    onClick={() => setSelected(null)}
                                    className="absolute top-2 right-2"
                                >
                                    ✕
                                </button>

                                {/* ACTION */}
                                <div className="flex gap-2 mb-3 justify-end">
                                    <button
                                        onClick={() => handleEdit(selected)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(selected.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <h2 className="text-lg font-bold text-black mb-2">
                                    Pengembalian #{selected.id}
                                </h2>

                                <p className="text-sm text-gray-600">
                                    Peminjam: {selected.peminjaman?.peminjam?.nama}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Tanggal Kembali: {selected.tanggalKembaliAktual?.split("T")[0]}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Terlambat: {selected.jumlahHariTerlambat} hari
                                </p>

                                <p className="text-sm text-red-600 font-semibold">
                                    Denda: Rp {selected.totalDenda}
                                </p>

                                {/* UNIT */}
                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                        Unit Dikembalikan
                                    </h3>

                                    {selected.peminjaman?.details.map((d: any) => (
                                        <div
                                            key={d.id}
                                            className="border p-2 rounded mb-2 text-sm"
                                        >
                                            <div className="font-medium text-black">
                                                {d.alatUnit.kodeUnit}
                                            </div>

                                            <div className="text-gray-500">
                                                {d.alatUnit.alat.nama}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}