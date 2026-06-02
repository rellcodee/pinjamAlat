import { db } from "@/lib/db";
import { logActivity } from "./logService";
import { createNotifications } from "@/lib/notification";

/* =========================
   GET ALL
========================= */
export async function getAllPeminjaman(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        db.peminjaman.findMany({
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
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        db.peminjaman.count()
    ]);
    return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
}

/* =========================
   CREATE PEMINJAMAN
   Flow:
   - Peminjam submits → status: pending, units locked as "dipinjam"
   - Admin submits → status: disetujui, units locked as "dipinjam"
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
    // 🔍 VALIDASI UNIT (outside transaction to avoid connection issues)
    const units = await db.alatUnit.findMany({
        where: {
            id: { in: data.alatUnitIds },
            status: "tersedia",
            deletedAt: null
        }
    });

    if (units.length !== data.alatUnitIds.length) {
        throw new Error(`Beberapa unit tidak tersedia. Tersedia: ${units.length}, Diminta: ${data.alatUnitIds.length}`);
    }

    // Check actor role
    const currentActor = await db.user.findUnique({
        where: { id: actorId },
        select: { role: true }
    });
    const isAdmin = currentActor?.role === "admin";

    // ✅ RUN CORE TRANSACTION (db ops only, no external calls)
    const peminjaman = await db.$transaction(async (tx) => {
        // Double-check availability inside transaction (prevent race condition)
        const freshUnits = await tx.alatUnit.findMany({
            where: {
                id: { in: data.alatUnitIds },
                status: "tersedia"
            }
        });

        if (freshUnits.length !== data.alatUnitIds.length) {
            throw new Error("Stok tidak mencukupi, beberapa alat sudah tidak tersedia.");
        }

        const created = await tx.peminjaman.create({
            data: {
                peminjamId: isAdmin ? Number(data.peminjamId) : actorId,
                petugasId: isAdmin ? actorId : null,
                tanggalPinjam: new Date(data.tanggalPinjam),
                tanggalRencanaKembali: new Date(data.tanggalRencanaKembali),
                status: isAdmin ? "disetujui" : "pending",
                details: {
                    create: data.alatUnitIds.map(id => ({
                        alatUnitId: id
                    }))
                }
            },
            include: {
                details: true,
                peminjam: { select: { nama: true, id: true } }
            }
        });

        // 🔒 LOCK UNITS immediately to prevent double booking
        await tx.alatUnit.updateMany({
            where: { id: { in: data.alatUnitIds } },
            data: { status: "dipinjam" }
        });

        return created;
    });

    // 📝 LOG & NOTIFY (outside transaction — safe to use global db here)
    await logActivity(
        actorId,
        "CREATE_PEMINJAMAN",
        `Membuat peminjaman #${peminjaman.id} (${data.alatUnitIds.length} unit)`
    );

    // Notify all Petugas about new pending request
    if (!isAdmin) {
        const staff = await db.user.findMany({
            where: { role: "petugas", deletedAt: null },
            select: { id: true }
        });
        if (staff.length > 0) {
            await createNotifications(
                staff.map(u => u.id),
                "Request Peminjaman Baru",
                `${peminjaman.peminjam?.nama || "Seseorang"} mengajukan peminjaman baru (#${peminjaman.id})`,
                "INFO",
                `/petugas/peminjaman/${peminjaman.id}`
            );
        }
    }

    return peminjaman;
}

/* =========================
   UPDATE STATUS (Petugas/Admin)
   - disetujui: units stay dipinjam
   - ditolak: units released back to tersedia
========================= */
export async function updateStatusPeminjaman(
    id: number,
    status: "disetujui" | "ditolak",
    actorId: number
) {
    const peminjaman = await db.peminjaman.findUnique({
        where: { id },
        include: { details: true, peminjam: { select: { id: true, nama: true } } }
    });

    if (!peminjaman) throw new Error("Peminjaman tidak ditemukan");
    if (peminjaman.status !== "pending") throw new Error("Peminjaman ini sudah diproses");

    const unitIds = peminjaman.details.map(d => d.alatUnitId);

    const updated = await db.$transaction(async (tx) => {
        // If rejected: release units back
        if (status === "ditolak") {
            await tx.alatUnit.updateMany({
                where: { id: { in: unitIds } },
                data: { status: "tersedia" }
            });
        }
        // If approved: units stay as dipinjam (already set at pending)

        return tx.peminjaman.update({
            where: { id },
            data: {
                status,
                petugasId: actorId
            }
        });
    });

    // 📝 LOG & NOTIFY (outside transaction)
    await logActivity(
        actorId,
        "UPDATE_STATUS_PEMINJAMAN",
        `Peminjaman #${id} diubah ke ${status}`
    );

    await createNotifications(
        [peminjaman.peminjamId],
        `Peminjaman ${status === "disetujui" ? "Disetujui ✅" : "Ditolak ❌"}`,
        `Status peminjaman #${id} Anda: ${status === "disetujui" ? "disetujui, silakan ambil alat." : "ditolak."}`,
        status === "disetujui" ? "SUCCESS" : "DANGER",
        `/peminjam/peminjaman/${id}`
    );

    return updated;
}

