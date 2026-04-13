import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();

        // 🔐 AUTH CHECK
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 🔐 ADMIN ONLY
        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // 🔥 GET LOGS
        const logs = await db.logAktivitas.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        nama: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                waktu: "desc",
            },
            take: 50, // 🔥 LIMIT biar ringan & clean
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}