"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
    PlusCircle,
    Pencil,
    Trash2,
    Activity
} from "lucide-react";

export default function LogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        const res = await fetch("/api/log");
        const data = await res.json();

        setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // 🔥 FORMAT AKSI (REMOVE UNDERSCORE)
    const formatAksi = (aksi: string) => {
        return aksi.replace(/_/g, " ");
    };

    // 🔥 ICON + COLOR LOGIC
    const getAksiStyle = (aksi: string) => {
        if (aksi.includes("CREATE")) {
            return {
                icon: <PlusCircle size={16} />,
                class: "bg-green-100 text-green-600"
            };
        }

        if (aksi.includes("UPDATE")) {
            return {
                icon: <Pencil size={16} />,
                class: "bg-yellow-100 text-yellow-600"
            };
        }

        if (aksi.includes("DELETE")) {
            return {
                icon: <Trash2 size={16} />,
                class: "bg-red-100 text-red-600"
            };
        }

        return {
            icon: <Activity size={16} />,
            class: "bg-gray-100 text-gray-600"
        };
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <AppLayout>
            <div className="p-6">

                <h1 className="text-xl font-bold mb-4 text-gray-800">
                    Log Aktivitas
                </h1>

                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

                    <table className="w-full text-sm">

                        {/* 🔥 HEADER */}
                        <thead className="bg-blue-500 text-white">
                            <tr>
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Aksi</th>
                                <th className="p-3 text-left">Keterangan</th>
                                <th className="p-3 text-left">Waktu</th>
                            </tr>
                        </thead>

                        {/* 🔥 BODY */}
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center p-6 text-gray-400"
                                    >
                                        Tidak ada log aktivitas
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, i) => {
                                    const aksiStyle = getAksiStyle(log.aksi);

                                    return (
                                        <tr
                                            key={log.id}
                                            className={
                                                i % 2 === 0
                                                    ? "bg-gray-100"
                                                    : "bg-white"
                                            }
                                        >
                                            {/* USER */}
                                            <td className="p-3 text-gray-800">
                                                <div className="font-semibold">
                                                    {log.user?.nama}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    @{log.user?.username}
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td className="p-3">
                                                <div
                                                    className={`flex items-center gap-2 px-2 py-1 rounded w-fit ${aksiStyle.class}`}
                                                >
                                                    {aksiStyle.icon}
                                                    <span className="text-xs font-semibold">
                                                        {formatAksi(log.aksi)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* KETERANGAN */}
                                            <td className="p-3 text-gray-700">
                                                {log.keterangan || "-"}
                                            </td>

                                            {/* WAKTU */}
                                            <td className="p-3 text-gray-500 text-xs">
                                                {new Date(log.waktu).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}