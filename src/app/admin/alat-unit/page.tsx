"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Trash2, Save, Plus } from "lucide-react";

export default function AlatUnitPage() {
    const [units, setUnits] = useState<any[]>([]);
    const [alat, setAlat] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);

    const [form, setForm] = useState({
        id: 0,
        status: "",
        kondisi: ""
    });

    const [alatId, setAlatId] = useState(0);
    const [filterAlat, setFilterAlat] = useState(0);

    // 🔥 FETCH
    const fetchAll = async () => {
        const u = await fetch("/api/alat-unit").then(r => r.json());
        const a = await fetch("/api/alat").then(r => r.json());

        setUnits(u);
        setAlat(a);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // 🔥 CREATE
    const handleCreate = async () => {
        if (!alatId) return alert("Pilih alat");

        await fetch("/api/alat-unit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ alatId })
        });

        setAlatId(0);
        fetchAll();
    };

    // 🔥 UPDATE (FIXED TOTAL)
    const handleUpdate = async () => {
        if (!form.id) return;

        const res = await fetch("/api/alat-unit", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: form.id,
                status: form.status,
                kondisi: form.kondisi
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        // 🔥 SYNC UI TANPA REFETCH BERAT
        setUnits((prev) =>
            prev.map((u) =>
                u.id === form.id
                    ? { ...u, status: form.status, kondisi: form.kondisi }
                    : u
            )
        );

        setSelected(null);
        setForm({ id: 0, status: "", kondisi: "" });
    };

    // 🔥 DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("Hapus unit ini?")) return;

        await fetch(`/api/alat-unit?id=${id}`, {
            method: "DELETE"
        });

        setUnits((prev) => prev.filter((u) => u.id !== id));
        setSelected(null);
        setForm({ id: 0, status: "", kondisi: "" });
    };

    // 🎨 COLOR LOGIC
    const statusColor = (status: string) => {
        if (status === "tersedia")
            return "bg-green-100 text-green-600";
        if (status === "dipinjam")
            return "bg-yellow-100 text-yellow-600";
        return "bg-red-100 text-red-600";
    };

    const kondisiColor = (kondisi: string) => {
        if (kondisi === "baik")
            return "bg-green-100 text-green-600";
        if (kondisi === "rusak_ringan")
            return "bg-yellow-100 text-yellow-600";
        return "bg-red-100 text-red-600";
    };

    const filteredUnits = units.filter(
        (u) => !filterAlat || u.alatId === filterAlat
    );

    return (
        <AppLayout>
            <div className="p-6">

                <h1 className="text-xl font-bold mb-4 text-gray-800">
                    Alat Unit
                </h1>

                {/* 🔥 FILTER + CREATE */}
                <div className="flex justify-between mb-4">

                    {/* FILTER */}
                    <select
                        value={filterAlat}
                        onChange={(e) =>
                            setFilterAlat(Number(e.target.value))
                        }
                        className="bg-white p-2 rounded shadow text-gray-700"
                    >
                        <option value={0}>Semua Alat</option>
                        {alat.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.nama}
                            </option>
                        ))}
                    </select>

                    {/* CREATE */}
                    <div className="flex gap-7">
                        <select
                            value={alatId}
                            onChange={(e) =>
                                setAlatId(Number(e.target.value))
                            }
                            className="bg-white p-2 rounded shadow text-blue-800"
                        >
                            <option value={0} >Pilih Alat</option>
                            {alat.map((a) => (
                                <option key={a.id} value={a.id} className="text-blue-800">
                                    {a.nama}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleCreate}
                            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
                        >
                            Tambah
                        </button>
                    </div>
                </div>

                {/* 🔥 MASTER DETAIL */}
                <div className="flex gap-4">

                    {/* LIST */}
                    <div className="w-1/2 bg-white border rounded-xl overflow-hidden">
                        {filteredUnits.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">
                                Tidak ada unit
                            </div>
                        ) : (
                            filteredUnits.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => {
                                        setSelected(u);
                                        setForm({
                                            id: u.id,
                                            status: u.status,
                                            kondisi: u.kondisi
                                        });
                                    }}
                                    className={`p-3 border-b cursor-pointer transition ${selected?.id === u.id
                                        ? "bg-blue-50 border-l-4 border-blue-500"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="font-semibold text-gray-800">
                                        {u.kodeUnit}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {u.alat?.nama}
                                    </div>

                                    <div className="flex gap-2 mt-1 text-xs">
                                        <span
                                            className={`px-2 py-1 rounded ${statusColor(
                                                u.status
                                            )}`}
                                        >
                                            {u.status}
                                        </span>

                                        <span
                                            className={`px-2 py-1 rounded ${kondisiColor(
                                                u.kondisi
                                            )}`}
                                        >
                                            {u.kondisi}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* DETAIL */}
                    <div className="w-1/2">
                        {selected ? (
                            <div className="bg-white p-4 border rounded-xl shadow relative">

                                {/* CLOSE */}
                                <button
                                    onClick={() => {
                                        setSelected(null);
                                        setForm({
                                            id: 0,
                                            status: "",
                                            kondisi: ""
                                        });
                                    }}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>

                                <h2 className="font-bold text-lg text-gray-800 mb-1">
                                    {selected.kodeUnit}
                                </h2>

                                <p className="text-sm text-gray-500 mb-3 font-bold">
                                    {selected.alat?.nama}
                                </p>

                                {/* STATUS */}
                                <div className="mb-2">
                                    <label className="text-sm text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.value
                                            })
                                        }
                                        className="w-full p-2 mt-1 bg-gray-100 text-gray-600 rounded"
                                    >
                                        <option value="tersedia">
                                            Tersedia
                                        </option>
                                        <option value="dipinjam">
                                            Dipinjam
                                        </option>
                                        <option value="tidak_tersedia">
                                            Tidak tersedia
                                        </option>
                                    </select>
                                </div>

                                {/* KONDISI */}
                                <div>
                                    <label className="text-sm text-gray-700">
                                        Kondisi
                                    </label>
                                    <select
                                        value={form.kondisi}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                kondisi: e.target.value
                                            })
                                        }
                                        className="w-full p-2 mt-1 bg-gray-100 text-gray-600 rounded"
                                    >
                                        <option value="baik">Baik</option>
                                        <option value="rusak_ringan">
                                            Rusak ringan
                                        </option>
                                        <option value="rusak_berat">
                                            Rusak berat
                                        </option>
                                    </select>
                                </div>

                                {/* ACTION */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={handleUpdate}
                                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                                    >
                                        <Save size={18} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(form.id)
                                        }
                                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Pilih unit untuk melihat detail
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}