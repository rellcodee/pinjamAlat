"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        // signIn() dari NextAuth — memanggil authorize() di auth.ts
        const result = await signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
            redirect: false, // kita handle redirect sendiri
        })
        console.log("RESULT:", result)

        setLoading(false)

        if (result?.error) {
            setError("Username atau password salah")
            return
        }

        // Ambil session untuk tahu role-nya, lalu redirect
        // NextAuth otomatis update session setelah signIn berhasil
        const response = await fetch("/api/auth/session")
        const session = await response.json()
        const role = session?.user?.role

        if (role === "admin") router.push("/admin")
        else if (role === "petugas") router.push("/petugas")
        else router.push("/peminjam")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    Sistem Peminjaman Alat
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </button>
                </form>
            </div>
        </div>
    )
}

// "use client"

// export default function Page() {
//     return <div>test</div>
// }