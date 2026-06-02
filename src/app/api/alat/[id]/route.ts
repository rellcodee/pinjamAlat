import { NextResponse } from "next/server";
import { getAlatById } from "@/services/alatService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const p = await params;
        const id = Number(p.id);

        if (!id) {
             return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
        }

        const data = await getAlatById(id);
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("API Error (GET /alat/[id]):", err);
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
}
