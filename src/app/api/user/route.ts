import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/services/userService";

export async function GET() {
    try {
        const data = await getAllUsers();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.nama || !body.username || !body.password) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }
    try {
        const user = await createUser(body.nama, body.username, body.password, body.role, Number(session.user.id));
        return NextResponse.json(user);
    }
    catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    try {
        const updated = await updateUser(body.id, body.nama, body.username, body.password, body.role, Number(session.user.id));
        return NextResponse.json(updated);
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();

    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.user.role !== "admin")
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });



    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (Number(session.user.id) === id) {
        throw new Error("Tidak bisa hapus diri sendiri");
    }

    try {
        const deleted = await deleteUser(id, Number(session.user.id));
        return NextResponse.json(deleted);
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}