import Sidebar from "@/components/sidebar"
import { EnquiriesProvider } from "@/context/enquiries"
import NavigationLoader from "@/components/navigation-loader"
import { EstimatePrefillProvider } from "@/context/estimate-prefill"
import { EventPrefillProvider } from "@/context/event-prefill"
import ProtectedRoute from "@/components/protected-route"

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex bg-gray-50">
                <NavigationLoader />
                <Sidebar />
                <main className="flex-1 min-h-screen p-6 md:p-0">
                    <EventPrefillProvider>
                        <EstimatePrefillProvider>
                            <EnquiriesProvider>{children}</EnquiriesProvider>
                        </EstimatePrefillProvider>
                    </EventPrefillProvider>
                </main>
            </div>
        </ProtectedRoute>
    )
}
