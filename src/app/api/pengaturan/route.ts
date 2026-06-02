import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPengaturan, setPengaturan } from "@/services/pengaturanService";

// ✅ GET
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const kunci = searchParams.get("kunci");

    if (!kunci) return NextResponse.json({ error: "Missing kunci parameter" }, { status: 400 });

    try {
        const value = await getPengaturan(kunci);
        return NextResponse.json({ kunci, nilai: value || "" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ✅ PUT
export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await req.json();
        const { kunci, nilai } = body;

        if (!kunci || !nilai) {
             return NextResponse.json({ error: "Kunci dan nilai wajib diisi" }, { status: 400 });
        }

        const data = await setPengaturan(kunci, String(nilai), Number(session.user.id));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
