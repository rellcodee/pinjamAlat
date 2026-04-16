import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // =========================
        // SUMMARY
        // =========================
        const dipinjam = await db.peminjaman.count({
            where: { status: "disetujui" }
        });

        const selesai = await db.peminjaman.count({
            where: { status: "selesai" }
        });

        const totalDenda = await db.pengembalian.aggregate({
            _sum: { totalDenda: true }
        });

        // =========================
        // GRAFIK BULAN INI
        // =========================
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);

        const detail = await db.detailPeminjaman.findMany({
            where: {
                peminjaman: {
                    createdAt: {
                        gte: start,
                        lte: end
                    }
                }
            },
            include: {
                alatUnit: {
                    include: {
                        alat: true
                    }
                }
            }
        });

        const map: Record<string, number> = {};

        detail.forEach((item) => {
            const nama = item.alatUnit.alat.nama;
            map[nama] = (map[nama] || 0) + 1;
        });

        const grafik = Object.entries(map).map(([namaAlat, total]) => ({
            namaAlat,
            total
        }));

        // =========================
        // PENGEMBALIAN TERBARU
        // =========================
        const pengembalian = await db.pengembalian.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                peminjaman: {
                    include: {
                        peminjam: true
                    }
                }
            }
        });

        return NextResponse.json({
            summary: {
                dipinjam,
                selesai,
                totalDenda: totalDenda._sum.totalDenda || 0
            },
            grafik,
            pengembalian
        });

    } catch (error) {
        console.error("DASHBOARD ERROR:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}