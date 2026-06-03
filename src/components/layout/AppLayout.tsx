"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    Wrench,
    Tags,
    ClipboardList,
    RotateCcw,
    Menu,
    X,
    Timer,
    LogOut,
    CalendarDays,
    ChevronDown,
    Settings
} from "lucide-react";


// Menu navigasi
const menus = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/user", icon: Users },
    { name: "Alat", href: "/admin/alat", icon: Wrench },
    { name: "Kategori", href: "/admin/kategori", icon: Tags },
    { name: "Peminjaman", href: "/admin/peminjaman", icon: ClipboardList },
    { name: "Pengembalian", href: "/admin/pengembalian", icon: RotateCcw },
    { name: "Log Activity", href: "/admin/log", icon: Timer },
    { name: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
];

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState("");
    const pathname = usePathname();

    // Mengambil nama halaman saat ini berdasarkan pathname
    const currentPage = menus.find(menu => menu.href === pathname)?.name || "Dashboard";

    // 🔥 REALTIME CLOCK
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();

            const formatted = now.toLocaleString("id-ID", {
                // weekday: "long", // e.g., Senin
                day: "numeric",
                month: "short", // e.g., Des
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });

            setTime(formatted);
        };

        updateTime();
        // Update setiap menit
        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, []);

    // 🔥 LOGOUT FUNCTION (REAL)
    const handleLogout = async () => {
        if (!confirm("Yakin mau logout?")) return;

        try {
            await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });

            window.location.href = "/login";
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        // Latar belakang utama abu-abu sangat muda (f8fafc)
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">

            {/* 🔥 SIDEBAR - Menggunakan warna biru cerah (3b82f6 / 2563eb) */}
            <aside
                className={`
                    fixed md:static z-50 top-0 left-0 h-screen w-64 bg-blue-600 text-white shadow-xl
                    flex flex-col
                    transform ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 transition-all duration-300 ease-in-out
                `}
            >
                {/* LOGO AREA */}
                <div className="flex items-center justify-between p-6 h-20 border-b border-blue-500/50">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <Wrench size={18} className="text-blue-600" />
                        </div>
                        <h1 className="font-extrabold text-2xl tracking-tight">
                            Pinjam<span className="text-blue-100">Alat</span>
                        </h1>
                    </Link>

                    {/* Tombol Tutup Mobile */}
                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden text-blue-100 hover:text-white p-1 rounded-full hover:bg-blue-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* MENU UTAMA - Space y-1 untuk jarak rapat */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menus.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                                    flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                                    ${isActive
                                        ? "bg-white text-blue-700  shadow-md" // Style Aktif: Putih
                                        : "text-blue-50 hover:bg-blue-700 hover:text-white" // Style Hover: Biru Gelap
                                    }
                                `}
                            >
                                <Icon size={20} className={isActive ? "text-blue-600" : "text-blue-100 group-hover:text-white"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* 🔥 LOGOUT BUTTON - Di bawah menu */}
                <div className="p-4 border-t border-blue-500/50">
                    <button
                        onClick={handleLogout}
                        className="
                            flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium
                            text-red-100 hover:bg-red-600 hover:text-white transition duration-150
                        "
                    >
                        <LogOut size={20} />
                        Keluar Aplikasi
                    </button>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 text-xs text-blue-200 text-center bg-blue-700/50">
                    © 2026 RelDev
                </div>
            </aside>

            {/* 🔥 OVERLAY MOBILE - Latar belakang blur */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            {/* 🔥 MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* 🔥 TOPBAR - Header Putih Bersih */}
                <header className="bg-white shadow-sm h-20 px-6 flex items-center justify-between border-b border-slate-100 z-30">

                    <div className="flex items-center gap-4">
                        {/* Tombol Menu Mobile */}
                        <button
                            onClick={() => setOpen(true)}
                            className="md:hidden text-slate-600 p-2 rounded-lg hover:bg-slate-100"
                        >
                            <Menu size={24} />
                        </button>

                        {/* JUDUL HALAMAN & WAKTU AKTIF */}
                        <div className="flex items-center gap-5">
                            {/* Info Status Aktif & Waktu (Terganti di header) */}
                            <div className="hidden sm:flex items-center gap-3 text-blue-700 px-4 py-2">
                                <div className="flex items-center gap-1.5 text-xs text-blue-900/80 font-medium">
                                    <CalendarDays size={14} className="text-blue-500" />
                                    {time}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 AREA PROFIL USER - Di paling kanan */}
                    <div className="flex items-center gap-4">


                        {/* Dropdown/Info User */}
                        <button className="flex items-center gap-3.5 p-1.5 rounded-full hover:bg-slate-50 transition">
                            <div className="relative flex-shrink-0">
                                {/* Foto Profil Bulat */}
                                <img
                                    src="/admin.png" // Ganti dengan path lokal Anda `/admin.png`
                                    alt="Admin Profile"
                                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-100"
                                />
                                {/* Indikator Online Hijau */}
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-md"></span>
                            </div>

                            {/* Teks Nama & Status */}
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    {session?.user?.name || "Admin"}
                                </p>
                                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                    {session?.user?.role?.toUpperCase() || "ADMINISTRATOR"}
                                </p>
                            </div>

                            {/* Ikon Panah Kebawah */}
                            <ChevronDown size={16} className="text-slate-400 ml-1 hidden md:block" />
                        </button>
                    </div>
                </header>

                {/* 🔥 ISI KONTEN UTAMA - Dengan scrollbar terpisah */}
                <main className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
                    {/* Bungkus konten anak dengan kartu putih opsional */}
                    <div className="bg-gray-100 p-4 md:p-6 shadow-sm border border-slate-100 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}