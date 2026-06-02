"use client";

import { useEffect, useState, useCallback } from "react";
import Layout from "@/components/layout/LayoutPeminjam";
import {
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    Calendar,
    ArrowRight,
    Loader,
    Box,
    CalendarDays
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CartPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [cart, setCart] = useState<Record<number, number>>({});
    const [alat, setAlat] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [tanggalPinjam, setTanggalPinjam] = useState("");
    const [tanggalKembali, setTanggalKembali] = useState("");

    // 🔥 LOAD CART from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
        setIsLoaded(true);
    }, []);

    // 🔥 SAVE CART to localStorage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart, isLoaded]);

    // 🔥 FETCH ALAT details for items in cart
    const fetchCartAlat = useCallback(async (currentCart: Record<number, number>) => {
        if (Object.keys(currentCart).length === 0) {
            setAlat([]);
            return;
        }
        try {
            const res = await fetch("/api/alat");
            const json = await res.json();
            const selected = json.filter((a: any) => currentCart[a.id] !== undefined);
            setAlat(selected);
        } catch (err) {
            console.error("Fetch alat error:", err);
        }
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        fetchCartAlat(cart);
    }, [isLoaded]); // Only on initial load — manual refetch on cart changes

    const increment = (id: number) => {
        const item = alat.find((a) => a.id === id);
        if (!item) return;
        const maxStock = item.stok; // stok = jumlah unit tersedia
        if ((cart[id] || 0) >= maxStock) {
            alert(`Maksimum stok tersedia: ${maxStock}`);
            return;
        }
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const decrement = (id: number) => {
        setCart(prev => {
            if (prev[id] <= 1) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            }
            return { ...prev, [id]: prev[id] - 1 };
        });
    };

    const removeItem = (id: number) => {
        setCart(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            alert("Sesi tidak valid, silahkan login ulang.");
            return;
        }
        if (!tanggalPinjam || !tanggalKembali) {
            alert("Harap tentukan tanggal peminjaman dan pengembalian.");
            return;
        }
        if (new Date(tanggalKembali) <= new Date(tanggalPinjam)) {
            alert("Tanggal kembali harus setelah tanggal pinjam.");
            return;
        }
        if (alat.length === 0) {
            alert("Keranjang kosong.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 🔥 Fetch FRESH alat data right before submitting to get latest unit IDs
            const freshRes = await fetch("/api/alat");
            const freshAlat: any[] = await freshRes.json();

            const alatUnitIds: number[] = [];

            for (const a of alat) {
                const qty = cart[a.id];
                if (!qty) continue;

                // Find fresh data for this alat
                const freshItem = freshAlat.find((f: any) => f.id === a.id);
                if (!freshItem) throw new Error(`Alat ${a.nama} tidak ditemukan.`);

                // alatUnit is the alias from service (= units array)
                const availableUnits = (freshItem.alatUnit || freshItem.units || [])
                    .filter((u: any) => u.status === "tersedia" && u.deletedAt === null);

                if (availableUnits.length < qty) {
                    throw new Error(
                        `Stok "${a.nama}" tidak mencukupi. Tersedia: ${availableUnits.length}, kamu minta: ${qty}.`
                    );
                }

                availableUnits.slice(0, qty).forEach((u: any) => {
                    alatUnitIds.push(u.id);
                });
            }

            if (alatUnitIds.length === 0) {
                throw new Error("Tidak ada unit yang dapat dipinjam.");
            }

            const res = await fetch("/api/peminjaman", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tanggalPinjam,
                    tanggalRencanaKembali: tanggalKembali,
                    alatUnitIds,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Gagal mengajukan peminjaman.");

            // Clear cart
            localStorage.removeItem("cart");
            setCart({});
            setAlat([]);
            setTanggalPinjam("");
            setTanggalKembali("");

            alert("Peminjaman berhasil diajukan! Menunggu persetujuan petugas.");
            router.push("/peminjam/peminjaman");
        } catch (err: any) {
            alert("Gagal: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <Layout>
            <div className="space-y-8 max-w-5xl mx-auto py-4">

                {/* 🔵 HEADER */}
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <ShoppingCart className="text-blue-600" size={32} /> Keranjang Alat
                    </h1>
                    <p className="text-slate-500 font-medium tracking-tight italic">
                        Tinjau daftar alat dan atur jadwal peminjamanmu.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* 🔵 LIST ITEMS */}
                    <div className="lg:col-span-7 space-y-4">
                        {alat.length === 0 ? (
                            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                    <ShoppingCart size={40} />
                                </div>
                                <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest italic">Keranjang Kosong</h2>
                                <button onClick={() => router.push("/peminjam")} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline px-6 py-3">
                                    Cari Alat Sekarang →
                                </button>
                            </div>
                        ) : (
                            alat.map((item) => (
                                <div key={item.id} className="bg-white p-6 rounded-[2rem] border-2 border-white shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all flex items-center gap-6 group">
                                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Box size={28} /></div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-slate-800 uppercase tracking-tight">{item.nama}</h3>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                            Stok Tersedia: <span className="text-blue-600">{item.stok}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                                        <button
                                            onClick={() => decrement(item.id)}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-500 hover:shadow-md transition-all active:scale-90"
                                        >
                                            {cart[item.id] === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                        </button>
                                        <span className="w-8 text-center font-black text-slate-700 text-lg">{cart[item.id]}</span>
                                        <button
                                            onClick={() => increment(item.id)}
                                            disabled={cart[item.id] >= item.stok}
                                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-400 hover:text-blue-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 🔵 FORM PEMINJAMAN (STICKY CARD) */}
                    {alat.length > 0 && (
                        <div className="lg:col-span-5 sticky top-28">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>

                                <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                    <CalendarDays className="text-blue-400" /> Detail Pinjam
                                </h2>

                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            Waktu Mulai
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="date"
                                                value={tanggalPinjam}
                                                min={new Date().toISOString().split("T")[0]}
                                                onChange={(e) => setTanggalPinjam(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white/10 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                            Waktu Kembali
                                        </label>
                                        <div className="relative">
                                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="date"
                                                value={tanggalKembali}
                                                min={tanggalPinjam || new Date().toISOString().split("T")[0]}
                                                onChange={(e) => setTanggalKembali(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white/10 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10 mt-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Unit</span>
                                            <span className="text-2xl font-black">{totalQty}</span>
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className={`
                                                w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40
                                                ${isSubmitting
                                                    ? "bg-slate-700 text-slate-400 cursor-wait"
                                                    : "bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-1"
                                                }
                                            `}
                                        >
                                            {isSubmitting ? (
                                                <Loader className="animate-spin" size={20} />
                                            ) : (
                                                <>Ajukan Peminjaman <ArrowRight size={20} /></>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-slate-500 mt-6 font-black uppercase tracking-tighter italic opacity-60">
                                            * Permintaan akan diverifikasi oleh petugas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}