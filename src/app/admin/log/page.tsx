"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
    Users,
    Boxes,
    Wrench,
    Clock,
    ArrowRight,
    PlusCircle,
    Pencil,
    Trash2,
    Activity
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [users, setUsers] = useState(0);
    const [kategori, setKategori] = useState(0);
    const [alat, setAlat] = useState(0);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [uRes, kRes, aRes, lRes] = await Promise.all([
                fetch("/api/user", { credentials: "include" }),
                fetch("/api/kategori", { credentials: "include" }),
                fetch("/api/alat", { credentials: "include" }),
                fetch("/api/log", { credentials: "include" }),
            ]);

            const u = await uRes.json();
            const k = await kRes.json();
            const a = await aRes.json();
            const l = await lRes.json();

            setUsers(Array.isArray(u) ? u.length : 0);
            setKategori(Array.isArray(k) ? k.length : 0);
            setAlat(Array.isArray(a) ? a.length : 0);
            setLogs(Array.isArray(l) ? l.slice(0, 3) : []);

        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatTanggal = (date: string) => {
        return new Date(date).toLocaleString("id-ID");
    };

    // 🔥 STYLE AKSI
    const getAksiStyle = (aksi: string) => {
        if (aksi.includes("CREATE")) {
            return {
                icon: <PlusCircle size={12} />,
                class: "bg-green-100 text-green-600"
            };
        }

        if (aksi.includes("UPDATE")) {
            return {
                icon: <Pencil size={12} />,
                class: "bg-yellow-100 text-yellow-600"
            };
        }

        if (aksi.includes("DELETE")) {
            return {
                icon: <Trash2 size={12} />,
                class: "bg-red-100 text-red-600"
            };
        }

        return {
            icon: <Activity size={12} />,
            class: "bg-gray-100 text-gray-600"
        };
    };

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 overflow-hidden">

                {/* 🔥 WELCOME */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-2 flex flex-col md:flex-row items-center gap-6">

                    <img
                        src="/dashboard.png"
                        className="h-32 md:h-40 object-contain"
                    />

                    <div className="text-center md:text-left">
                        <h1 className="text-lg md:text-2xl font-bold">
                            Welcome Back, Admin 👋
                        </h1>
                        <p className="text-sm opacity-90">
                            Kelola sistem peminjaman alat dengan mudah
                        </p>
                    </div>

                </div>

                {/* 🔥 STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div className="bg-green-100 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-green-200 p-3 rounded-lg">
                            <Users className="text-green-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Users</p>
                            <h2 className="text-xl font-bold text-gray-800">{users}</h2>
                        </div>
                    </div>

                    <div className="bg-yellow-100 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-yellow-200 p-3 rounded-lg">
                            <Boxes className="text-yellow-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Kategori</p>
                            <h2 className="text-xl font-bold text-gray-800">{kategori}</h2>
                        </div>
                    </div>

                    <div className="bg-blue-100 p-4 rounded-xl flex items-center gap-4">
                        <div className="bg-blue-200 p-3 rounded-lg">
                            <Wrench className="text-blue-700" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Alat</p>
                            <h2 className="text-xl font-bold text-gray-800">{alat}</h2>
                        </div>
                    </div>

                </div>

                {/* 🔥 TABLE */}
                <div className="bg-white rounded-xl shadow">

                    <div className="flex justify-between items-center p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            <h2 className="font-semibold">Latest Activity</h2>
                        </div>

                        <Link
                            href="/admin/log"
                            className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                        >
                            Lihat Semua <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="bg-blue-500 text-white">
                                <tr>
                                    <th className="p-3 text-left">User</th>
                                    <th className="p-3 text-left">Aksi</th>
                                    <th className="p-3 text-left">Waktu</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center p-4 text-gray-400">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center p-4 text-gray-400">
                                            Tidak ada aktivitas
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, i) => {
                                        const style = getAksiStyle(log.aksi || "");

                                        return (
                                            <tr
                                                key={log.id}
                                                className={i % 2 === 0 ? "bg-gray-100" : "bg-white"}
                                            >
                                                <td className="p-3">
                                                    {log.user?.nama || "-"}
                                                </td>

                                                <td className="p-3">
                                                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition ${style.class}`}>
                                                        {style.icon}
                                                        <span>
                                                            {log.aksi?.replaceAll("_", " ")}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="p-1 text-gray-500">
                                                    {formatTanggal(log.waktu)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                        </table>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}