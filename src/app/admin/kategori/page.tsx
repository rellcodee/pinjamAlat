"use client";

import { useEffect, useState } from "react";
import {
    Pencil,
    Trash2,
    Plus,
    X,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
export default function KategoriPage() {
    const [kategori, setKategori] = useState<any[]>([]);
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    // 🔄 GET
    const fetchKategori = async () => {
        const res = await fetch("/api/kategori");
        const data = await res.json();
        setKategori(data);
    };

    useEffect(() => {
        fetchKategori();
    }, []);

    // ➕ CREATE / ✏️ UPDATE
    const handleSubmit = async () => {
        try {
            const method = editId ? "PUT" : "POST";

            const res = await fetch("/api/kategori", {
                method,
                body: JSON.stringify({
                    id: editId,
                    nama,
                    deskripsi,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setNama("");
            setDeskripsi("");
            setEditId(null);
            setShowForm(false);

            fetchKategori();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // ❌ DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("Yakin hapus?")) return;

        await fetch(`/api/kategori?id=${id}`, {
            method: "DELETE",
        });

        fetchKategori();
    };

    // ✏️ EDIT
    const handleEdit = (k: any) => {
        setEditId(k.id);
        setNama(k.nama);
        setDeskripsi(k.deskripsi || "");
        setShowForm(true);
    };

    return (
        <AppLayout>
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800">Kategori</h1>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditId(null);
                            setNama("");
                            setDeskripsi("");
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? "Tutup" : "Tambah"}
                    </button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
                        <h2 className="font-semibold mb-3 text-gray-600">
                            {editId ? "Edit Kategori" : "Tambah Kategori"}
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                placeholder="Nama"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="border border-gray-300 text-gray-500 p-2 rounded"
                            />

                            <input
                                placeholder="Deskripsi"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                className="border border-gray-300 text-gray-500 p-2 rounded"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                            {editId ? "Update" : "Simpan"}
                        </button>
                    </div>
                )}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">

                        {/* HEADER */}
                        <thead className="bg-white">
                            <tr className="text-left border-b">
                                <th className="p-3 text-gray-700">Nama</th>
                                <th className="p-3 text-gray-700">Deskripsi</th>
                                <th className="p-3 text-center text-gray-700">Aksi</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody>
                            {kategori.map((k, i) => (
                                <tr
                                    key={k.id}
                                    className={`
                  ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  hover:bg-blue-50 transition
                `}
                                >
                                    <td className="p-3 font-medium text-gray-700">{k.nama}</td>
                                    <td className="p-3 text-gray-500">
                                        {k.deskripsi || "-"}
                                    </td>

                                    {/* ACTION */}
                                    <td className="p-3">
                                        <div className="flex justify-center gap-2">

                                            {/* EDIT */}
                                            <button
                                                onClick={() => handleEdit(k)}
                                                className="bg-green-500 hover:bg-green-600 p-2 rounded-lg"
                                            >
                                                <Pencil size={16} className="text-white" />
                                            </button>

                                            {/* DELETE */}
                                            <button
                                                onClick={() => handleDelete(k.id)}
                                                className="bg-red-500 hover:bg-red-600 p-2 rounded-lg"
                                            >
                                                <Trash2 size={16} className="text-white" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* EMPTY STATE */}
                    {kategori.length === 0 && (
                        <div className="p-6 text-center text-gray-400">
                            Belum ada kategori
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>

    );
}