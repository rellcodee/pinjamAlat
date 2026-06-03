"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    ClipboardList,
    RotateCcw,
    ShoppingCart,
    Menu,
    X,
    LogOut,
    CalendarDays,
    ChevronDown,
    Box,
    Bell
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

// Menu navigasi Peminjam
const menus = [
    { name: "Alat", href: "/peminjam", icon: Box },
    { name: "Riwayat", href: "/peminjam/peminjaman", icon: ClipboardList },
    { name: "Cart", href: "/peminjam/cart", icon: ShoppingCart },
    { name: "Pengembalian", href: "/peminjam/pengembalian", icon: RotateCcw },
];

export default function LayoutPeminjam({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState("");
    const pathname = usePathname();

    const currentPage = menus.find(menu => menu.href === pathname)?.name || "Dashboard";

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            setTime(formatted);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

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
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* SIDEBAR */}
            <aside
                className={`
                    fixed md:static z-50 top-0 left-0 h-screen w-64 bg-white text-slate-600 shadow-xl border-r border-slate-100
                    flex flex-col
                    transform ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 transition-all duration-300 ease-in-out
                `}
            >
                <div className="flex items-center justify-between p-6 h-20 border-b border-slate-100">
                    <Link href="/peminjam" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Box size={18} className="text-white" />
                        </div>
                        <h1 className="font-extrabold text-xl tracking-tight text-slate-800">
                            Pinjam<span className="text-blue-600">Alat</span>
                        </h1>
                    </Link>
                    <button onClick={() => setOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {menus.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                                    flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                    ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                                    }
                                `}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <LogOut size={20} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md h-20 px-6 flex items-center justify-between border-b border-slate-100 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setOpen(true)} className="md:hidden text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                            <Menu size={24} />
                        </button>

                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>
                        <div className="flex items-center gap-3 p-1">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                                    {session?.user?.name || "User"}
                                </p>
                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">
                                    Kelas {session?.user?.kelas || "-"}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                    <div className="max-w-[1400px] mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}