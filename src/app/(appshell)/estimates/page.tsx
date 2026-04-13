"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui-old/button";
import DropdownMenu from "@/components/ui-old/dropdown-menu";
import CreateEstimateModal from "@/components/create-estimate-modal";
import { EstimateVersionsView } from "@/components/estimate-versions-view";
import { EstimateDto, EstimateItem } from "@/types/estimate";
import { ListSkeleton, TableRowSkeleton } from "@/components/skeleton-loader";
import { useEstimatePrefill } from "@/context/estimate-prefill";
import { showConfirmation } from "@/components/confirmation-toast";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { DollarSign } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { apiRequest } from "@/lib/api/api-client";

type EstimateRecord = EstimateDto & {
    clientName?: string;
    enquiryId?: string;
    assignee?: string;
};

type StatusTab = "open" | "cancelled" | "closed";

const statusLabelMap: Record<StatusTab, string> = {
    open: "Open",
    cancelled: "Cancelled",
    closed: "Closed",
};

const statusPillColor = (status: string | undefined) => {
    const normalized = (status ?? "").toUpperCase();
    if (normalized === "IN_PROGRESS" || normalized === "OPEN") {
        return "bg-yellow-100 text-yellow-800";
    }
    if (normalized === "CLOSED" || normalized === "APPROVED") {
        return "bg-emerald-100 text-emerald-700";
    }
    if (normalized === "CANCELLED" || normalized === "REJECTED") {
        return "bg-red-100 text-red-700";
    }
    return "bg-gray-200 text-gray-700";
};

const normaliseEstimate = (raw: Record<string, unknown>): EstimateRecord => {
    const get = <T,>(paths: string[], fallback: T): T => {
        for (const key of paths) {
            if (key in raw && raw[key] !== undefined && raw[key] !== null) {
                return raw[key] as T;
            }
        }
        return fallback;
    };

    const clientRaw = get<unknown>(["client", "customer", "clientInfo"], null);
    let clientName: string | undefined;
    let clientId: string | undefined;
    if (typeof clientRaw === "string") {
        clientName = clientRaw;
    } else if (clientRaw && typeof clientRaw === "object") {
        const c = clientRaw as { name?: string; id?: string };
        clientName = c.name;
        clientId = c.id;
    }

    const status = get<string | undefined>(["status", "estimateStatus", "state"], undefined);

    const itemsRaw = get<Record<string, unknown> | undefined>(["items"], undefined);
    const items =
        itemsRaw && typeof itemsRaw === "object"
            ? Object.entries(itemsRaw as Record<string, unknown>).reduce<
                  Record<string, EstimateItem[]>
              >((acc, [category, value]) => {
                  if (!Array.isArray(value)) return acc;
                  acc[category] = value.map((item, index) => {
                      const entry = item as Record<string, unknown>;
                      const quantity =
                          typeof entry.quantity === "number"
                              ? entry.quantity
                              : Number(entry.quantity ?? 0);
                      const unitCost =
                          typeof entry.unitCost === "number"
                              ? entry.unitCost
                              : Number(entry.unitCost ?? 0);
                      return {
                          id: String(entry.id ?? `${category}-${index}`),
                          description: String(entry.description ?? "Line item"),
                          quantity: Number.isFinite(quantity) ? quantity : 0,
                          unitCost: Number.isFinite(unitCost) ? unitCost : 0,
                          total: Number.isFinite(quantity * unitCost)
                              ? Number((quantity * unitCost).toFixed(2))
                              : 0,
                      };
                  });
                  return acc;
              }, {})
            : undefined;

    return {
        id: get<string | undefined>(["id", "estimateId"], undefined),
        enquiryId: get<string | undefined>(["enquiryId", "enquiry_id"], undefined),
        title: get<string | undefined>(["title", "eventName", "eventTitle"], undefined),
        highlvelRequirement: get<string>(["highlvelRequirement", "summary", "title"], ""),
        enquiryDate: get<string | undefined>(["enquiryDate", "createdAt"], undefined),
        fromDate: get<string | undefined>(["fromDate", "eventStart"], undefined),
        toDate: get<string | undefined>(["toDate", "eventEnd"], undefined),
        status: status ? (status.toUpperCase() as EstimateDto["status"]) : undefined,
        location: get<string | undefined>(["location", "eventLocation", "city"], undefined),
        venue: get<string>(["venue", "location"], ""),
        clientPoC: get<string>(["clientPoC", "clientContact"], ""),
        pocContactNumber: get<string>(["pocContactNumber", "clientPhone", "contactNumber"], ""),
        enquiryPoC: get<string | undefined>(["enquiryPoC", "internalPoC"], undefined),
        client:
            clientRaw && typeof clientRaw === "object"
                ? (clientRaw as { id?: string; name?: string })
                : clientId || clientName
                ? { id: clientId, name: clientName }
                : undefined,
        items,
        clientName: clientName ?? String(get<string | undefined>(["clientName"], clientId ?? "")),
        assignee: get<string | undefined>(["assignee", "owner", "assignedTo"], undefined),
        // Versioning fields
        version: get<string | undefined>(["version"], undefined),
        estimateStatus: get<"DRAFT" | "UNDER_CLIENT_REVIEW" | "FINAL" | undefined>(
            ["estimateStatus"],
            undefined
        ),
        clonedFromEstimateId: get<string | null | undefined>(["clonedFromEstimateId"], undefined),
        createdAt: get<string | undefined>(["createdAt"], undefined),
        updatedAt: get<string | undefined>(["updatedAt"], undefined),
    };
};

