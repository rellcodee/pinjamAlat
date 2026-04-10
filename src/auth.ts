import "server-only"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },

    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("INPUT:", credentials)
                const user = await db.user.findUnique({
                    where: { username: credentials?.username as string },
                })
                console.log("USER DB:", user)
                if (!user) return null

                const match = await bcrypt.compare(
                    credentials!.password as string,
                    user.password
                )
                console.log("MATCH:", match)
                if (!match) return null
                console.log(`RETURN: ${user.id}, ${user.nama}, ${user.username}, ${user.role}`)
                return {
                    id: String(user.id),
                    name: user.nama,
                    username: user.username,
                    role: user.role,
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string
                token.role = (user as any).role
                token.username = (user as any).username
            }
            return token
        },

        async session({ session, token }) {
            session.user.id = token.id as string
            session.user.role = token.role as string
            session.user.username = token.username as string
            return session
        },
    },
})