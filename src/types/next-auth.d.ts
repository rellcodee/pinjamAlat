import { DefaultSession, DefaultJWT } from "next-auth"

// Extend tipe Session supaya ada field role & username
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            username: string
        } & DefaultSession["user"]
    }
}

// Extend tipe JWT supaya ada field role & username
declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        username: string
    }
}