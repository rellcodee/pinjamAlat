import { NextResponse } from "next/server";
import { getKategoriById } from "@/services/kategoriService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const data = await getKategoriById(Number(resolvedParams.id));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
}