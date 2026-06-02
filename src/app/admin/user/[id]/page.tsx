"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, User as UserIcon, Phone, GraduationCap } from "lucide-react";

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/user?id=${id}`);
                if (!res.ok) throw new Error("Gagal mengambil data user");
                const data = await res.json();
                setUser(data);
            } catch (error) {
                console.error(error);
                alert("User tidak ditemukan.");
                router.push("/admin/user");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id, router]);

    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/user?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Gagal menghapus user");
            }

            alert("User berhasil dihapus");
            router.push("/admin/user");
            router.refresh();
        } catch (error: any) {
            alert(error.message);
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </AppLayout>
        );
    }

    if (!user) return null;

    // Tentukan Avatar berdasarkan Role
    let avatarSrc = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Default
    if (user.role === "peminjam") {
        avatarSrc = "/nerd.png";
    } else if (user.role === "petugas") {
        avatarSrc = "/kumis.png";
    }

    return (
        <AppLayout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* BACK & HEADER */}
                <div className="mb-8 flex justify-between items-center">
                    <Link
                        href="/admin/user"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} /> Kembali
                    </Link>

                    <div className="flex gap-3">
                        <Link
                            href={`/admin/user/form?id=${user.id}`}
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium text-sm"
                        >
                            <Pencil size={16} />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium text-sm disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {isDeleting ? "Menghapus..." : "Hapus"}
                        </button>
                    </div>
                </div>

                {/* PROFILE CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">

                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    </div>

                    {/* Profile Information */}
                    <div className="px-8 pb-10 relative">

                        {/* Avatar */}
                        <div className="absolute -top-16 left-8 bg-white p-2 rounded-full shadow-md">
                            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 bg-gray-50 relative">
                                <img
                                    src={avatarSrc}
                                    alt={user.nama}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                                />
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="pt-16 max-w-2xl">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.nama}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-blue-600 font-medium">@{user.username}</p>
                                <span className="text-gray-300">•</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${user.role === 'petugas'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : user.role === 'admin'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="mt-5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-50 p-2 rounded-full shadow-sm border border-gray-100">
                                        <Phone size={16} color="blue" />
                                    </div>
                                    <p className="text-blue-600 font-medium text-sm ml-2">: {user.noTelp ? user.noTelp : "Not Available"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-50 p-2 rounded-full shadow-sm border border-gray-100">
                                        <GraduationCap size={16} color="blue" />
                                    </div>
                                    <p className="text-blue-600 font-medium text-sm ml-2">: {user.kelas ? user.kelas : "Not Available"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Extra Details Data Card */}
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                            <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100">
                                    <UserIcon size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">ID Pengguna</p>
                                    <p className="font-semibold text-gray-800">{user.id}</p>
                                </div>
                            </div>

                            {/* Additional placeholders for realistic look */}
                            <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Status Akun</p>
                                    <p className="font-semibold text-green-600">Aktif</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}