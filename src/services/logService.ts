import { db } from "@/lib/db";

export async function getAllLogs(page = 1, limit = 10, search = "", role = "", date = "") {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.keterangan = { contains: search };
    }

    if (role) {
        where.user = { role };
    }

    if (date) {
        // Assume date is 'YYYY-MM-DD'
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        where.waktu = {
            gte: startDate,
            lte: endDate
        };
    }

    const data = await db.logAktivitas.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    nama: true,
                    username: true,
                    role: true
                }
            }
        },
        orderBy: { waktu: "desc" },
        skip,
        take: limit,
    });

    const total = await db.logAktivitas.count({ where });

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

export async function logActivity(
    userId: number,
    aksi: string,
    keterangan?: string
) {
    try {
        return await db.logAktivitas.create({
            data: {
                userId,
                aksi,
                keterangan,
            },
        });
    } catch (err: any) {
        console.error("Failed to append logActivity:", err);
        throw new Error(err.message);
    }
}