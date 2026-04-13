"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function PeminjamanPage() {
    const [data, setData] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        id: null as number | null,
        peminjamId: 0,
        tanggalPinjam: "",
        tanggalRencanaKembali: "",
        alatUnitIds: [] as number[],
    });

    const [units, setUnits] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    /* ================= FETCH ================= */
    const fetchData = async () => {
        const res = await fetch("/api/peminjaman");
        const json = await res.json();
        setData(json);
    };

    const fetchUnits = async () => {
        const res = await fetch("/api/alat-unit");
        const json = await res.json();
        setUnits(json);
    };

    const fetchUsers = async () => {
        const res = await fetch("/api/user");
        const json = await res.json();
        setUsers(json);
    };

    const fetchAll = async () => {
        await Promise.all([fetchData(), fetchUnits(), fetchUsers()]);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    /* ================= ACTION ================= */

    const updateStatus = async (id: number, status: string) => {
        await fetch("/api/peminjaman", {
            method: "PUT",
            body: JSON.stringify({ id, status }),
        });
        fetchData();
    };

    const deleteData = async (id: number) => {
        if (!confirm("Hapus peminjaman?")) return;

        await fetch(`/api/peminjaman?id=${id}`, {
            method: "DELETE",
        });

        setSelected(null);
        fetchData();
    };

    /* ================= FORM ================= */

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: name === "peminjamId" ? Number(value) : value,
        });
    };

    const toggleUnit = (id: number) => {
        if (form.alatUnitIds.includes(id)) {
            setForm({
                ...form,
                alatUnitIds: form.alatUnitIds.filter((u) => u !== id),
            });
        } else {
            setForm({
                ...form,
                alatUnitIds: [...form.alatUnitIds, id],
            });
        }
    };

    const handleSubmit = async () => {
        try {
            const method = form.id ? "PUT" : "POST";

            const res = await fetch("/api/peminjaman", {
                method,
                body: JSON.stringify(form),
            });
            console.log(`Broo ${JSON.stringify(form)}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setShowForm(false);
            setForm({
                id: null,
                peminjamId: 0,
                tanggalPinjam: "",
                tanggalRencanaKembali: "",
                alatUnitIds: [],
            });

            fetchData();
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    const handleEdit = (p: any) => {
        setShowForm(true);

        setForm({
            id: p.id,
            peminjamId: p.peminjamId,
            tanggalPinjam: p.tanggalPinjam.split("T")[0],
            tanggalRencanaKembali: p.tanggalRencanaKembali.split("T")[0],
            alatUnitIds: p.details.map((d: any) => d.alatUnitId),
        });
    };

    /* ================= UI ================= */

    return (
        <AppLayout>
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between mb-4">
                    <h1 className="text-xl font-bold text-black">
                        Kelola Peminjaman
                    </h1>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {showForm ? "Tutup Form" : "+ Tambah"}
                    </button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div className="border p-4 rounded-xl mb-6 bg-white shadow">

                        <h2 className="font-semibold mb-3 text-gray-700">
                            {form.id ? "Edit Peminjaman" : "Tambah Peminjaman"}
                        </h2>

                        <div className="grid grid-cols-1 gap-3">

                            {/* USER */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="peminjamId" className="text-gray-700 font-semibold">Peminjam</label>
                                <select
                                    name="peminjamId"
                                    value={form.peminjamId}
                                    onChange={handleChange}
                                    className="border p-2 text-gray-700"
                                >
                                    <option value={0}>Pilih Peminjam</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="tanggalPinjam" className="text-gray-700 font-semibold">Tanggal Pinjam</label>
                                <input
                                    type="date"
                                    name="tanggalPinjam"
                                    value={form.tanggalPinjam}
                                    onChange={handleChange}
                                    className="border p-2 text-gray-700"
                                    placeholder="Tanggal Pinjam"
                                />

                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="tanggalRencanaKembali" className="text-gray-700 font-semibold">Tanggal Rencana Kembali :</label>
                                <input
                                    type="date"
                                    name="tanggalRencanaKembali"
                                    value={form.tanggalRencanaKembali}
                                    onChange={handleChange}
                                    className="border p-2 text-gray-700"
                                    placeholder="Tanggal Rencana Kembali"
                                />
                            </div>


                        </div>

                        {/* UNIT PICKER */}
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Pilih Unit
                            </p>

                            <div className="max-h-40 overflow-y-auto border rounded p-2">
                                {units
                                    .filter((u) => u.status === "tersedia" || form.alatUnitIds.includes(u.id))
                                    .map((u) => (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleUnit(u.id)}
                                            className={`p-2 cursor-pointer rounded text-sm mb-1 ${form.alatUnitIds.includes(u.id)
                                                ? "bg-blue-100 text-gray-700"
                                                : "hover:bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {u.kodeUnit} - {u.alat?.nama}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {form.id ? "Update" : "Simpan"}
                        </button>
                    </div>
                )}

                {/* CONTENT */}
                <div className="flex gap-4">

                    {/* LIST */}
                    <div className="w-1/3 border rounded-xl bg-white">
                        {data.length === 0 && <p className="text-gray-500 p-4">Belum ada data !</p>}
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
                                    {p.peminjam?.nama}
                                </div>

                                <div className="text-xs text-gray-400">
                                    {p.status}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DETAIL */}
                    <div className="w-2/3">
                        {!selected && (
                            <div className="text-gray-400 text-center">
                                Pilih peminjaman
                            </div>
                        )}

                        {selected && (
                            <div className="border rounded-xl p-4 bg-white shadow relative">

                                {/* ACTION RIGHT */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(selected)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteData(selected.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>

                                <h2 className="font-bold text-lg text-black mb-2">
                                    Peminjaman #{selected.id}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {selected.peminjam?.nama}
                                </p>

                                {/* UNIT */}
                                <div className="mt-4">
                                    {selected.details.map((d: any) => (
                                        <div key={d.id} className="text-sm">
                                            {d.alatUnit.kodeUnit} - {d.alatUnit.alat.nama}
                                        </div>
                                    ))}
                                </div>

                                {/* STATUS BUTTON */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => updateStatus(selected.id, "disetujui")}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Setujui
                                    </button>

                                    <button
                                        onClick={() => updateStatus(selected.id, "ditolak")}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Tolak
                                    </button>
                                </div>

                                {/* PENGEMBALIAN */}
                                <div className="mt-4 text-sm">
                                    {selected.pengembalian
                                        ? "Sudah dikembalikan"
                                        : "Belum dikembalikan"}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}