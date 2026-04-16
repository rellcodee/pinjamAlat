"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";

export default function PeminjamPage() {
    const [alat, setAlat] = useState<any[]>([]);
    const [cart, setCart] = useState<Record<number, number>>({});

    // 🔥 FETCH ALAT
    const fetchAlat = async () => {
        const res = await fetch("/api/alat");
        const json = await res.json();

        const filtered = json.filter((a: any) => a.stok > 0);
        setAlat(filtered);
    };

    useEffect(() => {
        fetchAlat();
    }, []);

    // 🔥 LOAD CART
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
    }, []);

    // 🔥 SAVE CART
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // 🔥 TOGGLE SELECT (INI YANG LU MAU)
    const toggleCart = (id: number) => {
        setCart((prev) => {
            // kalau sudah ada → hapus
            if (prev[id]) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }

            // kalau belum → masuk (default qty = 1)
            return {
                ...prev,
                [id]: 1,
            };
        });
    };

    const isSelected = (id: number) => !!cart[id];

    const totalItem = Object.keys(cart).length;

    return (
        <Layout>
            <div className="p-4 space-y-4">

                {/* 🔵 HEADER */}
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold text-gray-700">
                        Daftar Alat
                    </h1>

                    <Link href="/peminjam/cart">
                        <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm">
                            <ShoppingCart size={16} />
                            {totalItem}
                        </div>
                    </Link>
                </div>

                {/* 🔥 GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                    {alat.map((a) => (
                        <div
                            key={a.id}
                            className={`
                                bg-white rounded-xl shadow border overflow-hidden transition
                                ${isSelected(a.id) ? "ring-2 ring-blue-500" : ""}
                            `}
                        >
                            {/* IMAGE */}
                            <img
                                src={a.image || "/no-image.png"}
                                className="w-full h-32 object-cover"
                            />

                            {/* CONTENT */}
                            <div className="p-3 space-y-2">

                                <div className="font-semibold text-sm text-gray-800">
                                    {a.nama}
                                </div>

                                <div className="text-xs text-gray-500">
                                    {a.kategori?.nama}
                                </div>

                                <div className="text-xs text-gray-400">
                                    Stok: {a.stok}
                                </div>

                                {/* 🔥 BUTTON TOGGLE */}
                                <button
                                    onClick={() => toggleCart(a.id)}
                                    className={`
                                        w-full py-1.5 rounded text-xs font-medium transition
                                        ${isSelected(a.id)
                                            ? "bg-green-500 text-white"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                        }
                                    `}
                                >
                                    {isSelected(a.id) ? (
                                        <span className="flex items-center justify-center gap-1">
                                            <Check size={14} />
                                            Dipilih (Batal?)
                                        </span>
                                    ) : (
                                        "Ambil"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

                {/* EMPTY */}
                {alat.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        Tidak ada alat tersedia
                    </div>
                )}
            </div>
        </Layout>
    );
}