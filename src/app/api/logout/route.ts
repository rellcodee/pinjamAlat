import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ success: true });

    // 🔥 HAPUS COOKIE SESSION
    res.cookies.set("authjs.session-token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });

    res.cookies.set("__Secure-authjs.session-token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });

    return res;
}