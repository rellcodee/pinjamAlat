import { db } from "@/lib/db";
import { logActivity } from "./logService";
// GET ALL KATEGORI + alat
export async function getAllKategori() {
    return db.kategori.findMany({
        include: { alat: true },
        orderBy: { nama: "asc" },
    });
}
// Update
export async function updateKategori(
    id: number,
    nama: string,
    currentUserId: number,
    deskripsi?: string
) {
    const kategori = await db.kategori.findUnique({ where: { id } });
    if (!kategori) throw new Error("Kategori tidak ditemukan");

    const updated = await db.kategori.update({
        where: { id },
        data: { nama, deskripsi },
    });
    await logActivity(
        currentUserId,
        "UPDATE_KATEGORI",
        `Mengupdate kategori ${nama}`
    );
    return updated;
}

// CREATE KATEGORI
export async function createKategori(nama: string, currentUserId: number, deskripsi?: string,) {
    // cek duplikat
    const exists = await db.kategori.findFirst({ where: { nama } });
    if (exists) throw new Error("Kategori sudah ada");

    const kategori = await db.kategori.create({
        data: { nama, deskripsi },
    });
    await logActivity(
        currentUserId,
        "CREATE_KATEGORI",
        `Membuat kategori ${nama}`
    );
    return kategori;
}

// DELETE KATEGORI
export async function deleteKategori(id: number, currentUserId: number) {
    const kategori = await db.kategori.findUnique({
        where: { id },
        include: { alat: true }, // cek relasi
    });
    if (!kategori) throw new Error("Kategori tidak ditemukan");

    if (kategori.alat.length > 0)
        throw new Error("Kategori masih punya alat, hapus dulu alatnya");

    const deleted = db.kategori.delete({ where: { id } })
    await logActivity(
        currentUserId,
        "DELETE_KATEGORI",
        `Menghapus kategori ${kategori.nama}`
    );
    return deleted;
}

// GET KATEGORI BY ID
export async function getKategoriById(id: number) {
    const kategori = await db.kategori.findUnique({
        where: { id },
        include: {
            alat: {
                include: {
                    units: true, // kalau mau sekalian unit
                },
            },
        },
    });

    if (!kategori) throw new Error("Kategori tidak ditemukan");

    return kategori;
}