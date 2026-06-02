import { db } from "@/lib/db";
import { createNotifications } from "@/lib/notification";

export async function getNotifications(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        db.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await db.notification.count({
        where: { userId, isRead: false },
    });

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            unreadCount,
        },
    };
}

export async function markAsRead(notificationId: number, userId: number) {
    return await db.notification.update({
        where: { id: notificationId, userId },
        data: { isRead: true },
    });
}

export async function markAllAsRead(userId: number) {
    return await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
}

export async function deleteNotification(notificationId: number, userId: number) {
    return await db.notification.delete({
        where: { id: notificationId, userId },
    });
}

export async function deleteAllNotifications(userId: number) {
    return await db.notification.deleteMany({
        where: { userId },
    });
}


/**
 * Logic to check for loans approaching deadline (H-1)
 */
export async function checkDeadlineReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set to start of day and end of day for range
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const approachingLoans = await db.peminjaman.findMany({
        where: {
            tanggalRencanaKembali: {
                gte: startOfTomorrow,
                lte: endOfTomorrow,
            },
            status: "disetujui", // Only active loans
        },
        include: {
            peminjam: true,
        },
    });

    for (const loan of approachingLoans) {
        await createNotifications(
            [loan.peminjamId],
            "Pengingat Pengembalian",
            `Alat yang Anda pinjam (ID: #${loan.id}) harus dikembalikan besok.`,
            "WARNING"
        );
    }

    return approachingLoans.length;
}
