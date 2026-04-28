"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toast } from "sonner";

import { useRequestApi } from "@/hooks/useRequestApi";
import { Button } from "@/components/ui/button";
import { Badge, MenuList } from "@/components/ui";
import { MoreVerticalIcon, PencilIcon, TrashIcon, FileTextIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { MobileCardList } from "@/components/shared/mobile-card-list";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { KeyValueDisplay } from "@/components/ui/key-value-display";
import CreateEnquiryModal from "@/components/create-enquiry-modal";
import { EnquiriesTableFilters } from "@/components/enquiries-table-filters";
import { Enquiry, EnquiryFormData, EnquiriesTableFiltersFormValues } from "@/types/enquiry";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { APIResponse, MenuItem } from "@/types";
import { usePagination } from "@/hooks/usePagination";
import { apiRequest } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { downloadCSV } from "@/lib/utils/file";
import { buildQueryUrl } from "@/lib/api/query-params";
import { AccessButton } from "@/components/shared/access-button";
import { Download, MessageSquarePlus } from "lucide-react";

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

const enquiryFiltersInitialValues: EnquiriesTableFiltersFormValues = {
    search: "",
    status: "",
    sortBy: "enquiryDate",
    sortOrder: "desc",
};

const columns = (
    onEdit: (enquiry: Enquiry) => void,
    onDelete: (row: Enquiry) => void,
    onView: (enquiry: Enquiry) => void,
): Column<Enquiry>[] => [
    {
        key: "eventName",
        header: "Event Details",
        render: row => (
            <div>
                <div onClick={() => onView(row)} className="font-medium text-gray-900 cursor-pointer">{row.eventName || "-"}</div>
                <div className="text-xs text-gray-500 mt-1">ID: {row.eventID || row.id}</div>
                <div className="mt-1">
                    <Badge variant="info">{row.eventType || "Unknown"}</Badge>
                </div>
            </div>
        ),
    },
    {
        key: "client",
        header: "Client",
        render: row => (
            <div>
                <div className="font-medium text-gray-900">{row.clientName || row.client}</div>
                {(row.poc || row.enquiryPoCNumber) && (
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {row.poc && <div>POC: {row.poc}</div>}
                        {row.enquiryPoCNumber && <div>Ph: {row.enquiryPoCNumber}</div>}
                    </div>
                )}
            </div>
        ),
    },
    {
        key: "schedule",
        header: "Schedule",
        render: row => (
            <div className="space-y-2">
                <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="text-sm">
                        {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                    </div>
                </div>
                {(row.fromDate || row.toDate) && (
                    <div>
                        <div className="text-xs text-gray-500">Event</div>
                        <div className="text-xs">
                            {row.fromDate
                                ? new Date(row.fromDate).toLocaleString(undefined, {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                  })
                                : "TBD"}
                            <br />
                            to
                            <br />
                            {row.toDate
                                ? new Date(row.toDate).toLocaleString(undefined, {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                  })
                                : "TBD"}
                        </div>
                    </div>
                )}
            </div>
        ),
    },
    {
        key: "location",
        header: "Location",
        render: row => (
            <div>
                <div className="text-sm font-medium">{row.venue || "-"}</div>
                {row.location && <div className="text-xs text-gray-500 mt-1">{row.location}</div>}
            </div>
        ),
    },
    {
        key: "team",
        header: "Team",
        render: row => (
            <div className="space-y-1 text-xs">
                <div>
                    <span className="text-gray-500">Assigned:</span> {row.assignee || "-"}
                </div>
                {row.enquiryPoC && (
                    <div>
                        <span className="text-gray-500">Enq POC:</span> {row.enquiryPoC}
                    </div>
                )}
                {row.eventPoC && (
                    <div>
                        <span className="text-gray-500">Evt POC:</span> {row.eventPoC}
                        {row.eventPoCNumber && (
                            <span className="text-gray-400"> ({row.eventPoCNumber})</span>
                        )}
                    </div>
                )}
            </div>
        ),
    },
    {
        key: "requirements",
        header: "Requirements",
        render: row => (
            <div
                className="truncate text-sm text-gray-600 max-w-xs"
                title={row.highlvelRequirement}
            >
                {row.highlvelRequirement || "-"}
            </div>
        ),
    },
    {
        key: "actions",
        header: "",
        className: "text-right",
        render: row => {
            const items: MenuItem[] = [
                {
                    key: "view",
                    label: "View",
                    icon: <FileTextIcon size={16} />,
                    onClick: () => onView(row),
                },
                {
                    key: "edit",
                    label: "Edit",
                    icon: <PencilIcon size={16} />,
                    onClick: () => onEdit(row),
                    scopes: ["w:enquiries"],
                },
                {
                    key: "delete",
                    label: "Delete",
                    icon: <TrashIcon size={16} />,
                    onClick: () => onDelete(row),
                    className: "text-destructive focus:text-destructive",
                    scopes: ["w:enquiries"],
                },
            ];

            return (
                <div className="flex justify-center">
                    <MenuList
                        align="end"
                        items={items}
                        trigger={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon size={16} />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];

export default function EnquiriesPage() {
    const router = useRouter();
    const { request, loading } = useRequestApi<APIResponse<Enquiry[]>>();
    const [result, setResult] = useState<APIResponse<Enquiry[]>>();
    const [modalOpen, setModalOpen] = useState(false);
    const [editEnquiry, setEditEnquiry] = useState<EnquiryFormData | null>(null);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [eventSaving, setEventSaving] = useState(false);

    const enquiries = result?.content || [];
    const totalElements = result?.totalElements || 0;
    const totalPages = result?.totalPages || 1;

    const { currentPage, handlePageChange, pagination, setCurrentPage } = usePagination({
        totalPages,
        pageSize: PAGE_SIZE,
        totalElements,
        itemName: "enquiry",
    });

    const formik = useFormik<EnquiriesTableFiltersFormValues>({
        initialValues: enquiryFiltersInitialValues,
        onSubmit: () => {
            setCurrentPage(1);
        },
    });
    const { values } = formik;

    const handleResetFilters = useCallback(() => {
        formik.resetForm();
        setCurrentPage(1);
    }, [formik, setCurrentPage]);

    const fetchEnquiries = useCallback(async () => {
        try {
            const url = buildQueryUrl(API_ENDPOINTS.enquiries.list, {
                page: currentPage - 1,
                size: PAGE_SIZE,
                status: values.status || "ENQUIRY_CREATED",
                search: values.search,
                sortBy: values.sortBy,
                direction: values.sortOrder,
            });
            const res = await request(url, {
                method: "GET",
            });
            if (res !== null) {
                setResult(res);
            }
        } catch (_err) {
            toast.error("Failed to fetch enquiries. Please try again.");
        }
    }, [request, currentPage, values.search, values.status, values.sortBy, values.sortOrder]);

    useEffect(() => {
        fetchEnquiries();
    }, [fetchEnquiries]);

    useEffect(() => {
        formik.submitForm();
    }, [values.search, values.status, values.sortBy, values.sortOrder]);

    const handleCreate = () => {
        setEditEnquiry(null);
        setModalMode("create");
        setModalOpen(true);
    };

    const handleEdit = (enquiry: Enquiry) => {
        setModalMode("edit");
        const editData: EnquiryFormData = {
            id: enquiry.id,
            highlvelRequirement: enquiry.highlvelRequirement || "",
            enquiryDate: enquiry.enquiryDate || enquiry.date || "",
            fromDate: enquiry.fromDate || "",
            toDate: enquiry.toDate || "",
            venue: enquiry.venue || "",
            location: enquiry.location || "",
            clientPoC: enquiry.poc || "",
            enquiryPoCNumber: enquiry.enquiryPoCNumber || "",
            client: enquiry.client,
            eventType: (enquiry.eventType as "PERSONAL" | "CORPORATE" | "OTHER") || "CORPORATE",
            eventPoC: enquiry.eventPoC || "",
            title: enquiry.eventName || "",
            enquiryPoC: enquiry.enquiryPoC || "",
            eventPoCNumber: enquiry.eventPoCNumber || "",
            assignedTo: enquiry.assignee || "",
        };
        setEditEnquiry(editData);
        setModalOpen(true);
    };

    const handleDeleteClick = (enquiry: Enquiry) => {
        setEnquiryToDelete(enquiry);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!enquiryToDelete) return;
        try {
            const res = await apiRequest(`/api/enquiries/${enquiryToDelete.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Enquiry deleted successfully");
                fetchEnquiries();
            } else {
                throw new Error(`Failed to delete enquiry: ${res.status}`);
            }
        } catch {
            toast.error("Failed to delete enquiry. Please try again.");
        } finally {
            setDeleteModalOpen(false);
            setEnquiryToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setEnquiryToDelete(null);
    };

    const handleView = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setViewModalOpen(true);
    };

    const handleCreateEvent = async () => {
        if (!selectedEnquiry) return;
        setEventSaving(true);
        try {
            const payload = {
                title: selectedEnquiry.eventName || selectedEnquiry.title || "Event",
                eventName: selectedEnquiry.eventName || selectedEnquiry.title || "Event",
                enquiryDate: selectedEnquiry.date || new Date().toISOString(),
                eventStartDate:
                    selectedEnquiry.fromDate || selectedEnquiry.date || new Date().toISOString(),
                eventEndDate:
                    selectedEnquiry.toDate || selectedEnquiry.date || new Date().toISOString(),
                eventID: selectedEnquiry.eventID,
                location: selectedEnquiry.location || "",
                venue: selectedEnquiry.venue || "",
                status: "ENQUIRY_CREATED",
                enquiryId: String(selectedEnquiry.id ?? ""),
                client: {
                    id: selectedEnquiry.client ? String(selectedEnquiry.client) : undefined,
                    name: selectedEnquiry.clientName || undefined,
                },
                vendor: undefined,
                items: [],
                categorySummary: [],
                vendorSummary: [],
                gst: 0,
                tds: 0,
                advanceAmt: 0,
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
            toast.success("Event created from enquiry");
            setViewModalOpen(false);
            setSelectedEnquiry(null);

            if (createdEvent && (createdEvent.eventID || createdEvent.id)) {
                router.push(`/events/${createdEvent.eventID || createdEvent.id}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create event";
            toast.error(message);
        } finally {
            setEventSaving(false);
        }
    };

    const handleExport = () => {
        const exportData = enquiries.map(enquiry => ({
            "Event Name": enquiry.eventName || "-",
            Client: enquiry.clientName || enquiry.client,
            Date: enquiry.date,
            POC: enquiry.poc,
            Status: enquiry.status,
            Assignee: enquiry.assignee,
            Location: enquiry.venue || enquiry.location || "-",
        }));
        downloadCSV(exportData, "enquiries-export.csv");
    };

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <PageHeader
                title="Enquiry Management"
                description={`Manage all enquiries. You have ${totalElements} ${totalElements === 1 ? "enquiry" : "enquiries"}`}
                actions={
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                        <Button
                            variant="ghost"
                            className="w-full sm:w-auto"
                            onClick={handleExport}
                            icon={<Download size={16} />}
                        >
                            Export
                        </Button>
                        <AccessButton
                            scope={["w:enquiries"]}
                            className="w-full sm:w-auto"
                            onClick={handleCreate}
                            icon={<MessageSquarePlus size={16} />}
                        >
                            Create Enquiry
                        </AccessButton>
                    </div>
                }
            />
            <div className="flex flex-col gap-4 sm:gap-1">
                <EnquiriesTableFilters formik={formik} onReset={handleResetFilters} />
                <div className="rounded-lg bg-surface p-4 sm:p-6 shadow-sm hidden md:block">
                    <DataTable
                        columns={columns(handleEdit, handleDeleteClick, handleView)}
                        data={enquiries}
                        rowKey={row => String(row.id)}
                        emptyMessage="No enquiries found."
                        hoverable
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        isLoading={loading}
                    />
                </div>
                <MobileCardList
                    className="flex flex-col gap-4 md:hidden"
                    items={enquiries.map(enquiry => ({ id: String(enquiry.id), data: enquiry }))}
                    renderHeader={enquiry => (
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-lg">{enquiry.eventName || "-"}</div>
                            <div className="text-xs text-muted-foreground">{enquiry.status}</div>
                        </div>
                    )}
                    renderContent={enquiry => (
                        <>
                            <div className="mb-1">
                                Client:{" "}
                                <span className="font-medium">
                                    {enquiry.clientName || enquiry.client}
                                </span>
                            </div>
                            <div className="mb-1">
                                Date: <span className="font-medium">{enquiry.date}</span>
                            </div>
                            <div className="mb-2">
                                Assignee: <span className="font-medium">{enquiry.assignee}</span>
                            </div>
                        </>
                    )}
                    renderActions={enquiry => (
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleView(enquiry)}>
                                View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(enquiry)}>
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(enquiry)}
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                    emptyMessage="No enquiries found."
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                />
                <CreateEnquiryModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditEnquiry(null);
                        setModalMode("create");
                    }}
                    onSubmit={fetchEnquiries}
                    editData={editEnquiry}
                    mode={modalMode}
                />
                <ConfirmationModal
                    open={deleteModalOpen}
                    onClose={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Enquiry"
                    description={
                        enquiryToDelete
                            ? `Are you sure you want to delete "${enquiryToDelete.eventName || enquiryToDelete.client}"? This action cannot be undone.`
                            : undefined
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            </div>

            {/* View Enquiry Modal */}
            <Modal
                open={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedEnquiry(null);
                }}
                title="Enquiry Details"
                size="xl"
                showCloseIcon
            >
                <ModalBody>
                    {selectedEnquiry && (
                        <KeyValueDisplay
                            items={[
                                {
                                    key: "Enquiry ID",
                                    value: selectedEnquiry.id || "-",
                                },
                                {
                                    key: "Title",
                                    value:
                                        selectedEnquiry.eventName || selectedEnquiry.title || "-",
                                },
                                {
                                    key: "Status",
                                    value: selectedEnquiry.status || "-",
                                },
                                {
                                    key: "Event Type",
                                    value: selectedEnquiry.eventType || "-",
                                },
                                {
                                    key: "Client",
                                    value: selectedEnquiry.clientName || selectedEnquiry.client || "-",
                                },
                                {
                                    key: "Enquiry Date",
                                    value: selectedEnquiry.date
                                        ? new Date(selectedEnquiry.date).toLocaleString()
                                        : "-",
                                },
                                {
                                    key: "Event Schedule",
                                    value: `${selectedEnquiry.fromDate ? new Date(selectedEnquiry.fromDate).toLocaleString() : "TBD"} → ${selectedEnquiry.toDate ? new Date(selectedEnquiry.toDate).toLocaleString() : "TBD"}`,
                                },
                                { key: "Venue", value: selectedEnquiry.venue || "-" },
                                { key: "Location", value: selectedEnquiry.location || "-" },
                                {
                                    key: "High-level Requirement",
                                    value: selectedEnquiry.highlvelRequirement || "-",
                                },
                                {
                                    key: "Enquiry POC",
                                    value: selectedEnquiry.poc || selectedEnquiry.enquiryPoC || "-",
                                },
                                {
                                    key: "Enquiry POC Number",
                                    value: selectedEnquiry.enquiryPoCNumber || "-",
                                },
                                {
                                    key: "Event POC",
                                    value: selectedEnquiry.eventPoC || "-",
                                },
                                {
                                    key: "Event POC Number",
                                    value: selectedEnquiry.eventPoCNumber || "-",
                                },
                                { key: "Assignee", value: selectedEnquiry.assignee || "-" },
                                {
                                    key: "Event ID",
                                    value: selectedEnquiry.eventID || "-",
                                },
                            ]}
                            columns={2}
                        />
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setViewModalOpen(false);
                            setSelectedEnquiry(null);
                        }}
                        disabled={eventSaving}
                    >
                        Close
                    </Button>
                    {selectedEnquiry?.eventID ? (
                        <Button
                            onClick={() => {
                                setViewModalOpen(false);
                                setSelectedEnquiry(null);
                                router.push(`/events/${selectedEnquiry.eventID}`);
                            }}
                        >
                            View Event
                        </Button>
                    ) : (
                        <Button onClick={handleCreateEvent} disabled={eventSaving}>
                            {eventSaving ? "Creating Event..." : "Create Event"}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </div>
    );
}
