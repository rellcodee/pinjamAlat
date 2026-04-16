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
                peminjamId: Number(session.user.id), // 🔥 FILTER USER
            },
            include: {
                details: {
                    include: {
                        alatUnit: {
                            include: {
                                alat: true
                            }
                        }
                    }
                },
                pengembalian: true,
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}