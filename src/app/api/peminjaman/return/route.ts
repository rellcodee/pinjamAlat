import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { requestPengembalian } from "@/services/peminjamanService";

export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    try {
        const data = await requestPengembalian(
            body.id,
            Number(session.user.id)
        );

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}