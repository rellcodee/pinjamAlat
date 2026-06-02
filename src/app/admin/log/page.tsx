"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Activity, Search, Calendar, ChevronLeft, ChevronRight, User, FilterX } from "lucide-react";

export default function LogAktivitasPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [date, setDate] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                role,
                date
            });

            const res = await fetch(`/api/log?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Gagal mengambil log");

            const data = await res.json();
            setLogs(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchLogs();
        }, 500);

        return () => clearTimeout(timeout);
    }, [page, search, role, date]);

    const resetFilters = () => {
        setSearch("");
        setRole("");
        setDate("");
        setPage(1);
    };

    return (
        <AppLayout>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Log Aktivitas</h1>
                            <p className="text-gray-500 text-sm mt-1">Pantau seluruh tindakan yang dilakukan oleh pengguna pada sistem.</p>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari keterangan aktivitas..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent transition-all outline-none text-sm"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-3 flex-wrap md:flex-nowrap">
                        <div className="relative flex-1 md:w-48">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                value={role}
                                onChange={(e) => { setRole(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="">Semua Role</option>
                                <option value="admin">Admin</option>
                                <option value="petugas">Petugas</option>
                                <option value="peminjam">Peminjam</option>
                            </select>
                        </div>

                        <div className="relative flex-1 md:w-48">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none text-sm cursor-pointer"
                            />
                        </div>

                        {(search || role || date) && (
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl transition-all shadow-sm flex items-center justify-center"
                                title="Reset Filter"
                            >
                                <FilterX size={18} />
                            </button>
                        )}
                    </div>

                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6 w-56 whitespace-nowrap">Waktu</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Aksi</th>
                                    <th className="p-4 min-w-[200px]">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            <Activity size={48} className="mx-auto mb-3 text-gray-300" />
                                            Tidak ada data log yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 pl-6 text-gray-500">
                                                {new Date(log.waktu).toLocaleString("id-ID", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                            <td className="p-4 font-medium text-gray-800">
                                                <div className="flex flex-col">
                                                    <span>{log.user?.nama || "Unknown"}</span>
                                                    <span className="text-xs text-gray-400 font-normal">@{log.user?.username}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${log.user?.role === "admin" ? "bg-red-50 text-red-600" :
                                                        log.user?.role === "petugas" ? "bg-green-50 text-green-600" :
                                                            "bg-blue-50 text-blue-600"
                                                    }`}>
                                                    {log.user?.role?.toUpperCase() || "-"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-700 font-medium">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs border border-gray-200">
                                                    {log.aksi}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500">{log.keterangan || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                        <span className="text-sm text-gray-500">
                            Halaman <span className="font-medium text-gray-800">{page}</span> dari <span className="font-medium text-gray-800">{totalPages}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                    .map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                            </div>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
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