import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    getAllAlat,
    createAlat,
    updateAlat,
    deleteAlat,
} from "@/services/alatService";
import { db } from "@/lib/db";
import { logActivity } from "@/services/logService";

// ✅ GET
export async function GET() {
    try {
        const data = await getAllAlat();
        return NextResponse.json(data);
    }
    catch (err) {
        console.error("API ERROR:", err); // 🔥 penting
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ✅ POST (ADMIN)
export async function POST(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { nama, deskripsi, kategoriId, image, stok } = body;


    try {
        const alat = await db.alat.create({
            data: {
                nama,
                deskripsi,
                image,
                stok,
                kategori: {
                    connect: { id: kategoriId }
                }
            }
        });
        logActivity(Number(session.user.id), "CREATE_ALAT", `Membuat alat ${nama}`);
        return NextResponse.json(alat);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// ✅ PUT
export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    try {
        const alat = await updateAlat(body.id, body, Number(session.user.id));
        return NextResponse.json(alat);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// ✅ DELETE
export async function DELETE(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    try {
        const alat = await deleteAlat(id, Number(session.user.id));
        return NextResponse.json(alat);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}