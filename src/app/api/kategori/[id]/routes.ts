import { NextResponse } from "next/server";
import { getKategoriById } from "@/services/kategoriService";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await getKategoriById(Number(params.id));
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
}