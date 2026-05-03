"use client";

import { useState, useEffect, useMemo } from "react";
import { EstimateDto, EstimateVersionStatus } from "@/types/estimate";
import { Copy, Send, CheckCircle, Edit, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";
import { Button, Modal, ModalBody, ModalFooter } from "./ui";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { useRouter } from "next/navigation";

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

    const handleCreateEstimate = async (version: EstimateDto) => {
        if (!version) return;
        try {
            const payload = {
                title: version.title || version.highlvelRequirement || "Event",
                eventStartDate: version.fromDate,
                eventEndDate: version.toDate,
                location: version.location,
                venue: version.venue,
                client: version.client?.id,
                enquiryId: version.enquiryId,
                estimateId: version.id,
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
                router.push(`/events/${createdEvent.id}`); // Navigate to the newly created event's page
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
                                                                    "FINAL",
                                                                )
                                                            }
                                                            className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Mark as Final
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    version.id || "",
                                                                    "DRAFT",
                                                                )
                                                            }
                                                            className="flex items-center gap-1"
                                                        >
                                                            Revert to Draft
                                                        </Button>
                                                    </>
                                                )}

                                                {version.estimateStatus === "FINAL" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                version.id || "",
                                                                "DRAFT",
                                                            )
                                                        }
                                                        className="flex items-center gap-1"
                                                    >
                                                        Revert to Draft
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onVersionSelect?.(version)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Button>
                                                {version.estimateStatus === "FINAL" && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        className="flex items-center gap-1"
                                                        icon={<Calendar size={14} />}
                                                        onClick={() =>
                                                            handleCreateEstimate(version)
                                                        }
                                                    >
                                                        Create Event
                                                    </Button>
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
