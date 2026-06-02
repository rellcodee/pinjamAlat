import { db } from "@/lib/db";
import { logActivity } from "./logService";
import { getPengaturan } from "./pengaturanService";
import { createNotifications } from "@/lib/notification";

function calculateHariTelat(kembali: Date, rencana: Date) {
    const d1 = new Date(kembali);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(rencana);
    d2.setHours(0, 0, 0, 0);

    const diff = d1.getTime() - d2.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
}

export async function getAllPengembalian(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        db.pengembalian.findMany({
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
            orderBy: { id: "desc" },
            skip,
            take: limit,
        }),
        db.pengembalian.count()
    ]);
    return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
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

    const hariTelat = calculateHariTelat(kembali, rencana);

    const dendaSetting = await getPengaturan("denda_per_hari");

    const tarifDenda = dendaSetting ? Number(dendaSetting) : 5000;

    const totalDenda = hariTelat * tarifDenda;

    const pengembalian = await db.$transaction(async (tx) => {
        const pengembalian = await tx.pengembalian.create({
            data: {
                peminjamanId,
                petugasId: actorId,
                tanggalKembaliAktual: kembali,
                jumlahHariTerlambat: hariTelat,
                totalDenda
            }
        });

        const unitIds = peminjaman.details.map(d => d.alatUnitId);

        await tx.alatUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { status: "tersedia" }
        });

        await tx.peminjaman.update({
            where: { id: peminjamanId },
            data: { status: "selesai" }
        });

        return pengembalian;
    });

    await logActivity(
        actorId,
        "CREATE_PENGEMBALIAN",
        `Pengembalian #${peminjamanId} | Denda ${totalDenda}`
    );

    // Notify borrower about return
    await createNotifications(
        [peminjaman.peminjamId],
        totalDenda > 0 ? "Pengembalian Selesai — Ada Denda" : "Pengembalian Selesai ✅",
        totalDenda > 0
            ? `Alat berhasil dikembalikan. Denda keterlambatan: Rp ${totalDenda.toLocaleString("id-ID")}. Segera lunaskan ke petugas.`
            : `Alat berhasil dikembalikan tepat waktu. Terima kasih!`,
        totalDenda > 0 ? "WARNING" : "SUCCESS",
        `/peminjam/pengembalian/${pengembalian.id}`
    );

    return pengembalian;
}

// EDIT (NO SENSITIF)
export async function updatePengembalian(
    id: number,
    data: {
        tanggalKembaliAktual?: string | Date;
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
    let terlambat = existing.jumlahHariTerlambat;
    let denda = existing.totalDenda;
    let finalTanggal = existing.tanggalKembaliAktual;

    if (data.tanggalKembaliAktual) {
        finalTanggal = new Date(data.tanggalKembaliAktual);
        if (isNaN(finalTanggal.getTime())) {
            throw new Error("Tanggal kembali tidak valid");
        }

        terlambat = calculateHariTelat(
            finalTanggal,
            new Date(existing.peminjaman.tanggalRencanaKembali)
        );

        const dendaSetting = await getPengaturan("denda_per_hari");
        const tarifDenda = dendaSetting ? Number(dendaSetting) : 5000;
        denda = terlambat * tarifDenda;
    }

    // ❗ logic reset lunas (sesuai request user)
    // Jika denda berubah, kita reset. Jika denda jadi 0, otomatis lunas.
    let lunasStatus = existing.dendaLunas;
    if (denda !== existing.totalDenda) {
        lunasStatus = (denda === 0);
    }

    const updated = await db.pengembalian.update({
        where: { id },
        data: {
            tanggalKembaliAktual: finalTanggal,
            jumlahHariTerlambat: terlambat,
            totalDenda: denda,
            dendaLunas: lunasStatus
        }
    });

    await logActivity(
        actorId,
        "UPDATE_PENGEMBALIAN",
        `Update pengembalian #${id} | Denda: ${denda} | Lunas: ${lunasStatus}`
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

    await db.$transaction(async (tx) => {
        // ❗ rollback unit
        const unitIds = existing.peminjaman.details.map(d => d.alatUnitId);

        await tx.alatUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { status: "dipinjam" } // balik ke sebelumnya
        });

        // ❗ rollback peminjaman
        await tx.peminjaman.update({
            where: { id: existing.peminjamanId },
            data: { status: "disetujui" }
        });

        await tx.pengembalian.delete({
            where: { id }
        });
    });

    await logActivity(
        actorId,
        "DELETE_PENGEMBALIAN",
        `Hapus pengembalian #${id}`
    );

    return true;
}

// TANDAI LUNAS
export async function tandaiLunas(
    id: number,
    actorId: number
) {
    const existing = await db.pengembalian.findUnique({ where: { id } });
    if (!existing) throw new Error("Data tidak ditemukan");

    const updated = await db.pengembalian.update({
        where: { id },
        data: { dendaLunas: true }
    });

    await logActivity(
        actorId,
        "LUNAS_DENDA",
        `Denda pengembalian #${id} ditandai Lunas`
    );

    return updated;
}