/* =========================
   UPDATE (ADMIN override)
========================= */
export async function updatePeminjaman(
    id: number,
    data: {
        tanggalPinjam: string | Date;
        tanggalRencanaKembali: string | Date;
        alatUnitIds: number[];
    },
    actorId: number
) {
    return await db.$transaction(async (tx) => {
        const existing = await tx.peminjaman.findUnique({
            where: { id },
            include: { details: true }
        });

        if (!existing) throw new Error("Peminjaman tidak ditemukan");

        const oldUnitIds = existing.details.map(d => d.alatUnitId);
        const newUnitIds = data.alatUnitIds;

        const unitsToRemove = oldUnitIds.filter(uid => !newUnitIds.includes(uid));
        const unitsToAdd = newUnitIds.filter(uid => !oldUnitIds.includes(uid));

        // 🔍 Validasi unit baru
        if (unitsToAdd.length > 0) {
            const availableUnits = await tx.alatUnit.findMany({
                where: { id: { in: unitsToAdd }, status: "tersedia" }
            });
            if (availableUnits.length !== unitsToAdd.length) {
                throw new Error("Beberapa unit baru tidak tersedia");
            }
        }

        await tx.peminjaman.update({
            where: { id },
            data: {
                tanggalPinjam: new Date(data.tanggalPinjam),
                tanggalRencanaKembali: new Date(data.tanggalRencanaKembali),
            }
        });

        if (unitsToRemove.length > 0) {
            await tx.detailPeminjaman.deleteMany({
                where: { peminjamanId: id, alatUnitId: { in: unitsToRemove } }
            });
            await tx.alatUnit.updateMany({
                where: { id: { in: unitsToRemove } },
                data: { status: "tersedia" }
            });
        }

        if (unitsToAdd.length > 0) {
            await tx.detailPeminjaman.createMany({
                data: unitsToAdd.map(uid => ({ peminjamanId: id, alatUnitId: uid }))
            });
            await tx.alatUnit.updateMany({
                where: { id: { in: unitsToAdd } },
                data: { status: "dipinjam" }
            });
        }

        return { success: true };
    }).then(async (result) => {
        // 📝 LOG (outside transaction)
        await logActivity(actorId, "UPDATE_PEMINJAMAN", `Update peminjaman #${id} (Admin Override)`);
        return result;
    });
}

/* =========================
   DELETE
========================= */
export async function deletePeminjaman(id: number, actorId: number) {
    const peminjaman = await db.peminjaman.findUnique({
        where: { id },
        include: { details: true }
    });

    if (!peminjaman) throw new Error("Peminjaman tidak ditemukan");

    const unitIds = peminjaman.details.map(d => d.alatUnitId);

    await db.$transaction(async (tx) => {
        // Release units first
        await tx.alatUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { status: "tersedia" }
        });

        await tx.peminjaman.delete({ where: { id } });
    });

    await logActivity(actorId, "DELETE_PEMINJAMAN", `Menghapus peminjaman #${id}`);

    return { success: true };
}

/* =========================
   REQUEST PENGEMBALIAN (by Peminjam)
   Changes status: disetujui → menunggu_pengembalian
========================= */
export async function requestPengembalian(id: number, userId: number) {
    const peminjaman = await db.peminjaman.findUnique({ where: { id } });

    if (!peminjaman) throw new Error("Data tidak ditemukan");
    if (peminjaman.peminjamId !== userId) throw new Error("Bukan milik Anda");
    if (peminjaman.status !== "disetujui") throw new Error("Tidak bisa mengajukan pengembalian saat ini");

    const updated = await db.peminjaman.update({
        where: { id },
        data: { status: "menunggu_pengembalian" }
    });

    // Notify petugas (outside transaction — fine, no tx here)
    const staff = await db.user.findMany({
        where: { role: "petugas", deletedAt: null },
        select: { id: true }
    });
    const user = await db.user.findUnique({ where: { id: userId }, select: { nama: true } });

    if (staff.length > 0) {
        await createNotifications(
            staff.map(u => u.id),
            "Request Pengembalian",
            `${user?.nama || "Seseorang"} ingin mengembalikan alat (Pinjaman #${id})`,
            "INFO",
            `/petugas/pengembalian`
        );
    }

    return updated;
}