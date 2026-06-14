import { NextResponse } from "next/server"
import { auth } from "@/auth" // Sesuaikan dengan lokasi file auth.ts lu

export async function GET() {
    // auth() mengambil session langsung di sisi server (super cepat & akurat)
    const session = await auth()

    if (!session || !session.user) {
        return NextResponse.json({ role: null })
    }

    return NextResponse.json({ role: session.user.role })
}