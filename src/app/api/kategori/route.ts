import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    createKategori,
    getAllKategori,
    deleteKategori,
    updateKategori,
} from "@/services/kategoriService";

// ✅ GET ALL
export async function GET() {
    const data = await getAllKategori();
    return NextResponse.json(data);
}

// ✅ CREATE
export async function POST(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    try {
        const kategori = await createKategori(body.nama, Number(session.user.id), body.deskripsi);
        return NextResponse.json(kategori);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// ✅ UPDATE
export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    try {
        const updated = await updateKategori(body.id, body.nama, Number(session.user.id), body.deskripsi);
        return NextResponse.json(updated);
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
        const deleted = await deleteKategori(id, Number(session.user.id));
        return NextResponse.json(deleted);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}