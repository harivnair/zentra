import { EnquiriesProvider } from "@/context/enquiries";
import NavigationLoader from "@/components/navigation-loader";
import { EstimatePrefillProvider } from "@/context/estimate-prefill";
import { EventPrefillProvider } from "@/context/event-prefill";
import ProtectedRoute from "@/components/protected-route";
import { ReactNode } from "react";
import { AppShellHeader, AppShellSidebar } from "@/components/layout";

export default function AppShellLayout({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen flex-col overflow-hidden">
                <AppShellHeader />
                <div className="flex min-h-0 flex-1">
                    <AppShellSidebar />
                    <main className="flex-1 overflow-y-auto bg-background">
                        <EventPrefillProvider>
                            <EstimatePrefillProvider>
                                <EnquiriesProvider>
                                    <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                                        {children}
                                    </div>
                                </EnquiriesProvider>
                            </EstimatePrefillProvider>
                        </EventPrefillProvider>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
