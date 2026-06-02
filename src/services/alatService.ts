import { db } from "@/lib/db";
import { logActivity } from "./logService";
import { createNotifications } from "@/lib/notification";

export async function getAllAlat() {
    const alat = await db.alat.findMany({
        where: {
            deletedAt: null
        },
        include: {
            kategori: true,
            units: true,
        },
        orderBy: { nama: "asc" },
    });
    return alat.map(a => ({
        ...a,
        alatUnit: a.units,
        stok: a.units.filter(u => u.status === "tersedia" && u.deletedAt === null).length
    }));
}

export async function createAlat(data: {
    nama: string;
    deskripsi?: string;
    kategoriId: number;
    image?: string;
    merk?: string;
    type?: string;
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
    const newAlat = await db.alat.create({
        data,
    });

    // --- NOTIFICATION LOGIC ---
    // Get all Petugas to notify (Admin excluded)
    const staff = await db.user.findMany({
        where: { role: "petugas", deletedAt: null },
        select: { id: true }
    });
    const staffIds = staff.map(u => u.id);

    await createNotifications(
        staffIds,
        "Alat Baru Ditambahkan",
        `Admin baru saja menambahkan alat: ${data.nama}`,
        "INFO",
        `/petugas/alat/${newAlat.id}`
    );

    // Get all Peminjam to notify (info about new release)
    const borrowers = await db.user.findMany({
        where: { role: "peminjam", deletedAt: null },
        select: { id: true }
    });
    const borrowerIds = borrowers.map(u => u.id);

    await createNotifications(
        borrowerIds,
        "Alat Terbaru Rilis!",
        `Ada alat baru yang mungkin Anda butuhkan: ${data.nama}`,
        "INFO",
        `/siswa/katalog` // Assuming borrowers catalog path
    );

    return newAlat;
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

    const deletedUnit = await db.alatUnit.updateMany({
        where: { alatId: id },
        data: { deletedAt: new Date(), status: "tidak_tersedia" }
    });

    const updated = await db.alat.update({
        where: { id },
        data: { deletedAt: new Date() }
    });

    await logActivity(
        currentUserId,
        "DELETE_ALAT",
        `Menghapus alat ${alat.nama}`
    );
    return { alat: updated, hapusUnit: deletedUnit };
}

export async function getAlatById(id: number) {
    const alat = await db.alat.findUnique({
        where: { id, deletedAt: null },
        include: {
            kategori: true,
            units: {
                where: { deletedAt: null },
            },
        },
    });

    if (!alat) throw new Error("Alat tidak ditemukan");

    return {
        ...alat,
        alatUnit: alat.units,
        stok: alat.units.filter((u) => u.status === "tersedia").length,
    };
}