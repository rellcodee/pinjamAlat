"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import { Plus, Minus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const [cart, setCart] = useState<Record<number, number>>({});
    const [alat, setAlat] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [tanggalPinjam, setTanggalPinjam] = useState("");
    const [tanggalKembali, setTanggalKembali] = useState("");

    const router = useRouter();

    // 🔥 LOAD CART
    useEffect(() => {
        const saved = localStorage.getItem("cart");

        if (saved) {
            setCart(JSON.parse(saved));
        }

        setLoaded(true);
    }, []);

    // 🔥 FETCH ALAT
    useEffect(() => {
        if (!loaded) return;

        const fetchAlat = async () => {
            const res = await fetch("/api/alat");
            const json = await res.json();

            const selected = json.filter((a: any) => cart[a.id]);
            setAlat(selected);
        };

        fetchAlat();
    }, [loaded, cart]);

    // 🔥 SAVE CART
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart, loaded]);

    // ➕
    const increment = (id: number) => {
        const item = alat.find((a) => a.id === id);
        if (!item) return;

        if (cart[id] >= item.stok) {
            alert("Stok tidak mencukupi");
            return;
        }

        setCart((prev) => ({
            ...prev,
            [id]: prev[id] + 1,
        }));
    };

    // ➖
    const decrement = (id: number) => {
        setCart((prev) => {
            if (prev[id] === 1) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }

            return {
                ...prev,
                [id]: prev[id] - 1,
            };
        });
    };

    // ❌ REMOVE
    const removeItem = (id: number) => {
        const copy = { ...cart };
        delete copy[id];
        setCart(copy);
    };

    // 🔥 SUBMIT PEMINJAMAN
    const handleSubmit = async () => {
        if (!tanggalPinjam || !tanggalKembali) {
            alert("Tanggal wajib diisi");
            return;
        }

        if (alat.length === 0) {
            alert("Keranjang kosong");
            return;
        }

        try {
            // 🔥 convert cart → alatUnitIds
            const alatUnitIds: number[] = [];

            alat.forEach((a) => {
                const qty = cart[a.id];

                const availableUnits = a.alatUnit.filter(
                    (u: any) => u.status === "tersedia"
                );

                if (availableUnits.length < qty) {
                    throw new Error(`Stok ${a.nama} tidak cukup`);
                }

                const selectedUnits = availableUnits.slice(0, qty);

                selectedUnits.forEach((u: any) => {
                    alatUnitIds.push(u.id);
                });
            });

            const res = await fetch("/api/peminjaman", {
                method: "POST",
                body: JSON.stringify({
                    tanggalPinjam,
                    tanggalRencanaKembali: tanggalKembali,
                    alatUnitIds,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            alert("Peminjaman berhasil diajukan");

            // 🔥 reset
            localStorage.removeItem("cart");
            setCart({});
            setAlat([]);
            setTanggalPinjam("");
            setTanggalKembali("");

            router.push("/peminjam/riwayat");
        } catch (err: any) {
            alert(err.message);
            console.log("Error Bos", err.message);
        }
    };

    return (
        <Layout>
            <div className="p-4 space-y-4">

                <h1 className="text-lg font-bold text-gray-700">
                    Keranjang
                </h1>

                {alat.length === 0 && (
                    <div className="text-center text-gray-400">
                        Keranjang kosong
                    </div>
                )}

                {/* 🔥 LIST CART */}
                {alat.map((a) => (
                    <div
                        key={a.id}
                        className="bg-white p-3 rounded-xl shadow flex justify-between items-center"
                    >
                        <div>
                            <div className="font-semibold">{a.nama}</div>
                            <div className="text-xs text-gray-500">
                                Stok: {a.stok}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">

                            <button onClick={() => decrement(a.id)}>
                                <Minus size={16} />
                            </button>

                            <span>{cart[a.id]}</span>

                            <button
                                onClick={() => increment(a.id)}
                                disabled={cart[a.id] >= a.stok}
                                className={`
                                    ${cart[a.id] >= a.stok ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <Plus size={16} />
                            </button>

                            <button onClick={() => removeItem(a.id)}>
                                <Trash size={16} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* 🔥 FORM PEMINJAMAN */}
                {alat.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border space-y-3">

                        <h2 className="font-semibold text-gray-700">
                            Form Peminjaman
                        </h2>

                        <div>
                            <label className="text-sm text-gray-600">
                                Tanggal Pinjam
                            </label>
                            <input
                                type="date"
                                value={tanggalPinjam}
                                onChange={(e) => setTanggalPinjam(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">
                                Tanggal Kembali
                            </label>
                            <input
                                type="date"
                                value={tanggalKembali}
                                onChange={(e) => setTanggalKembali(e.target.value)}
                                className="border p-2 rounded w-full"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-500 text-white py-2 rounded"
                        >
                            Ajukan Peminjaman
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}