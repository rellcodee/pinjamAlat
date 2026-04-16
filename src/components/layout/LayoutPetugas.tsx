"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    RotateCcw,
    Menu,
    X,
    Circle,
    Timer,
    LogOut
} from "lucide-react";

const menus = [
    { name: "Dashboard", href: "/petugas", icon: LayoutDashboard },
    { name: "Peminjaman", href: "/petugas/peminjaman", icon: ClipboardList },
    { name: "Pengembalian", href: "/petugas/pengembalian", icon: RotateCcw },
];

export default function PetugasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState("");
    const pathname = usePathname();

    // 🔥 REALTIME CLOCK
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();

            const formatted = now.toLocaleString("id-ID", {
                weekday: "short",
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

    // 🔥 LOGOUT
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
        <div className="flex min-h-screen bg-gray-50">

            {/* 🔥 SIDEBAR */}
            <aside
                className={`
                    fixed md:static z-50 top-0 left-0 h-screen w-64 bg-white shadow-md
                    flex flex-col
                    transform ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 transition-all duration-300 ease-in-out
                `}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="font-bold text-lg text-blue-600">
                        PinjamPanel
                    </h1>

                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* USER */}
                <div className="p-5 border-b flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="/kumis.png"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700">
                            Petugas
                        </p>
                        <p className="text-xs text-gray-500">
                            Online
                        </p>
                    </div>
                </div>

                {/* MENU */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menus.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                                    ${isActive
                                        ? "bg-blue-100 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="
                            flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm 
                            text-red-500 hover:bg-red-50 transition
                        "
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t text-xs text-gray-400 text-center">
                    © 2026 PinjamAlat
                </div>
            </aside>

            {/* OVERLAY */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                />
            )}

            {/* MAIN */}
            <div className="flex-1 flex flex-col">

                {/* TOPBAR */}
                <header className="bg-white border-b px-4 py-3 flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOpen(true)}
                            className="md:hidden"
                        >
                            <Menu size={22} />
                        </button>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Circle size={10} className="text-green-500 fill-green-500" />
                            Online
                        </div>

                        <span>{time}</span>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-4">
                    {children}
                </main>
            </div>
        </div>
    );
}