import { db } from "@/lib/db";

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();

    // 🔐 PROTECT ADMIN ONLY
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const logs = await db.logAktivitas.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        nama: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                waktu: "desc"
            },
            take: 50 // 🔥 LIMIT biar ringan
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function logActivity(
    userId: number,
    aksi: string,
    keterangan?: string
) {

    const session = await auth();

    // 🔐 PROTECT ADMIN ONLY
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        return await db.logAktivitas.create({
            data: {
                userId,
                aksi,
                keterangan,
            },
        });
    }
    catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }

}