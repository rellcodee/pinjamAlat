"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Search, ChevronLeft, ChevronRight, UserPlus, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all"); // 🌟 State baru untuk filter role
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const usersPerPage = 10;

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Gagal mengambil data user");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 🌟 Filter, Sort, Paginate (Logika diperbarui)
    const filteredUsers = users
        .filter((u) => u.role !== "admin") // Tetap sembunyikan admin utama
        .filter((u) => {
            // Filter berdasarkan pilihan Role dropdown
            if (roleFilter === "all") return true;
            return u.role === roleFilter;
        })
        .filter((u) => {
            // Filter berdasarkan kolom pencarian nama/username
            const searchLower = searchQuery.toLowerCase();
            return (
                u.nama.toLowerCase().includes(searchLower) ||
                u.username.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => a.nama.localeCompare(b.nama));

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    return (
        <AppLayout>
            <div className="p-6 max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen User</h1>
                        <p className="text-gray-500 text-sm mt-1">Daftar semua pengguna dalam sistem (Petugas & Peminjam)</p>
                    </div>

                    {/* BARIS SELECTION & SEARCH */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                        {/* 🌟 FILTER DROPDOWN ROLE */}
                        <div className="relative w-full sm:w-44">
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setCurrentPage(1); // Reset halaman ke 1 saat filter berubah
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 appearance-none cursor-pointer font-medium"
                            >
                                <option value="all">Semua Role</option>
                                <option value="petugas">Petugas</option>
                                <option value="peminjam">Peminjam</option>
                            </select>
                            <Filter className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {/* INPUT SEARCH */}
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Cari nama / username..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset halaman ke 1 saat mengetik
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        {/* BUTTON TAMBAH */}
                        <Link
                            href="/admin/user/form"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium whitespace-nowrap text-sm w-full sm:w-auto"
                        >
                            <UserPlus size={18} />
                            Tambah
                        </Link>
                    </div>
                </div>

                {/* USER LIST */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : currentUsers.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {currentUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => router.push(`/admin/user/${user.id}`)}
                                    className="p-4 flex items-center justify-between hover:bg-gray-50/80 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                            <img
                                                src={user.role === "peminjam" ? "/nerd.png" : "/kumis.png"}
                                                alt={user.nama}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.src = defaultAvatar }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{user.nama}</h3>
                                            <p className="text-gray-500 text-sm">@{user.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'petugas'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">Tidak ada user ditemukan</h3>
                            <p className="text-gray-500 text-sm">Coba sesuaikan kata kunci pencarian atau filter role Anda.</p>
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <p className="text-sm text-gray-500 rounded-lg px-2 py-1 bg-white">
                            Menampilkan User <span className="font-medium text-gray-900">{startIndex + 1}</span> - <span className="font-medium text-gray-900">{Math.min(startIndex + usersPerPage, filteredUsers.length)}</span>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-medium text-gray-700 px-2">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}