"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DetailKategoriPage() {
    const { id } = useParams();
    const [kategori, setKategori] = useState<any>(null);

    const fetchDetail = async () => {
        const res = await fetch(`/api/kategori/${id}`);
        const data = await res.json();
        setKategori(data);
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    if (!kategori) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{kategori.nama}</h1>
            <p className="mb-4 text-gray-600">{kategori.deskripsi}</p>

            <h2 className="text-lg font-semibold mb-2">Daftar Alat</h2>

            {kategori.alat.length === 0 ? (
                <p>Tidak ada alat</p>
            ) : (
                <ul>
                    {kategori.alat.map((alat: any) => (
                        <li key={alat.id} className="border p-2 mb-2 rounded">
                            <b>{alat.nama}</b>
                            <p className="text-sm text-gray-500">{alat.deskripsi}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}