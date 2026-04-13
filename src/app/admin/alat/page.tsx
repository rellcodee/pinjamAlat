"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import {
    Pencil,
    Trash2,
    Wrench
} from "lucide-react";

export default function AlatPage() {
    const [alat, setAlat] = useState<any[]>([]);
    const [kategori, setKategori] = useState<any[]>([]);

    const [selectedAlat, setSelectedAlat] = useState<any | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        id: null as number | null,
        nama: "",
        deskripsi: "",
        kategoriId: 0,
        image: "",
    });

    // 🔥 FETCH
    const fetchAlat = async () => {
        const res = await fetch("/api/alat");
        const data = await res.json();
        setAlat(data);
    };

    const fetchKategori = async () => {
        const res = await fetch("/api/kategori");
        const data = await res.json();
        setKategori(data);
    };

    const fetchAll = async () => {
        await Promise.all([fetchAlat(), fetchKategori()]);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // auto select pertama
    useEffect(() => {
        if (alat.length > 0 && !selectedAlat) {
            setSelectedAlat(alat[0]);
        }
    }, [alat]);

    // INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]:
                name === "stok" || name === "kategoriId"
                    ? Number(value)
                    : value,
        });
    };

    // SUBMIT
    const handleSubmit = async () => {
        try {
            const method = form.id ? "PUT" : "POST";

            const res = await fetch("/api/alat", {
                method,
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (form.id) {
                setSelectedAlat(data);
            }
            setForm({
                id: null,
                nama: "",
                deskripsi: "",
                kategoriId: 0,
                image: "",
            });

            setShowForm(false);
            fetchAlat();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("Hapus alat ini?")) return;

        await fetch(`/api/alat?id=${id}`, {
            method: "DELETE",
        });

        setSelectedAlat(null);
        fetchAlat();
    };

    // EDIT
    const handleEdit = (a: any) => {
        setShowForm(true);

        setForm({
            id: a.id,
            nama: a.nama,
            deskripsi: a.deskripsi || "",
            kategoriId: a.kategoriId,
            image: a.image || "",
        });
    };
    const availableUnits =
        selectedAlat?.units?.filter((u: any) => u.status === "tersedia").length || 0;
    return (
        <AppLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold mb-4 text-black">Kelola Alat</h1>
                    <div className="flex gap-6">
                        <Link href={"/admin/alat-unit"} className="bg-blue-500 flex gap-2 text-white px-4 py-2 mb-4 rounded "><Wrench size={20} /> Units</Link>
                        {/* BUTTON */}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 mb-4 rounded "
                        >
                            {showForm ? "Tutup Form" : "+"}
                        </button>
                    </div>

                </div>


                {/* FORM */}
                {showForm && (
                    <div className="border p-4 rounded-xl mb-6 shadow">
                        <h2 className="font-semibold mb-2 text-gray-700">
                            {form.id ? "Edit Alat" : "Tambah Alat"}
                        </h2>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                name="nama"
                                placeholder="Nama Alat"
                                value={form.nama}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            />

                            <select
                                name="kategoriId"
                                value={form.kategoriId}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            >
                                <option value={0} className="text-gray-600">Pilih Kategori</option>

                                {kategori.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama}
                                    </option>
                                ))}
                            </select>

                            <input
                                name="image"
                                placeholder="URL Gambar"
                                value={form.image}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 col-span-2 text-gray-600"
                            />

                            <textarea
                                name="deskripsi"
                                placeholder="Deskripsi"
                                value={form.deskripsi}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 col-span-2 text-gray-600"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {form.id ? "Update" : "Tambah"}
                        </button>
                    </div>
                )}

                {/* 🔥 MASTER DETAIL */}
                <div className="flex gap-4">
                    {/* LIST */}
                    <div className="w-1/1 border bg-white rounded-xl overflow-hidden">
                        {[...alat]
                            .sort((a, b) => a.nama.localeCompare(b.nama))
                            .map((a) => (
                                <div
                                    key={a.id}
                                    onClick={() => setSelectedAlat(a)}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${selectedAlat?.id === a.id ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <div className="font-semibold text-gray-900">{a.nama}</div>
                                    <div className="text-sm text-gray-500">
                                        {a.kategori?.nama || "-"}
                                    </div>
                                </div>
                            ))}
                        {alat.length === 0 && (
                            <div className="p-6 text-center text-gray-400">
                                Belum ada alat
                            </div>
                        )}
                    </div>

                    {/* DETAIL */}
                    <div className="w-2/3">
                        {selectedAlat ? (
                            <div className="border rounded-xl p-4 shadow relative bg-white">
                                {/* CLOSE */}
                                <button
                                    onClick={() => setSelectedAlat(null)}
                                    className="absolute top-2 right-2"
                                >
                                    ✕
                                </button>
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={
                                            // selectedAlat.image ||
                                            "/noalat.jpg"}
                                        alt="alat"
                                        className="w-48 h-48 object-cover rounded"
                                    />
                                </div>


                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(selectedAlat)}
                                        className="bg-blue-500 text-white px-3 py-3 rounded "
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(selectedAlat.id)}
                                        className="bg-red-500 text-white px-3 py-3 rounded"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <h2 className="text-lg font-bold text-black">
                                    {selectedAlat.nama}
                                </h2>

                                <p className="text-gray-500">
                                    {selectedAlat.kategori?.nama || "-"}
                                </p>

                                <p className="mt-2 text-black text-sm">
                                    Stok: <b>{availableUnits}</b>
                                </p>

                                <p className="mt-2 text-sm text-gray-600">
                                    {selectedAlat.deskripsi || "-"}
                                </p>

                                <div className="mt-4">
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                        Daftar Unit
                                    </h3>

                                    <div className="max-h-40 overflow-y-auto border rounded">
                                        {selectedAlat.units.length === 0 && (
                                            <div className="p-2 text-gray-400 text-sm font-bold">
                                                -
                                            </div>
                                        )}

                                        {selectedAlat.units.map((u: any) => (
                                            <Link href={`/admin/alat-unit`}
                                                key={u.id}
                                                className="flex justify-between items-center px-3 py-2 border-b text-sm cursor-pointer hover:bg-gray-100"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {u.kodeUnit}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {u.kondisi}
                                                    </div>
                                                </div>

                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${u.status === "tersedia"
                                                        ? "bg-green-100 text-green-600"
                                                        : u.status === "dipinjam"
                                                            ? "bg-yellow-100 text-yellow-600"
                                                            : "bg-red-100 text-red-600"
                                                        }`}
                                                >
                                                    {u.status}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="text-gray-400 text-center w-full">
                                Pilih alat untuk melihat detail
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>

    );
}