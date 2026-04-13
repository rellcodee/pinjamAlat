import { NextResponse } from "next/server";
import {
    getAllAlatUnit,
    createAlatUnit,
    updateAlatUnit,
    deleteAlatUnit
} from "@/services/alatUnitService";
import { auth } from "@/auth";

// GET
export async function GET() {
    const data = await getAllAlatUnit();
    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const data = await createAlatUnit(
        body.alatId,
        Number(session.user.id)
    );

    return Response.json(data);
}

export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin")
        return Response.json({ error: "Forbidden" }, { status: 403 });


    const body = await req.json();

    const data = await updateAlatUnit(
        body.id,
        body.status,
        body.kondisi,
        Number(session.user.id)
    );

    return Response.json(data);
}

// DELETE
export async function DELETE(req: Request) {
    const session = await auth();

    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin")
        return Response.json({ error: "Forbidden" }, { status: 403 });


    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    const data = await deleteAlatUnit(
        id,
        Number(session.user.id)
    );

    return Response.json(data);
}