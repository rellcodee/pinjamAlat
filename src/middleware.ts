import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: any) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })

    const { pathname } = req.nextUrl

    // Kalau sudah login dan ke /login → redirect
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL(`/${token.role}`, req.url))
    }

    // Protect admin
    if (pathname.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        if (token.role !== "admin") {
            return NextResponse.redirect(new URL(`/${token.role}`, req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}