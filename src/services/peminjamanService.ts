import { db } from "@/lib/db";
import { logActivity } from "./logService";

/* =========================
   GET ALL
========================= */
export async function getAllPeminjaman() {
    return db.peminjaman.findMany({
        include: {
            peminjam: true,
            petugas: true,
            pengembalian: true,
            details: {
                include: {
                    alatUnit: {
                        include: {
                            alat: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

/* =========================
   CREATE PEMINJAMAN
========================= */
export async function createPeminjaman(
    data: {
        peminjamId: number;
        tanggalPinjam: Date;
        tanggalRencanaKembali: Date;
        alatUnitIds: number[];
    },
    actorId: number
) {

    return await db.$transaction(async (tx) => {

        // 🔍 VALIDASI
        const units = await tx.alatUnit.findMany({
            where: {
                id: { in: data.alatUnitIds },
                status: "tersedia"
            }
        });

        if (units.length !== data.alatUnitIds.length) {
            throw new Error("Ada unit yang tidak tersedia");
        }

        // ✅ CREATE
        const peminjaman = await tx.peminjaman.create({
            data: {
                peminjamId: actorId,
                petugasId: null,
                tanggalPinjam: new Date(data.tanggalPinjam),
                tanggalRencanaKembali: new Date(data.tanggalRencanaKembali),
                status: "pending",
                details: {
                    create: data.alatUnitIds.map(id => ({
                        alatUnitId: id
                    }))
                }
            },
            include: { details: true }
        });

        // 🔒 LOCK UNIT (SETELAH CREATE)
        await tx.alatUnit.updateMany({
            where: { id: { in: data.alatUnitIds } },
            data: { status: "dipinjam" }
        });

        // 📝 LOG
        await logActivity(
            actorId,
            "CREATE_PEMINJAMAN",
            `Membuat peminjaman #${peminjaman.id} (${data.alatUnitIds.length} unit)`
        );

        return peminjaman;
    });
}
/* =========================
   UPDATE STATUS
========================= */
export async function updateStatusPeminjaman(
    id: number,
    status: "disetujui" | "ditolak",
    actorId: number
) {

    const peminjaman = await db.peminjaman.findUnique({
        where: { id },
        include: {
            details: true
        }
    });

    if (!peminjaman) throw new Error("Peminjaman tidak ditemukan");

    if (peminjaman.status !== "pending") {
        throw new Error("Status sudah diproses");
    }
    const unitIds = peminjaman.details.map(d => d.alatUnitId);

    // ❗ CASE: DITOLAK → BALIKIN UNIT
    if (status === "ditolak") {
        await db.alatUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { status: "tersedia" }
        });
    }

    // ❗ CASE: DISETUJUI → pastikan dipinjam
    if (status === "disetujui") {
        await db.alatUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { status: "dipinjam" }
        });
    }

    const updated = await db.peminjaman.update({
        where: { id },
        data: {
            status,
            petugasId: actorId
        }
    });

    // 📝 LOG
    await logActivity(
        actorId,
        "UPDATE_STATUS_PEMINJAMAN",
        `Peminjaman #${id} diubah ke ${status}`
    );

    return updated;
}

/* =========================
   DELETE
========================= */
export async function deletePeminjaman(
    id: number,
    actorId: number
) {

    const peminjaman = await db.peminjaman.findUnique({
        where: { id },
        include: {
            details: {
                include: {
                    alatUnit: true
                }
            }
        }
    });

    if (!peminjaman) throw new Error("Peminjaman tidak ditemukan");

    const unitIds = peminjaman.details.map(d => d.alatUnitId);

    // 🔄 BALIKIN UNIT
    await db.alatUnit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: "tersedia" }
    });

    // ❌ DELETE
    await db.peminjaman.delete({
        where: { id }
    });

    // 📝 LOG
    await logActivity(
        actorId,
        "DELETE_PEMINJAMAN",
        `Menghapus peminjaman #${id}`
    );

    return { success: true };
}

// req
export async function requestPengembalian(
    id: number,
    userId: number
) {
    const peminjaman = await db.peminjaman.findUnique({
        where: { id }
    });

    if (!peminjaman) throw new Error("Data tidak ditemukan");

    if (peminjaman.peminjamId !== userId) {
        throw new Error("Bukan milik user");
    }

    if (peminjaman.status !== "disetujui") {
        throw new Error("Tidak bisa request pengembalian");
    }

    return db.peminjaman.update({
        where: { id },
        data: {
            status: "menunggu_pengembalian"
        }
    });
}