"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Wrench, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Hammer, Info, X } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showContactInfo, setShowContactInfo] = useState(false)

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
        if (role === "admin") {
            setTimeout(() => {
                window.location.href = "/admin"
            }, 500)
        } else if (role === "petugas") {
            setTimeout(() => {
                window.location.href = "/petugas"
            }, 500)
        } else if (role === "peminjam") {
            setTimeout(() => {
                window.location.href = "/peminjam"
            }, 500)
        } else {
            // Jaga-jaga kalau pas di-fetch pertama kali nilainya masih null karena Vercel telat
            setError("Sistem sedang mencocokkan sesi, silakan klik tombol Masuk sekali lagi.")
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6 md:p-10 font-sans">
            {/* Main Double-Column Card Container */}
            <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">

                {/* Left Side: Login Form */}
                <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-between bg-white w-full">
                    {/* Header: Logo and Title */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-800">PinjamAlat</span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                            Selamat Datang!
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Silakan masuk ke akun Anda untuk mulai mengelola atau meminjam alat inventaris sekolah.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 my-8">
                        {/* Username Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <User className="w-4 h-4" />
                                </span>
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="Masukkan username Anda"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowContactInfo(true)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Lupa password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password Anda"
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600 font-medium cursor-pointer select-none">
                                Tetap masuk di perangkat ini
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm animate-shake">
                                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Masuk ke Akun</span>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="text-center pt-5 border-t border-slate-100">
                        <span className="text-sm text-slate-500">
                            Belum memiliki akun?{" "}
                            <button
                                type="button"
                                onClick={() => setShowContactInfo(true)}
                                className="font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            >
                                Hubungi Admin
                            </button>
                        </span>
                    </div>
                </div>

                {/* Right Side: Informational Illustration (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#eef3f9] to-[#d6e4f3] w-full border-l border-slate-100 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    {/* Top Guide Widget (matches reference card) */}
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200/40 p-6 rounded-2xl shadow-sm max-w-sm ml-auto relative z-10">
                        <div className="flex gap-3.5 items-start">
                            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 flex-shrink-0">
                                <Hammer className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">Tentang Aplikasi</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                                    Aplikasi PinjamAlat mempermudah Anda dalam meminjam dan mengembalikan alat inventaris sekolah.
                                </p>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert("Informasi lebih lanjut akan segera hadir");
                                    }}
                                    className="inline-flex items-center text-xs font-bold tracking-wider text-slate-800 hover:text-blue-600 border-b border-slate-800 hover:border-blue-600 transition-all uppercase"
                                >
                                    Mulai Panduan
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 3D Illustration Vector */}
                    <div className="flex-1 flex flex-col justify-center items-center py-6 relative z-10">
                        <div className="relative w-full max-w-[280px] aspect-square animate-float">
                            <img
                                src="/loginelemen.png"
                                alt="Sistem Peminjaman Alat"
                                className="w-full h-full object-contain filter drop-shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Right Panel Footer Muted Text */}
                    <div className="text-center text-xs text-slate-400 relative z-10">
                        &copy; {new Date().getFullYear()} RelDev. Hak Cipta Dilindungi.
                    </div>
                </div>
            </div>

            {/* Custom Interactive Modal for Account/Password Help */}
            {showContactInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 relative transform transition-all duration-300 scale-100">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowContactInfo(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Title and Icon */}
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <Info className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">Informasi Akun</h3>
                        </div>

                        {/* Content */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            Akun dan password dikelola secara terpusat oleh pihak sekolah. Silakan hubungi <strong>petugas peminjaman alat</strong> atau <strong>administrator IT</strong> sekolah untuk melakukan pendaftaran akun baru atau mereset password Anda.
                        </p>

                        {/* Confirm Button */}
                        <button
                            onClick={() => setShowContactInfo(false)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/10"
                        >
                            Saya Mengerti
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}