"use client";

import { Card, CardHeader, CardContent } from "./card";

interface InfoCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function InfoCard({ title, icon, children }: InfoCardProps) {
    return (
        <Card variant="bordered" className="transition-shadow duration-200 hover:shadow-sm">
            {title && (
                <CardHeader className="flex flex-row items-center gap-2 px-4 py-2.5 sm:px-5">
                    {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                </CardHeader>
            )}
            <CardContent className="px-4 py-3 sm:px-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0 [&>:first-child]:pt-0 sm:[&>:nth-child(-n+2)]:pt-0">
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}
