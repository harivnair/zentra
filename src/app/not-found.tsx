import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <h1 className="text-6xl font-bold text-foreground">404</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/" className="mt-8">
                <Button>Go Home</Button>
            </Link>
        </div>
    );
}
