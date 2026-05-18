"use client";

import { useState, useEffect, useMemo } from "react";
import { EstimateDto, EstimateVersionStatus, EstimateItem } from "@/types/estimate";
import { Copy, Send, CheckCircle, Edit, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";
import { Button, Modal, ModalBody, ModalFooter } from "./ui";
import { Table, type Column } from "@/components/ui/table";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { useRouter } from "next/navigation";
import { AccessButton } from "./shared/access-button";
import { calculateEstimateSummary } from "@/lib/utils/estimate";

interface EstimateVersionsViewProps {
    enquiryId: string;
    onVersionSelect?: (estimate: EstimateDto) => void;
    onClose: () => void;
}

export function EstimateVersionsView({
    enquiryId,
    onVersionSelect,
    onClose,
}: EstimateVersionsViewProps) {
    const router = useRouter();
    const [versions, setVersions] = useState<EstimateDto[]>([]);
    const [eventName, setEventName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

    // Fetch versions on mount
    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        try {
            setLoading(true);
            const response = await apiRequest(`/api/estimates/by-enquiry/${enquiryId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch versions");
            }
            const data = (await response.json()) as { eventName: string; estimates: EstimateDto[] };
            setEventName(data.eventName || "");
            // Add eventName/title to each estimate for consistency
            const estimatesWithTitle = (data.estimates || []).map(est => ({
                ...est,
                title: est.title || data.eventName,
            }));
            setVersions(estimatesWithTitle);
        } catch (error) {
            console.error("Error fetching versions:", error);
            toast.error("Failed to load estimate versions");
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async (estimateId: string) => {
        try {
            const response = await apiRequest(`/api/estimates/${estimateId}/clone`, {
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to clone estimate");
            }
            const newVersion = (await response.json()) as EstimateDto;
            toast.success(`Created ${newVersion.version} successfully`);
            await fetchVersions();
        } catch (error) {
            console.error("Error cloning estimate:", error);
            toast.error("Failed to clone estimate");
        }
    };

    const handleStatusChange = async (estimateId: string, newStatus: EstimateVersionStatus) => {
        try {
            await apiRequest(`/api/estimates/${estimateId}/status?status=${newStatus}`, {
                method: "PATCH",
            });

            const statusLabels = {
                DRAFT: "Draft",
                UNDER_CLIENT_REVIEW: "Under Client Review",
                FINAL: "Final",
            };
            toast.success(`Status updated to ${statusLabels[newStatus]}`);
            await fetchVersions();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const toggleExpand = (versionId: string) => {
        const newExpanded = new Set(expandedVersions);
        if (newExpanded.has(versionId)) {
            newExpanded.delete(versionId);
        } else {
            newExpanded.add(versionId);
        }
        setExpandedVersions(newExpanded);
    };

    const getStatusBadgeColor = (status?: EstimateVersionStatus) => {
        switch (status) {
            case "DRAFT":
                return "bg-gray-100 text-gray-800";
            case "UNDER_CLIENT_REVIEW":
                return "bg-blue-100 text-blue-800";
            case "FINAL":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status?: EstimateVersionStatus) => {
        switch (status) {
            case "DRAFT":
                return "Draft";
            case "UNDER_CLIENT_REVIEW":
                return "Under Review";
            case "FINAL":
                return "Final";
            default:
                return "Unknown";
        }
    };

    const sortedVersions = useMemo(() => {
        const parseVersion = (v: string) => parseInt(v?.replace("v", ""), 10) || 0;

        return [...(versions || [])].sort((a, b) => {
            // 1. Priority: FINAL first
            if (a.estimateStatus !== b.estimateStatus) {
                return b.estimateStatus === "FINAL" ? 1 : -1;
            }

            // 2. Secondary: version sorting
            return parseVersion(a.version ?? "") - parseVersion(b.version ?? "");
        });
    }, [versions]);

    const handleCreateEvent = async (version: EstimateDto) => {
        if (!version) return;
        try {
            const payload = {
                title: version.title || version.highlvelRequirement || "Event",
                eventStartDate: version.fromDate,
                eventEndDate: version.toDate,
                location: version.location,
                venue: version.venue,
                client: version.client,
                enquiryId: version.enquiryId,
                estimateId: version.id,
                eventID: version.eventID, // Pass eventId if it exists to link the event with the enquiry's event (if any)
            };

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => "");
                throw new Error(`Failed to create event: ${res.status} ${errText}`);
            }

            const createdEvent = await res.json();

            if (createdEvent) {
                onClose();
                toast.success("Event created from estimate");
                router.push(`/events/${createdEvent.eventID}`); // Navigate to the newly created event's page
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create event";
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-lg p-8">
                    <p>Loading versions...</p>
                </div>
            </div>
        );
    }

    return (
        <Modal onClose={onClose} size="xxl" open title="Estimate Versions" description={eventName}>
            <ModalBody>
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {sortedVersions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No estimates found for this enquiry
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {sortedVersions.map(version => {
                                const isExpanded = expandedVersions.has(version.id || "");
                                const isFinal = version.estimateStatus === "FINAL";

                                return (
                                    <div
                                        key={version.id}
                                        className={`border rounded-lg p-4 ${
                                            isFinal
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {/* Version Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleExpand(version.id || "")}
                                                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown size={20} />
                                                    ) : (
                                                        <ChevronRight size={20} />
                                                    )}
                                                </button>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-semibold">
                                                            {version.version}
                                                        </h3>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                                version.estimateStatus,
                                                            )}`}
                                                        >
                                                            {getStatusLabel(version.estimateStatus)}
                                                        </span>
                                                        {isFinal && (
                                                            <CheckCircle
                                                                size={16}
                                                                className="text-green-600"
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {version.venue}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {version.estimateStatus === "DRAFT" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleClone(version.id || "")
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Copy size={14} />
                                                            Clone
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    version.id || "",
                                                                    "UNDER_CLIENT_REVIEW",
                                                                )
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Send size={14} />
                                                            Send to Client
                                                        </Button>
                                                    </>
                                                )}

                                                {version.estimateStatus ===
                                                    "UNDER_CLIENT_REVIEW" && (
                                                    <>
                                                        <AccessButton
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleClone(version.id || "")
                                                            }
                                                            className="flex items-center gap-1"
                                                            scope={["w:estimates"]}
                                                        >
                                                            <Copy size={14} />
                                                            Clone
                                                        </AccessButton>
                                                        <AccessButton
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    version.id || "",
                                                                    "FINAL",
                                                                )
                                                            }
                                                            className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                                            scope={["w:estimates"]}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Mark as Final
                                                        </AccessButton>
                                                        <AccessButton
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    version.id || "",
                                                                    "DRAFT",
                                                                )
                                                            }
                                                            className="flex items-center gap-1"
                                                            scope={["w:estimates"]}
                                                        >
                                                            Revert to Draft
                                                        </AccessButton>
                                                    </>
                                                )}

                                                {version.estimateStatus === "FINAL" && (
                                                    <AccessButton
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                version.id || "",
                                                                "DRAFT",
                                                            )
                                                        }
                                                        className="flex items-center gap-1"
                                                        scope={["w:estimates"]}
                                                    >
                                                        Revert to Draft
                                                    </AccessButton>
                                                )}

                                                <AccessButton
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onVersionSelect?.(version)}
                                                    className="flex items-center gap-1"
                                                    scope={["w:estimates"]}
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </AccessButton>
                                                {version.estimateStatus === "FINAL" && (
                                                    <AccessButton
                                                        size="sm"
                                                        variant="primary"
                                                        className="flex items-center gap-1"
                                                        icon={<Calendar size={14} />}
                                                        onClick={() => handleCreateEvent(version)}
                                                        scope={["w:events"]}
                                                    >
                                                        Create Event
                                                    </AccessButton>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="mt-4 pl-8 space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="font-medium">
                                                            Requirement:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {version.highlvelRequirement}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Client PoC:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {version.clientPoC}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            From Date:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {version.fromDate
                                                                ? new Date(
                                                                      version.fromDate,
                                                                  ).toLocaleDateString()
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            To Date:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {version.toDate
                                                                ? new Date(
                                                                      version.toDate,
                                                                  ).toLocaleDateString()
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    {version.clonedFromEstimateId && (
                                                        <div className="col-span-2">
                                                            <span className="font-medium">
                                                                Cloned from:
                                                            </span>
                                                            <p className="text-gray-600">
                                                                {versions.find(
                                                                    v =>
                                                                        v.id ===
                                                                        version.clonedFromEstimateId,
                                                                )?.version || "Unknown"}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="col-span-2">
                                                        <span className="font-medium">
                                                            Created:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {version.createdAt
                                                                ? new Date(
                                                                      version.createdAt,
                                                                  ).toLocaleString()
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Item Details */}
                                                {version.items &&
                                                    Object.keys(version.items).length > 0 && (
                                                        <div className="col-span-2 mt-4">
                                                            <span className="font-medium block mb-3">
                                                                Items
                                                            </span>
                                                            <ItemsTable
                                                                items={version.items}
                                                                gst={version.gst}
                                                                serviceCharge={
                                                                    version.serviceCharge
                                                                }
                                                                discounts={version.discounts ?? 0}
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}

interface ItemsTableProps {
    items: Record<string, EstimateItem[]>;
    gst: number;
    serviceCharge: number;
    discounts: number;
}

function ItemsTable({ items, gst, serviceCharge, discounts }: ItemsTableProps) {
    // Flatten the nested items structure for table display
    const flattenedItems = useMemo(() => {
        const flattened: (EstimateItem & { category: string })[] = [];
        Object.entries(items || {}).forEach(([category, itemList]) => {
            (itemList || []).forEach(item => {
                flattened.push({
                    ...item,
                    category,
                });
            });
        });
        return flattened;
    }, [items]);

    const columns: Column<EstimateItem & { category: string }>[] = [
        {
            key: "category",
            header: "Category",
            render: item => (
                <span className="text-xs font-medium text-gray-700">{item.category}</span>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: item => <span className="text-xs">{item.item || "N/A"}</span>,
        },
        {
            key: "specification",
            header: "Specification",
            render: item => <span className="text-xs">{item.description || "N/A"}</span>,
        },
        {
            key: "vendor",
            header: "Vendor",
            render: item => <span className="text-xs">{item.vendor || "N/A"}</span>,
        },
        {
            key: "days",
            header: "Days",
            align: "center",
            render: item => <span className="text-xs">{item.days || 0}</span>,
        },
        {
            key: "quantity",
            header: "Qty",
            align: "center",
            render: item => <span className="text-xs">{item.quantity || 0}</span>,
        },
        {
            key: "unitCost",
            header: "Rate",
            align: "right",
            render: item => (
                <span className="text-xs">
                    {item.pricePerItem ? `₹${item.pricePerItem?.toFixed(2)}` : "N/A"}
                </span>
            ),
        },
        {
            key: "total",
            header: "Total",
            align: "right",
            render: item => (
                <span className="text-xs font-medium">
                    {item.finalAmt ? `₹${item.finalAmt?.toFixed(2)}` : "N/A"}
                </span>
            ),
        },
    ];

    const estimatedTotal = flattenedItems.reduce((sum, item) => sum + (item.finalAmt || 0), 0);
    const { gstAmount, serviceChargeAmount, totalWithGST } = calculateEstimateSummary({
        totalAmount: estimatedTotal,
        gst,
        serviceCharge,
        discounts,
    });

    const footer = (
        <>
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="py-3 px-3 text-xs" colSpan={columns.length - 1}>
                    Total
                </td>
                <td className="py-3 px-3 text-xs text-right font-semibold">
                    ₹{estimatedTotal.toFixed(2)}
                </td>
            </tr>
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="py-3 px-3 text-xs" colSpan={columns.length - 1}>
                    Service Charge ({serviceCharge}%)
                </td>
                <td className="py-3 px-3 text-xs text-right font-semibold">
                    ₹{serviceChargeAmount.toFixed(2)}
                </td>
            </tr>
            {Boolean(discounts) && (
                <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                    <td className="py-3 px-3 text-xs" colSpan={columns.length - 1}>
                        Discount
                    </td>
                    <td className="py-3 px-3 text-xs text-red-500 text-right font-semibold">
                        -₹{discounts.toFixed(2)}
                    </td>
                </tr>
            )}
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="py-3 px-3 text-xs" colSpan={columns.length - 1}>
                    GST ({gst}%)
                </td>
                <td className="py-3 px-3 text-xs text-right font-semibold">
                    ₹{gstAmount.toFixed(2)}
                </td>
            </tr>
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                <td className="py-3 px-3 text-xs" colSpan={columns.length - 1}>
                    Net Total
                </td>
                <td className="py-3 px-3 text-xs text-right font-semibold">
                    ₹{totalWithGST.toFixed(2)}
                </td>
            </tr>
        </>
    );

    return (
        <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <Table<EstimateItem & { category: string }>
                data={flattenedItems}
                columns={columns}
                getKey={item => `${item.category}-${item.id}`}
                emptyMessage="No items in this estimate"
                className="text-xs"
                footer={footer}
            />
        </div>
    );
}
