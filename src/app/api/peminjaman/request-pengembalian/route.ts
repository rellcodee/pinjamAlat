import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// ✅ REQUEST
export async function POST(req: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const peminjaman = await db.peminjaman.findUnique({
            where: { id: body.id }
        });

        if (!peminjaman) {
            throw new Error("Data tidak ditemukan");
        }

        if (peminjaman.status !== "disetujui") {
            throw new Error("Belum bisa mengajukan pengembalian");
        }

        // 🔥 UPDATE STATUS
        const updated = await db.peminjaman.update({
            where: { id: body.id },
            data: {
                status: "menunggu_pengembalian"
            }
        });

        return NextResponse.json(updated);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// ❌ CANCEL
export async function PUT(req: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        const peminjaman = await db.peminjaman.findUnique({
            where: { id: body.id }
        });

        if (!peminjaman) {
            throw new Error("Data tidak ditemukan");
        }

        if (peminjaman.status !== "menunggu_pengembalian") {
            throw new Error("Tidak bisa dibatalkan");
        }

        const updated = await db.peminjaman.update({
            where: { id: body.id },
            data: {
                status: "disetujui"
            }
        });

        return NextResponse.json(updated);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}