import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllLogs } from "@/services/logService";

export async function GET(req: Request) {
    try {
        const session = await auth();

        // 🔐 AUTH CHECK
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 🔐 ADMIN ONLY
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const date = searchParams.get("date") || "";

        const logData = await getAllLogs(page, limit, search, role, date);
        return NextResponse.json(logData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}