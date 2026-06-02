"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
    Users,
    Boxes,
    Wrench,
    ClipboardList,
    ArchiveRestore,
    ChartColumn
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [users, setUsers] = useState(0);
    const [kategori, setKategori] = useState(0);
    const [alat, setAlat] = useState(0);
    const [peminjaman, setPeminjaman] = useState(0);
    const [pengembalian, setPengembalian] = useState(0);

    const fetchData = async () => {
        try {
            const [uRes, kRes, aRes, pRes, rRes] = await Promise.all([
                fetch("/api/user"),
                fetch("/api/kategori"),
                fetch("/api/alat"),
                fetch("/api/peminjaman?limit=1000"),
                fetch("/api/pengembalian?limit=1000"),
            ]);

            const u = await uRes.json();
            const k = await kRes.json();
            const a = await aRes.json();
            const p = await pRes.json();
            const r = await rRes.json();

            const pArray = p.data || p;
            const rArray = r.data || r;

            setUsers(Array.isArray(u) ? u.length : 0);
            setKategori(Array.isArray(k.data) ? k.data.length : 0);
            setAlat(Array.isArray(a) ? a.length : 0);
            setPeminjaman(Array.isArray(pArray) ? pArray.length : 0);
            setPengembalian(Array.isArray(rArray) ? rArray.length : 0);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <AppLayout>
            {/* Elegant and soft page container backdrop */}
            <div className="min-h-full bg-[#F3F4FD] w-full py-6 md:py-8 font-sans antialiased text-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 overflow-hidden">

                    {/* Welcome Banner Card */}
                    <div className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 text-white rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_8px_30px_rgb(59,130,246,0.1)] relative overflow-hidden">
                        {/* Subtle Background Blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                            {/* Dashboard Banner Image - Placed on the left */}
                            <img
                                src="/dashboard.png"
                                alt="Dashboard Welcome illustration"
                                className="h-32 md:h-36 object-contain drop-shadow-lg"
                            />

                            {/* Welcome Text */}
                            <div className="text-center sm:text-left space-y-1.5">
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    Welcome Admin
                                </h1>
                                <p className="text-sm md:text-base text-white/80 max-w-md font-medium leading-relaxed">
                                    Kelola sistem peminjaman alat dengan mudah dan efisien melalui dashboard terpusat.
                                </p>
                            </div>
                        </div>

                        {/* Banner CTA Action Button - Placed on the right */}
                        <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                            <Link
                                href="/admin/log"
                                className="w-full md:w-auto inline-flex justify-center items-center px-6 py-3 bg-white text-indigo-700 hover:bg-slate-100 font-bold rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-black/5"
                            >
                                Lihat Log Aktivitas
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Category Cards Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="ml-1 border border-slate-100/60 bg-blue-100 p-2 rounded-2xl">
                                <ChartColumn color="#4f46e5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-800">
                                Statistik Sistem
                            </h2>
                        </div>

                        {/* Grid container holding 5 stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                            {/* Card 1: Users */}
                            <Link href="/admin/user">
                                <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/60 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200/50 hover:translate-y-[-2px] transition-all duration-300 group">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">Users</span>
                                    <h3 className="text-3xl font-extrabold text-blue-700 mt-2">{users}</h3>
                                    <span className="text-xs font-semibold text-slate-400 mt-1">({users} Users)</span>
                                </div>
                            </Link>

                            {/* Card 2: Kategori */}
                            <Link href="/admin/kategori">
                                <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/60 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200/50 hover:translate-y-[-2px] transition-all duration-300 group">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <Boxes className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">Kategori</span>
                                    <h3 className="text-3xl font-extrabold text-amber-700 mt-2">{kategori}</h3>
                                    <span className="text-xs font-semibold text-slate-400 mt-1">({kategori} Kategori)</span>
                                </div>
                            </Link>

                            {/* Card 3: Alat */}
                            <Link href="/admin/alat">
                                <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/60 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200/50 hover:translate-y-[-2px] transition-all duration-300 group">
                                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <Wrench className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">Alat</span>
                                    <h3 className="text-3xl font-extrabold text-rose-700 mt-2">{alat}</h3>
                                    <span className="text-xs font-semibold text-slate-400 mt-1">({alat} Alat)</span>
                                </div>
                            </Link>

                            {/* Card 4: Peminjaman */}
                            <Link href="/admin/peminjaman">
                                <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/60 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200/50 hover:translate-y-[-2px] transition-all duration-300 group">
                                    <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <ClipboardList className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">Peminjaman</span>
                                    <h3 className="text-3xl font-extrabold text-cyan-700 mt-2">{peminjaman}</h3>
                                    <span className="text-xs font-semibold text-slate-400 mt-1">({peminjaman} Pinjam)</span>
                                </div>
                            </Link>

                            {/* Card 5: Pengembalian */}
                            <Link href="/admin/pengembalian">
                                <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/60 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-200/50 hover:translate-y-[-2px] transition-all duration-300 group">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/50 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <ArchiveRestore className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">Pengembalian</span>
                                    <h3 className="text-3xl font-extrabold text-purple-700 mt-2">{pengembalian}</h3>
                                    <span className="text-xs font-semibold text-slate-400 mt-1">({pengembalian} Kembali)</span>
                                </div>
                            </Link>
                        </div>
                    </div>


                </div>
            </div>
        </AppLayout>
    );
}