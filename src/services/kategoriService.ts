import { db } from "@/lib/db";
import { logActivity } from "./logService";
export async function getAllKategori(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;

    // add search filter
    const where: any = {
        deletedAt: null
    };
    if (search) {
        where.nama = { contains: search };
    }

    const data = await db.kategori.findMany({
        where,
        include: { alat: { where: { deletedAt: null } } }, // only non-deleted tools
        orderBy: { nama: "asc" },
        skip,
        take: limit,
    });

    const total = await db.kategori.count({ where });

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    };
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

    // Logic ganti kode otomatis kalau namanya diubah oleh admin
    let kode = kategori.kode;
    if (kategori.nama !== nama) {
        const baseKode = nama.slice(0, 3).toUpperCase();
        kode = baseKode;
        let suffix = 1;
        while (await db.kategori.findFirst({ where: { kode, NOT: { id } } })) {
            kode = `${baseKode}${suffix}`;
            suffix++;
        }
    }

    const updated = await db.kategori.update({
        where: { id },
        data: { nama, deskripsi, kode }, // 👈 Ikut update kodenya bro
    });

    await logActivity(
        currentUserId,
        "UPDATE_KATEGORI",
        `Mengupdate kategori menjadi ${nama} (${kode})`
    );
    return updated;
}

// CREATE KATEGORI
export async function createKategori(nama: string, currentUserId: number, deskripsi?: string,) {
    // cek duplikat nama
    const exists = await db.kategori.findFirst({ where: { nama } });
    if (exists) throw new Error("Kategori sudah ada");

    // Auto-generate kode: first 3 letters uppercase, ensure unique
    const baseKode = nama.slice(0, 3).toUpperCase();
    let kode = baseKode;
    let suffix = 1;
    while (await db.kategori.findFirst({ where: { kode } })) {
        kode = `${baseKode}${suffix}`;
        suffix++;
    }

    const kategori = await db.kategori.create({
        data: { nama, deskripsi, kode },
    });
    await logActivity(
        currentUserId,
        "CREATE_KATEGORI",
        `Membuat kategori ${nama} (${kode})`
    );
    return kategori;
}

// DELETE KATEGORI
export async function deleteKategori(id: number, currentUserId: number) {
    const kategori = await db.kategori.findUnique({
        where: { id },
        include: { alat: true }, // cek relasi
    });

    // const user = await db.user.findUnique({ where: { id } });
    //     if (!user) throw new Error("User tidak ditemukan");

    //     const updated = await db.user.update({    // 👈 GANTI dari delete() ke update()
    //         where: { id },
    //         data: { deletedAt: new Date() }       // 👈 ISI deletedAt dengan waktu sekarang
    //     });


    if (!kategori) throw new Error("Kategori tidak ditemukan");

    if (kategori.alat.length > 0)
        throw new Error("Kategori masih punya alat, hapus dulu alatnya");


    const deleted = await db.kategori.update({    // 👈 GANTI dari delete() ke update()
        where: { id },
        data: { deletedAt: new Date() }       // 👈 ISI deletedAt dengan waktu sekarang
    });
    await logActivity(
        currentUserId,
        "DELETE_KATEGORI",
        `Menghapus kategori ${kategori.nama}`
    );
    return deleted;
}

export async function getKategoriById(id: number) {
    const kategori = await db.kategori.findUnique({
        where: { id },
        include: {
            alat: {
                where: { deletedAt: null }, // Do not show deleted tools
                include: {
                    units: true,
                },
            },
        },
    });

    if (!kategori || kategori.deletedAt) throw new Error("Kategori tidak ditemukan");

    return kategori;
}