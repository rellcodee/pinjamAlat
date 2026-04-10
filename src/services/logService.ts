import { db } from "@/lib/db";

export async function logActivity(
    userId: number,
    aksi: string,
    keterangan?: string
) {
    return db.logAktivitas.create({
        data: {
            userId,
            aksi,
            keterangan,
        },
    });
}