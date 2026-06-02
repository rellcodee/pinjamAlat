import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    getAllPeminjaman,
    createPeminjaman,
    updateStatusPeminjaman,
    updatePeminjaman,
    deletePeminjaman
} from "@/services/peminjamanService";


/* GET */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const data = await getAllPeminjaman(page, limit);
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

    try {
        const body = await req.json();

        // Jika ada alatUnitIds, berarti ini update data lengkap (Admin Override)
        if (body.alatUnitIds) {
            const data = await updatePeminjaman(
                Number(body.id),
                body,
                Number(session.user.id)
            );
            return NextResponse.json(data);
        }

        const data = await updateStatusPeminjaman(
            Number(body.id),
            body.status,
            Number(session.user.id)
        );

        return NextResponse.json(data);
    }
    catch (err: any) {
        console.error("ERROR UPDATE PEMINJAMAN:", err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
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