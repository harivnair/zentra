"use client";
import Sidebar from "@/components/sidebar";
import { EnquiriesProvider } from "@/context/enquiries";
import NavigationLoader from "@/components/navigation-loader";
import { EstimatePrefillProvider } from "@/context/estimate-prefill";
import { EventPrefillProvider } from "@/context/event-prefill";
import ProtectedRoute from "@/components/protected-route";
import { ThemeToggle } from "@/components/theme-toggle";
import { Access } from "@/components/access";
import { routePermissions } from "@/lib/permissions";
import { usePathname } from "next/navigation";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Get permissions for current route
    const currentRoutePermissions = routePermissions[pathname];

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
                                <div className="page-enter">
                                    <Access
                                        roles={currentRoutePermissions.roles}
                                        scopes={currentRoutePermissions.scopes}
                                    >
                                        {hasAccess => {
                                            if (!hasAccess) {
                                                return (
                                                    <div className="flex items-center justify-center min-h-screen">
                                                        <div className="text-center">
                                                            <h1 className="text-2xl font-bold text-red-600 mb-4">
                                                                Unauthorized Access
                                                            </h1>
                                                            <p className="text-muted-foreground">
                                                                You don&apos;t have permission to access this page.
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return children;
                                        }}
                                    </Access>
                                </div>
                            </EnquiriesProvider>
                        </EstimatePrefillProvider>
                    </EventPrefillProvider>
                </main>
            </div>
        </ProtectedRoute>
    );
}