export default function EstimatesPage() {
    const { prefill: contextPrefill, clearPrefill } = useEstimatePrefill();
    const { user } = useAuth();

    const [tab, setTab] = useState<StatusTab>("open");
    const [estimates, setEstimates] = useState<EstimateRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prefill, setPrefill] = useState<
        (Partial<EstimateDto> & { enquiryId?: string }) | undefined
    >(undefined);
    const [versionsViewEnquiryId, setVersionsViewEnquiryId] = useState<string | null>(null);

    const refreshEstimates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest(API_ENDPOINTS.estimates.list, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            const data = await res.json();
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.content)
                ? data.content
                : [];
            const normalised = (list as Record<string, unknown>[]).map(normaliseEstimate);
            setEstimates(normalised);
        } catch (err) {
            console.error("Failed to load estimates", err);
            setError("Unable to load estimates right now. Displaying recent draft data.");
            setEstimates([
                normaliseEstimate({
                    id: "draft-1",
                    enquiryId: "ENQ-101",
                    highlvelRequirement: "Product Team Workshop",
                    enquiryDate: "2025-06-25T09:00:00Z",
                    clientPoC: "Invoice Creation",
                    location: "Downtown",
                    status: "IN_PROGRESS",
                    venue: "Downtown Convention Center",
                    client: { name: "Acme Corp" },
                    assignee: "Arjun PS",
                }),
                normaliseEstimate({
                    id: "draft-2",
                    enquiryId: "ENQ-093",
                    highlvelRequirement: "Annual Gala Dinner",
                    enquiryDate: "2025-06-25T10:00:00Z",
                    clientPoC: "Invoice Creation",
                    location: "City Center",
                    status: "NOT_STARTED",
                    venue: "Grand Ballroom",
                    client: { name: "Gala Events" },
                    assignee: "Athel Mathew",
                }),
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshEstimates();
    }, [refreshEstimates]);

    useEffect(() => {
        if (contextPrefill) {
            setPrefill(contextPrefill);
            setIsModalOpen(true);
            clearPrefill();
        }
    }, [contextPrefill, clearPrefill]);

    const counts = useMemo(() => {
        const counter: Record<StatusTab, number> = {
            open: 0,
            cancelled: 0,
            closed: 0,
        };
        for (const est of estimates) {
            const status = (est.status ?? "").toLowerCase();
            if (status === "cancelled") counter.cancelled += 1;
            else if (status === "closed" || status === "approved") counter.closed += 1;
            else counter.open += 1;
        }
        return counter;
    }, [estimates]);

    const filtered = useMemo(() => {
        return estimates.filter(est => {
            const status = (est.status ?? "").toLowerCase();
            if (tab === "cancelled") return status === "cancelled";
            if (tab === "closed") return status === "closed" || status === "approved";
            return status !== "cancelled" && status !== "closed" && status !== "approved";
        });
    }, [estimates, tab]);

    // Group estimates by enquiryId and select representative version
    const groupedEstimates = useMemo(() => {
        const groups = new Map<string, EstimateRecord[]>();

        // Group by enquiryId
        for (const est of filtered) {
            const enquiryId = est.enquiryId || est.id || "unknown";
            if (!groups.has(enquiryId)) {
                groups.set(enquiryId, []);
            }
            groups.get(enquiryId)!.push(est);
        }

        // For each group, select the representative estimate
        const representatives: EstimateRecord[] = [];
        for (const [, versions] of groups.entries()) {
            // Sort versions by version number (v1, v2, v3...)
            const sorted = versions.sort((a, b) => {
                const versionA = parseInt(a.version?.replace("v", "") || "0");
                const versionB = parseInt(b.version?.replace("v", "") || "0");
                return versionB - versionA; // Descending order (latest first)
            });

            // Find FINAL version if exists
            const finalVersion = sorted.find(v => v.estimateStatus === "FINAL");

            // Use FINAL if exists, otherwise use latest (first in sorted array)
            const representative = finalVersion || sorted[0];

            // Add metadata about versions count
            const representativeWithMeta = {
                ...representative,
                _versionsCount: versions.length,
                _hasFinal: !!finalVersion,
            };

            representatives.push(representativeWithMeta);
        }

        return representatives;
    }, [filtered]);

    const openCreateModal = () => {
        clearPrefill();
        setPrefill(undefined);
        setIsModalOpen(true);
    };

    const handleSavedEstimate = async () => {
        setIsModalOpen(false);
        setPrefill(undefined);
        // Refresh the estimates list from server to get the latest data
        await refreshEstimates().catch(err =>
            console.warn("Failed to refresh estimates after save", err)
        );
        toast.success("Estimate saved successfully");
    };

    const handleDeleteEstimate = async (id: string | undefined) => {
        if (!id) {
            alert("Cannot delete estimate without an ID");
            return;
        }

        showConfirmation({
            title: "Delete Estimate",
            description:
                "Are you sure you want to delete this estimate? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const res = await apiRequest(`/api/estimates/${encodeURIComponent(id)}`, {
                        method: "DELETE",
                    });
                    if (!res.ok) {
                        const txt = await res.text().catch(() => "");
                        throw new Error(`Delete failed: ${res.status} ${txt}`);
                    }
                    // Remove from UI
                    setEstimates(prev => prev.filter(e => String(e.id) !== String(id)));
                    toast.success("Estimate deleted successfully");
                } catch (err) {
                    console.error("Failed to delete estimate", err);
                    toast.error("Failed to delete estimate");
                }
            },
        });
    };

    const getDropdownItems = (
        estimate: EstimateRecord
    ): Array<{
        label: string;
        icon: string;
        action: () => void;
        variant?: "default" | "danger";
    }> => {
        const items: Array<{
            label: string;
            icon: string;
            action: () => void;
            variant?: "default" | "danger";
        }> = [
            {
                label: "Edit",
                icon: "✏️",
                action: () => {
                    setPrefill(estimate);
                    setIsModalOpen(true);
                },
            },
        ];

        // Add "View Versions" if estimate has an enquiryId
        if (estimate.enquiryId) {
            items.push({
                label: "View Versions",
                icon: "�",
                action: () => setVersionsViewEnquiryId(estimate.enquiryId || null),
            });
        }

        items.push({
            label: "Delete",
            icon: "🗑️",
            variant: "danger",
            action: () => handleDeleteEstimate(estimate.id),
        });

        return items;
    };

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            Hi, {user?.name || user?.uid || "User"}!
                        </h2>
                        <p className="text-muted-foreground">
                            You have {counts.open} Open{" "}
                            {counts.open === 1 ? "Estimate" : "Estimates"} this week
                        </p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                    >
                        + Create New Estimate
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <nav className="flex gap-6 border-b">
                    {(Object.keys(statusLabelMap) as StatusTab[]).map(key => {
                        const disabled = counts[key] === 0;
                        return (
                            <button
                                key={key}
                                onClick={() => !disabled && setTab(key)}
                                aria-disabled={disabled}
                                title={
                                    disabled ? `No ${statusLabelMap[key]} estimates yet` : undefined
                                }
                                className={`pb-3 text-sm font-medium ${
                                    tab === key
                                        ? "border-b-2 border-black"
                                        : "text-muted-foreground"
                                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                {statusLabelMap[key]}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-6 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:hidden">
                        {loading && <ListSkeleton type="cards" items={4} />}
                        {error && (
                            <div className="p-4 text-red-600 bg-red-50 border border-red-100 rounded">
                                {error}
                            </div>
                        )}
                        {!loading && !error && groupedEstimates.length === 0 && (
                            <div className="p-4 text-muted-foreground">No estimates found.</div>
                        )}

                        {!loading &&
                            !error &&
                            groupedEstimates.map(estimate => (
                                <div
                                    key={estimate.id ?? estimate.highlvelRequirement}
                                    className="border rounded-md p-4 space-y-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                    onClick={() =>
                                        estimate.enquiryId &&
                                        setVersionsViewEnquiryId(estimate.enquiryId)
                                    }
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-900">
                                                    {estimate.highlvelRequirement ||
                                                        "Untitled Estimate"}
                                                </div>
                                                {estimate.version && (
                                                    <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                        {estimate.version}
                                                    </span>
                                                )}
                                                {(
                                                    estimate as EstimateRecord & {
                                                        _versionsCount?: number;
                                                    }
                                                )._versionsCount &&
                                                    (
                                                        estimate as EstimateRecord & {
                                                            _versionsCount?: number;
                                                        }
                                                    )._versionsCount! > 1 && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                            {
                                                                (
                                                                    estimate as EstimateRecord & {
                                                                        _versionsCount?: number;
                                                                    }
                                                                )._versionsCount
                                                            }{" "}
                                                            versions
                                                        </span>
                                                    )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {estimate.clientName ??
                                                    estimate.client?.name ??
                                                    "Unknown Client"}
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusPillColor(
                                                estimate.status
                                            )}`}
                                        >
                                            {(estimate.status ?? "Draft").replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    {estimate.estimateStatus && (
                                        <span
                                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                estimate.estimateStatus === "FINAL"
                                                    ? "bg-green-100 text-green-800"
                                                    : estimate.estimateStatus ===
                                                      "UNDER_CLIENT_REVIEW"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {estimate.estimateStatus.replace(/_/g, " ")}
                                        </span>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                        {estimate.enquiryDate
                                            ? new Date(estimate.enquiryDate).toLocaleString()
                                            : "No enquiry date"}
                                    </div>
                                    <div className="text-sm">
                                        Client POC:{" "}
                                        <span className="font-medium">
                                            {estimate.clientPoC || "N/A"}
                                        </span>
                                    </div>
                                    {estimate.assignee && (
                                        <div className="text-sm">
                                            Assignee:{" "}
                                            <span className="font-medium">{estimate.assignee}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>

                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="py-3">Event Name</th>
                                    <th className="py-3">Enquiry Date</th>
                                    <th className="py-3">Client POC</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Assignee</th>
                                    <th className="py-3 text-right">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <TableRowSkeleton rows={6} />}
                                {error && !loading && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && groupedEstimates.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No estimates found.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    !error &&
                                    groupedEstimates.map((estimate, index) => (
                                        <tr
                                            key={
                                                estimate.id ??
                                                `${estimate.highlvelRequirement}-${index}`
                                            }
                                            className={`border-t ${
                                                index === 0 ? "bg-blue-50/50" : "hover:bg-gray-50"
                                            } cursor-pointer`}
                                        >
                                            <td
                                                className="py-4"
                                                onClick={() =>
                                                    estimate.enquiryId &&
                                                    setVersionsViewEnquiryId(estimate.enquiryId)
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {estimate.highlvelRequirement ||
                                                                "Untitled Estimate"}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {estimate.clientName ??
                                                                estimate.client?.name ??
                                                                "Unknown client"}
                                                        </div>
                                                    </div>
                                                    {estimate.version && (
                                                        <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                            {estimate.version}
                                                        </span>
                                                    )}
                                                    {(
                                                        estimate as EstimateRecord & {
                                                            _versionsCount?: number;
                                                        }
                                                    )._versionsCount &&
                                                        (
                                                            estimate as EstimateRecord & {
                                                                _versionsCount?: number;
                                                            }
                                                        )._versionsCount! > 1 && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                                {
                                                                    (
                                                                        estimate as EstimateRecord & {
                                                                            _versionsCount?: number;
                                                                        }
                                                                    )._versionsCount
                                                                }{" "}
                                                                versions
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td
                                                className="py-4"
                                                onClick={() =>
                                                    estimate.enquiryId &&
                                                    setVersionsViewEnquiryId(estimate.enquiryId)
                                                }
                                            >
                                                {estimate.enquiryDate
                                                    ? new Date(
                                                          estimate.enquiryDate
                                                      ).toLocaleDateString(undefined, {
                                                          month: "long",
                                                          day: "numeric",
                                                          year: "numeric",
                                                      })
                                                    : "—"}
                                            </td>
                                            <td
                                                className="py-4"
                                                onClick={() =>
                                                    estimate.enquiryId &&
                                                    setVersionsViewEnquiryId(estimate.enquiryId)
                                                }
                                            >
                                                {estimate.clientPoC || "—"}
                                            </td>
                                            <td
                                                className="py-4"
                                                onClick={() =>
                                                    estimate.enquiryId &&
                                                    setVersionsViewEnquiryId(estimate.enquiryId)
                                                }
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusPillColor(
                                                            estimate.status
                                                        )}`}
                                                    >
                                                        {(estimate.status ?? "Draft").replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </span>
                                                    {estimate.estimateStatus && (
                                                        <span
                                                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                estimate.estimateStatus === "FINAL"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : estimate.estimateStatus ===
                                                                      "UNDER_CLIENT_REVIEW"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {estimate.estimateStatus.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td
                                                className="py-4"
                                                onClick={() =>
                                                    estimate.enquiryId &&
                                                    setVersionsViewEnquiryId(estimate.enquiryId)
                                                }
                                            >
                                                {estimate.assignee ?? "Unassigned"}
                                            </td>
                                            <td
                                                className="py-4 text-right"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <DropdownMenu items={getDropdownItems(estimate)} />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateEstimateModal
                isOpen={isModalOpen}
                onClose={async () => {
                    setIsModalOpen(false);
                    setPrefill(undefined);
                    clearPrefill();
                    // Refresh estimates list when modal closes to ensure latest data is shown
                    await refreshEstimates().catch(err =>
                        console.warn("Failed to refresh estimates on close", err)
                    );
                }}
                initialData={prefill}
                onSaved={handleSavedEstimate}
            />

            {versionsViewEnquiryId && (
                <EstimateVersionsView
                    enquiryId={versionsViewEnquiryId}
                    onVersionSelect={estimate => {
                        setPrefill(estimate);
                        setIsModalOpen(true);
                        setVersionsViewEnquiryId(null);
                    }}
                    onClose={async () => {
                        setVersionsViewEnquiryId(null);
                        // Refresh estimates list when versions view closes
                        await refreshEstimates().catch(err =>
                            console.warn("Failed to refresh estimates on versions close", err)
                        );
                    }}
                />
            )}
        </div>
    );
}
