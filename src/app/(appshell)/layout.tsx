"use client";
import { EnquiriesProvider } from "@/context/enquiries";
import NavigationLoader from "@/components/navigation-loader";
import { EstimatePrefillProvider } from "@/context/estimate-prefill";
import { EventPrefillProvider } from "@/context/event-prefill";
import ProtectedRoute from "@/components/protected-route";
import { ReactNode } from "react";
import { AppShellHeader, AppShellSidebar } from "@/components/layout";
import { Access } from "@/components/access";
import { usePathname } from "next/navigation";
import { routePermissions } from "@/config/permissions";

export default function AppShellLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Get permissions for current route
    const currentRoutePermissions = routePermissions[pathname];

    return (
        <ProtectedRoute>
            <div className="flex h-screen flex-col overflow-hidden">
                <AppShellHeader />
                <div className="flex min-h-0 flex-1">
                    <NavigationLoader />
                    <AppShellSidebar />
                    <main className="flex-1 overflow-y-auto bg-background">
                        <EventPrefillProvider>
                            <EstimatePrefillProvider>
                                <EnquiriesProvider>
                                    <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
                                                                    You don&apos;t have permission
                                                                    to access this page.
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
            </div>
        </ProtectedRoute>
    );
}
