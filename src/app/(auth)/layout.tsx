"use client"

import Image from "next/image"

/**
 * Shared layout for auth routes (login, forgot-password): gradient background,
 * left-side banner image on desktop, right-side content area.
 * Route group (auth) keeps URLs as /login and /forgot-password.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div
                className="relative min-h-screen w-full"
                style={{
                    background:
                        "linear-gradient(135deg, #859fc7 0%, #d7dbdd 60%, #FFD1DC 100%)",
                }}
            >
                <div className="absolute inset-0 z-0 w-full h-full lg:hidden">
                    <Image
                        src="/login-page-banner.png"
                        alt=""
                        fill
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        className="w-full h-full"
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-gray-100/40 to-gray-200/30" />
                </div>
                <div className="relative z-10 w-full lg:grid lg:min-h-screen lg:grid-cols-2 flex items-center justify-center min-h-screen">
                    <div className="hidden lg:block h-full w-full relative rounded-tr-3xl rounded-br-3xl overflow-hidden">
                        <Image
                            src="/login-page-banner.png"
                            alt=""
                            fill
                            style={{ objectFit: "cover", objectPosition: "center" }}
                            className="w-full h-full"
                            loading="eager"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-gray-100/40 to-gray-200/30" />
                    </div>
                    <div className="flex items-center justify-center p-4 sm:p-12 min-h-screen w-full">
                        {children}
                    </div>
                </div>
                <style jsx global>{`
                    @keyframes fadein {
                        from {
                            opacity: 0;
                            transform: translateY(24px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fadein {
                        animation: fadein 0.7s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                `}</style>
            </div>
        </>
    )
}
