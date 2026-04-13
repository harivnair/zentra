import { roleScopeMap } from "@/config/permissions";
import { useAuth } from "@/context/auth";
import { Role, Scope } from "@/types/auth";
import { ReactNode } from "react";

interface AccessProps {
    roles?: Role[];
    scopes?: Scope[];
    children: ReactNode | ((hasAccess: boolean) => ReactNode);
}

export const Access = ({ roles, scopes, children }: AccessProps) => {
    const { user } = useAuth();

    // Calculate access permission
    let hasAccess = false;
    if (user) {
        const userRole = user.role as Role;

        // Check if user's role is in the allowed roles
        const roleAllowed = !roles || roles.includes(userRole);

        // Super admin has access to all scopes
        if (userRole === "super_admin") {
            hasAccess = roleAllowed;
        } else {
            // Get scopes for the user's role
            const userScopes = roleScopeMap[userRole] || [];

            // Check if all required scopes are available for the user's role
            const scopeAllowed = !scopes || scopes.every(scope => userScopes.includes(scope));

            hasAccess = roleAllowed && scopeAllowed;
        }
    }

    // If children is a function (render prop pattern), call it with hasAccess
    if (typeof children === "function") {
        return <>{children(hasAccess)}</>;
    }

    // If children is a ReactNode (original pattern), conditionally render
    return hasAccess ? <>{children}</> : null;
};
