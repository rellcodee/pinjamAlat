"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        id: null as number | null,
        nama: "",
        username: "",
        password: "",
        role: "peminjam",
    });

    // 🔥 DEFAULT AVATAR
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // 🔄 FETCH
    const fetchUsers = async () => {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUsers(data);
    };

    const fetchAll = async () => {
        setLoading(true);
        await fetchUsers();
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // auto select pertama
    useEffect(() => {
        if (users.length > 0 && !selectedUser) {
            setSelectedUser(users[0]);
        }
    }, [users]);

    // INPUT
    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    // SUBMIT
    const handleSubmit = async () => {
        try {
            const method = form.id ? "PUT" : "POST";

            const res = await fetch("/api/user", {
                method,
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setForm({
                id: null,
                nama: "",
                username: "",
                password: "",
                role: "peminjam",
            });

            setShowForm(false);
            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // DELETE
    const handleDelete = async (id: number) => {
        if (!confirm("Hapus user ini?")) return;

        await fetch(`/api/users?id=${id}`, {
            method: "DELETE",
        });

        setSelectedUser(null);
        fetchUsers();
    };

    // EDIT
    const handleEdit = (u: any) => {
        setShowForm(true);

        setForm({
            id: u.id,
            nama: u.nama,
            username: u.username,
            password: "",
            role: u.role,
        });
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <AppLayout>
            <div className="p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-black">Users</h1>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        {showForm ? "Tutup Form" : "Tambah User"}
                    </button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div className="border p-4 rounded-xl mb-6 shadow bg-white">
                        <h2 className="font-semibold mb-2 text-gray-700">
                            {form.id ? "Edit User" : "Tambah User"}
                        </h2>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                name="nama"
                                placeholder="Nama"
                                value={form.nama}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            />

                            <input
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            />

                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            />

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="border border-gray-300 p-2 text-gray-600"
                            >
                                <option value="admin">Admin</option>
                                <option value="petugas">Petugas</option>
                                <option value="peminjam">Peminjam</option>
                            </select>
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

                    {/* TABLE */}
                    <div className={`${selectedUser ? "w-1/3" : "w-full"} border bg-white rounded-xl overflow-hidden`}>
                        <table className="w-full text-sm">
                            <thead className="bg-white border-b">
                                <tr>
                                    <th className="p-3 text-left">Nama</th>
                                    <th className="p-3 text-left">Username</th>
                                    <th className="p-3 text-left">Role</th>
                                </tr>
                            </thead>

                            <tbody>
                                {[...users]
                                    .sort((a, b) => a.nama.localeCompare(b.nama))
                                    .map((u, i) => (
                                        <tr
                                            key={u.id}
                                            onClick={() => setSelectedUser(u)}
                                            className={`
                        cursor-pointer
                        ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        hover:bg-blue-50
                        ${selectedUser?.id === u.id ? "bg-blue-50" : ""}
                      `}
                                        >
                                            <td className="p-3 font-medium text-gray-900">{u.nama}</td>
                                            <td className="p-3 text-gray-500">{u.username}</td>
                                            <td className="p-3 capitalize">{u.role}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <div className="p-6 text-center text-gray-400">
                                Belum ada user
                            </div>
                        )}
                    </div>

                    {/* DETAIL */}
                    <div className={`${selectedUser ? "w-2/3" : "hidden md:flex w-2/3"} items-center justify-center`}>
                        {selectedUser ? (
                            <div className="border rounded-xl p-4 shadow relative bg-white w-full">

                                {/* CLOSE */}
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute top-2 right-2"
                                >
                                    ✕
                                </button>

                                {/* AVATAR */}
                                <img
                                    src={defaultAvatar}
                                    className="w-full h-48 object-contain rounded mb-3"
                                />

                                {/* ACTION */}
                                <div className="flex gap-2 mb-3">
                                    <button
                                        onClick={() => handleEdit(selectedUser)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(selectedUser.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Hapus
                                    </button>
                                </div>

                                {/* INFO */}
                                <h2 className="text-lg font-bold text-black">
                                    {selectedUser.nama}
                                </h2>

                                <p className="text-gray-500">
                                    @{selectedUser.username}
                                </p>

                                <p className="mt-2 text-sm text-black">
                                    Role: <b className="capitalize">{selectedUser.role}</b>
                                </p>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center w-full">
                                Pilih user untuk melihat detail
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}