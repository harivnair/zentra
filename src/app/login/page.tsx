"use client"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setTimeout(() => {
            setLoading(false)
            if (!email || !password) {
                setError("Please enter both email and password.")
            } else {
                setError(null)
            }
        }, 1200)
    }
    return (
        <>
            <div className="relative min-h-screen w-full" style={{ background: "linear-gradient(135deg, #FFFDE4 0%, #FFE5B4 60%, #FFD1DC 100%)" }}>
                {/* Mobile: SVG fills background */}
                <div className="absolute inset-0 z-0 lg:hidden w-full h-full">
                    <Image
                        src="/login-page.png"
                        alt="Login background"
                        fill={true}
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-gray-100/40 to-gray-200/30" />
                </div>
                <div className="relative z-10 w-full lg:grid lg:min-h-screen lg:grid-cols-2 flex items-center justify-center min-h-screen">
                    {/* Desktop: SVG fills left side with gradient overlay */}
                    <div className="hidden lg:block h-full w-full relative">
                        <Image
                            src="/login-page.png"
                            alt="Login background"
                            fill={true}
                            style={{ objectFit: "cover", objectPosition: "center" }}
                            className="w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-gray-100/40 to-gray-200/30" />
                    </div>
                    <div className="flex items-center justify-center p-4 sm:p-12 min-h-screen">
                        <form
                            className="mx-auto grid w-full max-w-sm gap-6 rounded-2xl shadow-xl p-8 animate-fadein backdrop-blur-md"
                            style={{
                                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                                background: "rgba(255,255,255,0.7)"
                            }}
                            onSubmit={handleLogin}
                        >
                            <div className="grid gap-2 text-center">
                                <div className="flex items-center justify-center">
                                    <Image src="/zentra-logo.jpg" alt="zentra" width={72} height={72} className="rounded-md object-cover" />
                                </div>
                                <h1 className="text-3xl font-bold">Login</h1>
                                <p className="text-balance text-muted-foreground">
                                    Enter your email below to login to your account
                                </p>
                            </div>
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2 text-sm">{error}</div>}
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="ml-auto inline-block text-sm underline"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(v => !v)}
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                                            Logging in...
                                        </span>
                                    ) : "Login"}
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Login with Google
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
                <style jsx global>{`
                    @keyframes fadein {
                        from { opacity: 0; transform: translateY(24px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadein {
                        animation: fadein 0.7s cubic-bezier(.4,0,.2,1);
                    }
                `}</style>
            </div>
        </>
    )

}
