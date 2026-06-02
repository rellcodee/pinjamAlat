"use client";

import { useEffect, useState, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

function UserFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!idParam);
    const [form, setForm] = useState({
        id: null as number | null,
        nama: "",
        username: "",
        password: "",
        role: "peminjam",
        noTelp: "",
        kelas: "",
    });

    useEffect(() => {
        if (idParam) {
            const fetchUser = async () => {
                try {
                    const res = await fetch(`/api/user?id=${idParam}`);
                    if (!res.ok) throw new Error("Gagal mengambil data user");
                    const data = await res.json();

                    setForm({
                        id: data.id,
                        nama: data.nama,
                        username: data.username,
                        password: "", // Jangan tampilkan password lama
                        role: data.role,
                        noTelp: data.noTelp,
                        kelas: data.kelas,
                    });
                } catch (error) {
                    console.error(error);
                    alert("User tidak ditemukan.");
                    router.push("/admin/user");
                } finally {
                    setFetching(false);
                }
            };
            fetchUser();
        }
    }, [idParam, router]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = form.id ? "PUT" : "POST";

            if (!form.id && !form.password) {
                throw new Error("Password wajib diisi untuk user baru");
            }

            const res = await fetch("/api/user", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

            router.push("/admin/user");
            router.refresh(); // memicu refresh data di server components jika ada
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                        required
                        name="nama"
                        type="text"
                        placeholder="Your Name"
                        value={form.nama}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                        required
                        name="username"
                        type="text"
                        placeholder="JhonDoe"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {form.id && <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role Akses</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    >
                        <option value="petugas">Petugas (Officer)</option>
                        <option value="peminjam">Peminjam (Borrower)</option>
                        <option value="admin">Admin (System Admin)</option>
                    </select>
                </div>

                {form.role === "petugas" && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                            <input
                                name="noTelp"
                                type="text"
                                placeholder="Your Phone Number"
                                value={form.noTelp ?? ""}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                )}

                {form.role === "peminjam" && (
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                            <input
                                name="noTelp"
                                type="text"
                                placeholder="Your Phone Number"
                                value={form.noTelp ?? ""}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                            <input
                                name="kelas"
                                type="text"
                                placeholder="X IPA 1"
                                value={form.kelas ?? ""}
                                onChange={handleChange}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>
                )}




            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <Save size={18} />
                    )}
                    {form.id ? "Simpan Perubahan" : "Simpan User"}
                </button>
            </div>
        </form>
    );
}

export default function UserFormPage() {
    return (
        <AppLayout>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="mb-8 max-w-3xl mx-auto">
                    <Link
                        href="/admin/user"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft size={16} /> Kembali ke Daftar User
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        <Suspense fallback="Loading...">
                            <FormTitle />
                        </Suspense>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Lengkapi informasi user di bawah ini</p>
                </div>

                <Suspense fallback={
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                }>
                    <UserFormContent />
                </Suspense>
            </div>
        </AppLayout>
    );
}

function FormTitle() {
    const searchParams = useSearchParams();
    return searchParams.get("id") ? "Edit User" : "Tambah User Baru";
}