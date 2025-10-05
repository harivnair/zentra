import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    return (
        <div className="relative min-h-screen w-full">
            <div className="absolute inset-0 z-0 lg:hidden flex items-center justify-center overflow-hidden">
                <div className="w-full h-full transform-gpu transition-transform duration-700 ease-out scale-105">
                    <Image
                        src="/event-home.svg"
                        alt="Background"
                        fill={true}
                        style={{ objectFit: "cover", transform: "scale(1.08)", objectPosition: "center" }}
                        className="opacity-30"
                    />
                </div>
            </div>
            <div className="relative z-10 w-full lg:grid lg:min-h-screen lg:grid-cols-2 flex items-center justify-center min-h-screen">
                {/* Desktop: background video (md+) with poster fallback */}
                <div className="hidden md:block bg-muted lg:block">
                    <div className="h-full w-full flex items-center justify-center overflow-hidden relative">
                        <video
                            className="bg-video absolute inset-0 w-full h-full object-cover transform-gpu"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster="/event-home-poster.jpg"
                            aria-hidden="true"
                        >
                            <source src="/videos/bg-loop.webm" type="video/webm" />
                            <source src="/videos/bg-loop.mp4" type="video/mp4" />
                        </video>

                        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

                        <div className="relative z-10 h-full w-full flex items-center justify-center overflow-hidden">
                            <div className="transform-gpu transition-transform duration-700 ease-out scale-105">
                                <Image
                                    src="/event-home.svg"
                                    alt="Image"
                                    width={1920}
                                    height={1080}
                                    className="max-h-full max-w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                    style={{ transform: "scale(1.12)", objectPosition: "center" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center p-4 sm:p-12">
                    <div className="mx-auto grid w-full max-w-sm gap-6">
                        <div className="grid gap-2 text-center">
                            <div className="flex items-center justify-center">
                                <Image src="/zentra-logo.jpg" alt="zentra" width={72} height={72} className="rounded-md object-cover" />
                            </div>
                            <h1 className="text-3xl font-bold">Login</h1>
                            <p className="text-balance text-muted-foreground">
                                Enter your email below to login to your account
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
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
                                <Input id="password" type="password" required />
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <Button variant="outline" className="w-full">
                                Login with Google
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="#" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
