import Sidebar from "@/components/sidebar";
import { EnquiriesProvider } from "@/context/enquiries";
import NavigationLoader from "@/components/navigation-loader";
import { EstimatePrefillProvider } from "@/context/estimate-prefill";
import { EventPrefillProvider } from "@/context/event-prefill";
import ProtectedRoute from "@/components/protected-route";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen flex">
                <NavigationLoader />
                <Sidebar />
                <main className="flex-1 min-h-screen p-6 md:p-0 md:ml-60 relative">
                    {/* Floating theme toggle for the header area */}
                    <div className="absolute top-4 right-4 z-[100] md:top-6 md:right-6">
                        <ThemeToggle />
                    </div>
                    <EventPrefillProvider>
                        <EstimatePrefillProvider>
                            <EnquiriesProvider>
                                <div className="page-enter">{children}</div>
                            </EnquiriesProvider>
                        </EstimatePrefillProvider>
                    </EventPrefillProvider>
                </main>
            </div>
        </ProtectedRoute>
    );
}
