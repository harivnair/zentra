import { redirect } from "next/navigation"

export default function RootPage() {
    // Default to dashboard; in a real app you'd check auth and redirect to login
    redirect('/dashboard')
}
