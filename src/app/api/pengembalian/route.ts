import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    getAllPengembalian,
    createPengembalian,
    updatePengembalian,
    deletePengembalian
} from "@/services/pengembalianService";

// GET
export async function GET() {
    const data = await getAllPengembalian();
    return NextResponse.json(data);
}

// POST
export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    try {
        const data = await createPengembalian(
            body.peminjamanId,
            body.tanggalKembaliAktual,
            Number(session.user.id)
        );
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// PUT
export async function PUT(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    try {
        const data = await updatePengembalian(
            body.id,
            body.tanggalKembaliAktual,
            Number(session.user.id)
        );
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// DELETE
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    try {
        await deletePengembalian(id, Number(session.user.id));
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}