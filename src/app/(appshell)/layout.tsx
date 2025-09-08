import Sidebar from "@/components/sidebar"
import { EnquiriesProvider } from "@/context/enquiries"

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar />
            <main className="flex-1 min-h-screen p-6 md:p-0">
                <EnquiriesProvider>{children}</EnquiriesProvider>
            </main>
        </div>
    )
}
