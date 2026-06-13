"use client";

import { Badge } from "./badge";
import { CopyButton } from "./copy-button";
import { PhoneLink } from "./phone-link";

interface InfoRowProps {
    icon?: React.ReactNode;
    label: string;
    value?: string | number | React.ReactNode | null;
    copyValue?: string | number;
    isPhone?: boolean;
    spanFull?: boolean;
}

export function InfoRow({ icon, label, value, copyValue, isPhone, spanFull }: InfoRowProps) {
    const isEmpty = value === undefined || value === null || value === "" || value === "-";

    return (
        <div
            className={`group flex items-start gap-2.5 py-2 first:pt-0 last:pb-0 ${spanFull ? "sm:col-span-2" : ""}`}
        >
            {icon && <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>}
            <div className="min-w-0 flex-1 w-full max-w-full break-words">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                {isEmpty ? (
                    <Badge variant="default" className="text-[11px] italic px-2 py-0 font-normal">
                        Not Assigned
                    </Badge>
                ) : isPhone ? (
                    <PhoneLink number={String(value)} />
                ) : (
                    <span className="inline-flex items-start text-sm font-medium text-foreground w-full">
                        <span className="break-words whitespace-pre-wrap">{value}</span>
                        {copyValue && <CopyButton text={copyValue} label={label} />}
                    </span>
                )}
            </div>
        </div>
    );
}
