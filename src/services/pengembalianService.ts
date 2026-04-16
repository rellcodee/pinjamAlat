import { db } from "@/lib/db";
import { logActivity } from "./logService";

export async function getAllPengembalian() {
    return db.pengembalian.findMany({
        include: {
            peminjaman: {
                include: {
                    peminjam: true,
                    details: {
                        include: {
                            alatUnit: {
                                include: { alat: true }
                            }
                        }
                    }
                }
            },
            petugas: true
        },
        orderBy: { id: "desc" }
    });
}

// CREATE
export async function createPengembalian(
    peminjamanId: number,
    tanggalKembaliAktual: string,
    actorId: number
) {

    const peminjaman = await db.peminjaman.findUnique({
        where: { id: peminjamanId },
        include: { details: true }
    });

    if (!peminjaman) throw new Error("Peminjaman tidak ditemukan");

    if (
        peminjaman.status !== "disetujui" &&
        peminjaman.status !== "menunggu_pengembalian"
    ) {
        throw new Error("Tidak bisa dikembalikan");
    }

    const existing = await db.pengembalian.findUnique({
        where: { peminjamanId }
    });

    if (existing) throw new Error("Sudah dikembalikan");

    const rencana = new Date(peminjaman.tanggalRencanaKembali);
    const kembali = new Date(tanggalKembaliAktual);
    if (isNaN(kembali.getTime())) {
        throw new Error("Tanggal kembali tidak valid");
    }
    let hariTelat = Math.ceil(
        (kembali.getTime() - rencana.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (hariTelat < 0) hariTelat = 0;

    const totalDenda = hariTelat * 5000;

    const pengembalian = await db.pengembalian.create({
        data: {
            peminjamanId,
            petugasId: actorId,
            tanggalKembaliAktual: kembali,
            jumlahHariTerlambat: hariTelat,
            totalDenda
        }
    });

    const unitIds = peminjaman.details.map(d => d.alatUnitId);

    await db.alatUnit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: "tersedia" }
    });

    await db.peminjaman.update({
        where: { id: peminjamanId },
        data: { status: "selesai" }
    });

    await logActivity(
        actorId,
        "CREATE_PENGEMBALIAN",
        `Pengembalian #${peminjamanId} | Denda ${totalDenda}`
    );

    return pengembalian;
}

// EDIT (NO SENSITIF)
export async function updatePengembalian(
    id: number,
    data: {
        tanggalKembaliAktual?: Date;
    },
    actorId: number
) {
    const existing = await db.pengembalian.findUnique({
        where: { id },
        include: {
            peminjaman: true
        }
    });

    if (!existing) throw new Error("Data tidak ditemukan");

    // ❗ hitung ulang denda
    let terlambat = 0;
    let denda = 0;

    if (data.tanggalKembaliAktual) {
        const diff =
            (new Date(data.tanggalKembaliAktual).getTime() -
                new Date(existing.peminjaman.tanggalRencanaKembali).getTime()) /
            (1000 * 60 * 60 * 24);

        terlambat = diff > 0 ? Math.floor(diff) : 0;
        denda = terlambat * 5000;
    }

    const updated = await db.pengembalian.update({
        where: { id },
        data: {
            tanggalKembaliAktual: data.tanggalKembaliAktual,
            jumlahHariTerlambat: terlambat,
            totalDenda: denda
        }
    });

    await logActivity(
        actorId,
        "UPDATE_PENGEMBALIAN",
        `Update pengembalian #${id}`
    );

    return updated;
}

// DELETE (NO HARUS ROLLBACK)

export async function deletePengembalian(
    id: number,
    actorId: number
) {
    const existing = await db.pengembalian.findUnique({
        where: { id },
        include: {
            peminjaman: {
                include: {
                    details: true
                }
            }
        }
    });

    if (!existing) throw new Error("Data tidak ditemukan");

    // ❗ rollback unit
    const unitIds = existing.peminjaman.details.map(d => d.alatUnitId);

    await db.alatUnit.updateMany({
        where: { id: { in: unitIds } },
        data: { status: "dipinjam" } // balik ke sebelumnya
    });

    // ❗ rollback peminjaman
    await db.peminjaman.update({
        where: { id: existing.peminjamanId },
        data: { status: "disetujui" }
    });

    await db.pengembalian.delete({
        where: { id }
    });

    await logActivity(
        actorId,
        "DELETE_PENGEMBALIAN",
        `Hapus pengembalian #${id}`
    );

    return true;
}