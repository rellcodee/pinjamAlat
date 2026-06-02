import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await db.peminjaman.findMany({
            where: {
                peminjamId: Number(session.user.id),
            },
            include: {
                petugas: {
                    select: { id: true, nama: true, role: true }
                },
                details: {
                    include: {
                        alatUnit: {
                            include: {
                                alat: {
                                    select: { id: true, nama: true, image: true }
                                }
                            }
                        }
                    }
                },
                pengembalian: {
                    include: {
                        petugas: {
                            select: { id: true, nama: true }
                        }
                    }
                },
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(data);
    } catch (err) {
        console.error("GET /api/peminjaman/me error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}