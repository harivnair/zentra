
type AuthLayoutProps = {
    illustration?: string
    children: React.ReactNode
}

export default function AuthLayout({ illustration, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left illustration: hidden on small, large screens shows ~2/3 width */}
            <div
                className="hidden lg:block lg:flex-[2] bg-cover bg-center"
                style={{
                    backgroundImage: `url(${illustration})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            />

            {/* Right column: top-aligned, narrow form column on large screens */}
            <div className="w-full lg:flex-[1] flex items-center justify-start bg-white">
                <div className="w-full px-6 py-12 lg:py-20 lg:pl-12">{children}</div>
            </div>
        </div>
    )
}
