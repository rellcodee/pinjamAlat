import { db } from "@/lib/db";
import { logActivity } from "./logService";

export async function getAllAlat() {
    const alat = await db.alat.findMany({
        include: {
            kategori: true,
            units: true,
        },
        orderBy: { nama: "asc" },
    });
    return alat.map(a => ({
        ...a,
        stok: a.units.filter(u => u.status === "tersedia").length
    }));
}

export async function createAlat(data: {
    nama: string;
    deskripsi?: string;
    kategoriId: number;
    image?: string;
}, currentUserId: number) {
    // validasi kategori
    const kategori = await db.kategori.findUnique({
        where: { id: data.kategoriId },
    });

    if (!kategori) throw new Error("Kategori tidak ditemukan");

    await logActivity(
        currentUserId,
        "CREATE_ALAT",
        `Membuat alat ${data.nama}`
    );
    return db.alat.create({
        data,
    });
}

export async function updateAlat(
    id: number,
    data: {
        nama: string;
        deskripsi?: string;
        kategoriId: number;
        image?: string;
    }, currentUserId: number
) {
    const alat = await db.alat.findUnique({ where: { id } });
    if (!alat) throw new Error("Alat tidak ditemukan");

    await logActivity(
        currentUserId,
        "UPDATE_ALAT",
        `Mengupdate alat ${data.nama}`
    );
    return db.alat.update({
        where: { id },
        data,
        include: {
            kategori: true,
            units: true,
        }
    });
}

export async function deleteAlat(id: number, currentUserId: number) {
    const alat = await db.alat.findUnique({
        where: { id },
    });

    if (!alat) throw new Error("Alat tidak ditemukan");

    await logActivity(
        currentUserId,
        "DELETE_ALAT",
        `Menghapus alat ${alat.nama}`
    );
    return db.alat.delete({ where: { id } });
}