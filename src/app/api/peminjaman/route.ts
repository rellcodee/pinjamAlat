import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    getAllPeminjaman,
    createPeminjaman,
    updateStatusPeminjaman,
    deletePeminjaman
} from "@/services/peminjamanService";

/* GET */
export async function GET() {
    const data = await getAllPeminjaman();
    return NextResponse.json(data);
}

/* POST */
export async function POST(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role == "petugas")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        console.log("BODY MASUK:", body);

        const data = await createPeminjaman(
            body,
            Number(session.user.id)
        );

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("ERROR PEMINJAMAN:", error); // 🔥 INI PENTING
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }


}

/* PUT */
export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const data = await updateStatusPeminjaman(
        body.id,
        body.status,
        Number(session.user.id)
    );

    return NextResponse.json(data);
}

/* DELETE */
export async function DELETE(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    const data = await deletePeminjaman(
        id,
        Number(session.user.id)
    );

    return NextResponse.json(data);
}