import { Button, type ButtonProps } from "../ui/button";
import { Access } from "@/components/access";
import { Scope } from "@/types/auth";

interface AccessButtonProps extends ButtonProps {
    scope: Scope[];
}

export const AccessButton = ({ scope, children, ...props }: AccessButtonProps) => {
    const scopes = scope ? (Array.isArray(scope) ? scope : [scope]) : undefined;

    return (
        <Access scopes={scopes}>
            <Button {...props}>{children}</Button>
        </Access>
    );
};
