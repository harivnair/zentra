import { useAuth } from "@/context/auth";
import { Role, Scope } from "@/types/auth";
import { ReactNode } from "react";
import { hasPermission } from "@/lib/utils/permissions";

interface AccessProps {
    roles?: Role[];
    scopes?: Scope[];
    children: ReactNode | ((hasAccess: boolean) => ReactNode);
}

export const Access = ({ roles, scopes, children }: AccessProps) => {
    const { user } = useAuth();

    // Calculate access permission using the utility function
    const hasAccess = hasPermission(user, roles, scopes);

    // If children is a function (render prop pattern), call it with hasAccess
    if (typeof children === "function") {
        return <>{children(hasAccess)}</>;
    }

    // If children is a ReactNode (original pattern), conditionally render
    return hasAccess ? <>{children}</> : null;
};
