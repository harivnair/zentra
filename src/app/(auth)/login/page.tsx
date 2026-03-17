"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, authLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(userID, password);
            toast.success("Login successful! Redirecting to dashboard...");
            router.push("/dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log("Login with Google");
    };

    return (
        <form
            className="mx-auto grid w-full max-w-sm gap-6 rounded-md shadow-xl p-8 animate-fadein backdrop-blur-md"
            style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                background: "white",
            }}
            onSubmit={handleLogin}
        >
            <div className="grid gap-2 text-center">
                <div className="flex items-center justify-center">
                    <Image
                        src="/zentra-logo.jpg"
                        alt="zentra"
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                    />
                </div>
                <h1 className="text-2xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground text-xs">Welcome back! Let&apos;s get you signed in</p>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                    {error}
                </div>
            )}
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="text-sm" htmlFor="userID">
                        User ID
                    </Label>
                    <Input
                        id="userID"
                        type="text"
                        placeholder="Enter your user ID"
                        required
                        value={userID}
                        onChange={e => setUserID(e.target.value)}
                        className="focus:ring-2 focus:ring-green-400 focus:border-green-400 placeholder:text-xs"
                    />
                </div>
                <div className="grid gap-2">
                    <Label className="text-sm" htmlFor="password">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="focus:ring-2 focus:ring-green-400 focus:border-green-400 pr-10 placeholder:text-xs"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                            tabIndex={-1}
                            onClick={() => setShowPassword(v => !v)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="inline-block text-xs underline"
                            style={{
                                color: "var(--app-secondary)",
                                textDecoration: "none",
                            }}
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>
                <LoadingButton
                    fullWidth
                    loading={loading}
                    loadingLabel="Logging in..."
                    className="border-0 bg-[var(--app-primary)] text-white hover:bg-[var(--app-primary-hover)] transition-colors"
                >
                    Login
                </LoadingButton>
                <div className="flex items-center gap-2">
                    <div className="h-px bg-gray-300 flex-1" />
                    <span className="text-xs text-gray-500 font-medium">OR</span>
                    <div className="h-px bg-gray-300 flex-1" />
                </div>
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    type="button"
                    onClick={handleGoogleLogin}
                >
                    <Image src="/icons/google-logo.svg" alt="Google" width={16} height={16} />
                    <span>Login with Google</span>
                </Button>
            </div>
        </form>
    );
}
