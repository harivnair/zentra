import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { apiRequest } from "@/lib/api/api-client";

interface ClientDetailData {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    poc: string;
    gst: string;
    pan: string;
    gstCertificate: string;
}

interface ClientDetailViewProps {
    clientId: string | undefined | null;
    clientName?: string;
}

export function ClientDetailView({ clientId, clientName }: ClientDetailViewProps) {
    const [clientData, setClientData] = useState<ClientDetailData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!clientId) {
            setClientData(null);
            setError(null);
            return;
        }

        let cancelled = false;

        const fetchClient = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiRequest(API_ENDPOINTS.clients.get(clientId));
                if (!res.ok) {
                    throw new Error(`Failed to fetch client: ${res.status}`);
                }
                const data = (await res.json()) as ClientDetailData;
                if (!cancelled) {
                    setClientData(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load client details");
                    setClientData(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (!clientData) {
            fetchClient();
        }

        return () => {
            cancelled = true;
        };
    }, [clientId]);

    if (!clientId || !clientData) {
        return (
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Name</p>
                <p className="text-sm font-medium text-foreground">{clientName || "-"}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-muted-foreground">Loading client details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2 text-destructive">
                    <User className="w-6 h-6" />
                    <p className="text-xs">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Name</p>
                <p className="text-sm font-medium text-foreground">{clientData.name ?? "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">
                    Contact Person
                </p>
                <p className="text-sm font-medium text-foreground">{clientData.poc ?? "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Phone</p>
                <p className="text-sm font-medium text-foreground">{clientData.phone ?? "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Email</p>
                <p className="text-sm font-medium text-foreground">{clientData.email ?? "-"}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Address</p>
                <p className="text-sm font-medium text-foreground">{clientData.address ?? "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">GST</p>
                <p className="text-sm font-medium text-foreground">{clientData.gst || "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">PAN</p>
                <p className="text-sm font-medium text-foreground">{clientData.pan || "-"}</p>
            </div>
            <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">
                    GST Certificate
                </p>
                <p className="text-sm font-medium text-foreground">
                    {clientData.gstCertificate ? (
                        <span className="text-primary text-xs">Available</span>
                    ) : (
                        "-"
                    )}
                </p>
            </div>
        </div>
    );
}
