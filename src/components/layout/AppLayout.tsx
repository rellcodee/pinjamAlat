"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Wrench,
    Tags,
    ClipboardList,
    RotateCcw,
    Menu,
    X,
    Circle,
} from "lucide-react";

const menus = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/user", icon: Users },
    { name: "Alat", href: "/admin/alat", icon: Wrench },
    { name: "Kategori", href: "/admin/kategori", icon: Tags },
    { name: "Peminjaman", href: "/admin/peminjaman", icon: ClipboardList },
    { name: "Pengembalian", href: "/admin/pengembalian", icon: RotateCcw },
];

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState("");
    const pathname = usePathname();

    // ⏱️ realtime clock
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

    return (
        <div className="flex min-h-screen bg-blue-50">

            {/* 🔥 SIDEBAR */}
            <aside
                className={`
          fixed md:static z-50 top-0 left-0 h-screen w-64 bg-white shadow-lg
          flex flex-col
          transform ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-all duration-300 ease-in-out
        `}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="font-bold text-lg text-blue-600">
                        PinjamAlat
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
                            src="https://i.pravatar.cc/40"
                            className="w-10 h-10 rounded-full"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-700">Admin</p>
                        <p className="text-xs text-gray-500">Online</p>
                    </div>
                </div>

                {/* MENU */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menus.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${isActive
                                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
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

                {/* FOOTER */}
                <div className="p-4 border-t text-xs text-gray-400">
                    © 2026 PinjamAlat
                </div>
            </aside>

            {/* OVERLAY */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            {/* MAIN */}
            <div className="flex-1 flex flex-col">

                {/* TOPBAR */}
                <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">

                    <button
                        onClick={() => setOpen(true)}
                        className="md:hidden"
                    >
                        <Menu size={22} color="black" />
                    </button>

                    <h2 className="font-semibold text-gray-700">
                        Dashboard
                    </h2>

                    {/* STATUS + TIME */}
                    <div className="flex flex-col items-end text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Circle size={10} className="text-green-500 fill-green-500" />
                            Active
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