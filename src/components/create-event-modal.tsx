"use client";

import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui-old/label";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import {
    EventFormData,
    CreateEventModalProps,
    EstimateDropdownItem,
    EstimateEventDetails,
} from "@/types/event";
import { useClients } from "@/hooks/useClients";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    eventStartDate: Yup.string().required("Event start date is required"),
    eventEndDate: Yup.string()
        // .required("Event end date is required")
        .test("after-start", "End date must be after start date", function (value) {
            const { eventStartDate } = this.parent as { eventStartDate?: string };
            if (!value || !eventStartDate) return true;
            return new Date(value) >= new Date(eventStartDate);
        }),
    location: Yup.string().optional(),
    venue: Yup.string().optional(),
    clientId: Yup.string().notRequired(),
});

type VendorNameItem = { id: string; name: string };

export default function CreateEventModal({
    isOpen,
    onClose,
    onSubmit,
    editData,
    prefillData,
    mode = "create",
}: CreateEventModalProps) {
    const { clients, loading: clientsLoading } = useClients();
    const formikRef = useRef<FormikProps<EventFormData> | null>(null);
    const [estimateDropdown, setEstimateDropdown] = useState<EstimateDropdownItem[]>([]);
    const [loadingEstimates, setLoadingEstimates] = useState(false);
    const [loadingEventDetails, setLoadingEventDetails] = useState(false);
    const [selectedEstimateId, setSelectedEstimateId] = useState<string>("");
    const [estimateError, setEstimateError] = useState<string>("");
    const [estimateItems, setEstimateItems] = useState<Record<string, unknown[]> | null>(null);
    const [vendorNames, setVendorNames] = useState<VendorNameItem[]>([]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedEstimateId("");
            setEstimateError("");
            setEstimateDropdown([]);
            setEstimateItems(null);
            setVendorNames([]);
        }
    }, [isOpen]);

    // Fetch estimate items when editing an event
    useEffect(() => {
        if (!isOpen || mode !== "edit" || !editData?.id) return;

        const fetchEventEstimate = async () => {
            try {
                setLoadingEventDetails(true);
                const res = await apiRequest(
                    `/api/events/${encodeURIComponent(String(editData.id))}/estimate`,
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.items && typeof data.items === "object") {
                        setEstimateItems(data.items);
                    }
                }
            } catch (error) {
                console.error("Error fetching event estimate:", error);
            } finally {
                setLoadingEventDetails(false);
            }
        };

        fetchEventEstimate();
    }, [isOpen, mode, editData?.id]);

    // Fetch estimate dropdown and vendor names on modal open
    useEffect(() => {
        if (!isOpen) return;

        const fetchEstimateDropdown = async () => {
            try {
                setLoadingEstimates(true);
                const res = await apiRequest("/api/estimates/dropdown");
                if (!res.ok) {
                    throw new Error("Failed to fetch estimates");
                }
                const data: EstimateDropdownItem[] = await res.json();
                setEstimateDropdown(data);
            } catch (error) {
                console.error("Error fetching estimate dropdown:", error);
                toast.error("Failed to load estimates");
            } finally {
                setLoadingEstimates(false);
            }
        };

        const fetchVendorNames = async () => {
            try {
                const res = await apiRequest("/api/vendors/names");
                if (res.ok) {
                    const data = await res.json();
                    setVendorNames(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error fetching vendor names:", error);
            }
        };

        fetchEstimateDropdown();
        fetchVendorNames();
    }, [isOpen]);

    // Fetch event details when estimate is selected
    const handleEstimateSelect = async (estimateId: string) => {
        if (!estimateId || !formikRef.current) {
            setSelectedEstimateId("");
            setEstimateError("");
            setEstimateItems(null);
            return;
        }

        try {
            setLoadingEventDetails(true);
            setEstimateError("");

            // Fetch both enquiry details and estimate details (for items) in parallel
            const [enquiryRes, estimateRes] = await Promise.all([
                apiRequest(`/api/estimates/${estimateId}/enquiry`),
                apiRequest(`/api/estimates/${estimateId}`),
            ]);

            if (!enquiryRes.ok) {
                throw new Error("Failed to fetch event details");
            }

            const responseData = await enquiryRes.json();

            // Handle new nested response structure: { estimateId, enquiry: {...} }
            const enquiryData = responseData.enquiry || responseData;
            const eventDetails: EstimateEventDetails = enquiryData;
            // Use estimateId from response if available, otherwise use the parameter
            const responseEstimateId = responseData.estimateId || estimateId;

            // Populate form with event details
            // Use eventName if available, otherwise fall back to title
            const eventTitle = eventDetails.eventName || eventDetails.title || "";

            // Extract clientId - handle both string and object formats
            const clientId =
                typeof eventDetails.client === "string"
                    ? eventDetails.client
                    : eventDetails.client?.id || "";

            // Use 'id' field from enquiry as enquiryId
            const enquiryId = eventDetails.id || eventDetails.enquiryId || "";

            formikRef.current.setValues({
                ...formikRef.current.values,
                title: eventTitle,
                eventStartDate: formatDateForInput(eventDetails.fromDate),
                eventEndDate: formatDateForInput(eventDetails.toDate),
                location: eventDetails.location || "",
                venue: eventDetails.venue || "",
                clientId: clientId,
                estimateId: responseEstimateId,
                enquiryId: enquiryId,
            });

            // Extract items from estimate response
            if (estimateRes.ok) {
                const estimateData = await estimateRes.json();
                if (estimateData.items && typeof estimateData.items === "object") {
                    setEstimateItems(estimateData.items);
                } else {
                    setEstimateItems(null);
                }
            } else {
                console.warn("Could not fetch estimate items, proceeding without items");
                setEstimateItems(null);
            }

            setSelectedEstimateId(responseEstimateId);
            toast.success("Event details loaded from estimate");
        } catch (error) {
            console.error("Error fetching event details:", error);
            toast.error("Failed to load event details");
            setEstimateError("Failed to load event details");
            setEstimateItems(null);
        } finally {
            setLoadingEventDetails(false);
        }
    };

    // Helper function to format date for datetime-local input
    const formatDateForInput = (dateStr: string | undefined) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            const iso = d.toISOString();
            return iso.slice(0, 16); // YYYY-MM-DDTHH:mm
        } catch {
            return "";
        }
    };

    const initialValues: EventFormData = editData
        ? {
              ...editData,
              title: editData.title || editData.eventName || "",
              eventStartDate: formatDateForInput(editData.eventStartDate),
              eventEndDate: formatDateForInput(editData.eventEndDate),
          }
        : prefillData
          ? {
                title: prefillData.title || prefillData.eventName || "",
                eventStartDate: formatDateForInput(prefillData.eventStartDate),
                eventEndDate: formatDateForInput(prefillData.eventEndDate),
                location: prefillData.location || "",
                venue: prefillData.venue || "",
                clientId: prefillData.clientId || "",
                estimateId: prefillData.estimateId,
                enquiryId: prefillData.enquiryId,
            }
          : {
                title: "",
                eventStartDate: "",
                eventEndDate: "",
                location: "",
                venue: "",
                clientId: "",
            };

    useEffect(() => {
        if (!isOpen) return;
        if (!clientsLoading && editData?.clientId && formikRef.current) {
            const current = formikRef.current.values.clientId;
            if (current !== editData.clientId)
                formikRef.current.setFieldValue("clientId", editData.clientId);
        }
    }, [isOpen, clientsLoading, editData?.clientId]);

    const handleSubmit = async (
        values: EventFormData,
        { setSubmitting, setStatus }: FormikHelpers<EventFormData>,
    ) => {
        try {
            setStatus(null);

            // Validate estimate selection in create mode
            if (mode === "create" && !selectedEstimateId) {
                setEstimateError("Please select a final estimate");
                setSubmitting(false);
                return;
            }

            // Ensure enquiryId is present
            if (mode === "create" && !values.enquiryId) {
                setEstimateError(
                    "Enquiry information is missing. Please select an estimate again.",
                );
                setSubmitting(false);
                return;
            }

            const isEdit = mode === "edit" || !!editData?.id;

            // Convert to backend format
            const payload: Record<string, unknown> = {
                title: values.title,
                eventStartDate: values.eventStartDate,
                eventEndDate: values.eventEndDate,
            };

            if (values.location) payload.location = values.location;
            if (values.venue) payload.venue = values.venue;
            if (values.clientId) payload.client = { id: values.clientId };
            if (values.enquiryId) payload.enquiryId = values.enquiryId;
            if (values.estimateId) payload.estimateId = values.estimateId;
            if (values.enquiryDate) payload.enquiryDate = values.enquiryDate;

            // For edit mode, if we have editData with estimateId, include it
            if (isEdit && editData?.estimateId && !payload.estimateId) {
                payload.estimateId = editData.estimateId;
            }

            // Include items from the estimate - transform to items format for backend Event model
            const vendorIdSet = new Set<string>();

            const coerceString = (value: unknown, fallback = ""): string => {
                if (typeof value === "string") return value;
                if (typeof value === "number" && Number.isFinite(value)) return String(value);
                return fallback;
            };

            const coerceNumber = (value: unknown, fallback = 0): number => {
                if (typeof value === "number" && Number.isFinite(value)) return value;
                if (typeof value === "string") {
                    const parsed = Number(value);
                    return Number.isFinite(parsed) ? parsed : fallback;
                }
                return fallback;
            };

            type NormalizedEventItem = {
                category: string;
                item: string;
                description: string;
                count: number;
                pricePerItem: number;
                days: number;
                serialNumber: number;
                vendor?: string;
            };

            if (estimateItems && Object.keys(estimateItems).length > 0) {
                // Flatten the items from all categories into a single array
                const items: NormalizedEventItem[] = [];

                Object.entries(estimateItems).forEach(([category, categoryItems]) => {
                    if (!Array.isArray(categoryItems)) return;

                    categoryItems.forEach((item: unknown) => {
                        const itemRecord = item as Record<string, unknown>;

                        // Normalise vendor details (could be name string or object with id)
                        const rawVendor = itemRecord.vendor;
                        let vendorId: string | undefined;
                        let vendorName: string | undefined;

                        if (typeof rawVendor === "string") {
                            vendorName = rawVendor.trim() || undefined;
                        } else if (rawVendor && typeof rawVendor === "object") {
                            const vendorObject = rawVendor as {
                                id?: unknown;
                                name?: unknown;
                            };
                            if (typeof vendorObject.id === "string" && vendorObject.id.trim()) {
                                vendorId = vendorObject.id.trim();
                            }
                            if (typeof vendorObject.name === "string" && vendorObject.name.trim()) {
                                vendorName = vendorObject.name.trim();
                            }
                        }

                        if (!vendorName) {
                            const directVendorName = itemRecord.vendorName;
                            if (typeof directVendorName === "string" && directVendorName.trim()) {
                                vendorName = directVendorName.trim();
                            }
                        }

                        if (!vendorId) {
                            const directVendorId = itemRecord.vendorId;
                            if (typeof directVendorId === "string" && directVendorId.trim()) {
                                vendorId = directVendorId.trim();
                            } else if (typeof directVendorId === "number") {
                                vendorId = String(directVendorId);
                            }
                        }

                        if (!vendorId && vendorName) {
                            const match = vendorNames.find(v => v.name === vendorName);
                            if (match?.id) vendorId = match.id;
                        }

                        let displayVendorName = vendorName;
                        if (!displayVendorName && vendorId) {
                            displayVendorName =
                                vendorNames.find(v => v.id === vendorId)?.name || vendorId;
                        }

                        if (vendorId) {
                            vendorIdSet.add(vendorId);
                        }

                        items.push({
                            category,
                            item: coerceString(
                                itemRecord.item ?? itemRecord.description,
                                "Line item",
                            ),
                            description: coerceString(
                                itemRecord.description ?? itemRecord.item,
                                "",
                            ),
                            count: coerceNumber(
                                itemRecord.count ?? itemRecord.quantity ?? itemRecord.sqft,
                                1,
                            ),
                            pricePerItem: coerceNumber(
                                itemRecord.pricePerItem ?? itemRecord.rate ?? itemRecord.unitCost,
                                0,
                            ),
                            days: coerceNumber(itemRecord.days, 1),
                            vendor: displayVendorName ?? vendorName ?? vendorId ?? "",
                            serialNumber: coerceNumber(itemRecord.serialNumber, 0),
                        });
                    });
                });

                if (items.length > 0 && vendorIdSet.size === 0 && vendorNames.length > 0) {
                    vendorNames.forEach(v => {
                        if (v.id) vendorIdSet.add(v.id);
                    });
                    items.forEach((item, index) => {
                        if (!item.vendor || !item.vendor.trim()) {
                            const fallback = vendorNames[index % vendorNames.length];
                            if (fallback?.name) {
                                item.vendor = fallback.name;
                            }
                        }
                    });
                }

                payload.items = items;
            } else {
                // Send empty array to avoid null pointer exception
                payload.items = [];
            }

            const vendorIds = Array.from(
                vendorIdSet.size > 0
                    ? vendorIdSet
                    : new Set(vendorNames.map(v => v.id).filter(Boolean) as string[]),
            );
            if (vendorIds.length > 0) {
                payload.vendors = vendorIds.map(id => ({ id }));
            }

            const url =
                isEdit && editData?.id
                    ? `/api/events/${encodeURIComponent(String(editData.id))}`
                    : `/api/events`;
            const method = isEdit ? "PUT" : "POST";

            const res = await apiRequest(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(
                    text || `Failed to ${isEdit ? "update" : "create"} event: ${res.status}`,
                );
            }
            await res.json().catch(() => null);
            onSubmit();
            onClose();
        } catch (err) {
            setStatus(err instanceof Error ? err.message : "Failed to save event");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Event" : "Create Event"}
            description={
                mode === "edit" ? "Update event details" : "Fill details to create an event"
            }
            size="xl"
            showCloseIcon
        >
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form>
                        <ModalBody className="max-h-[60vh] overflow-y-auto space-y-4">
                            {status && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {status}
                                </div>
                            )}

                            {/* Estimate Dropdown - Only show in create mode */}
                            {mode === "create" && (
                                <div>
                                    <Label htmlFor="estimateSelect">
                                        Select Event Title <span className="text-red-600">*</span>
                                    </Label>
                                    {loadingEstimates ? (
                                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                            Loading estimates...
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                id="estimateSelect"
                                                className="mt-1 w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                                                onChange={e => handleEstimateSelect(e.target.value)}
                                                disabled={loadingEventDetails}
                                                value={selectedEstimateId}
                                            >
                                                <option value="">
                                                    -- Select an event title --
                                                </option>
                                                {estimateDropdown.map(est => (
                                                    <option key={est.id} value={est.id}>
                                                        {est.name} ({est.version})
                                                    </option>
                                                ))}
                                            </select>
                                            {estimateError && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {estimateError}
                                                </p>
                                            )}
                                        </>
                                    )}
                                    {loadingEventDetails && (
                                        <p className="mt-1 text-sm text-blue-600">
                                            Loading event details...
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="title">Event Title</Label>
                                <Field
                                    as={Input}
                                    id="title"
                                    name="title"
                                    placeholder="Event title"
                                    className="mt-1"
                                />
                                <ErrorMessage
                                    name="title"
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="eventStartDate">Event Start Date & Time</Label>
                                    <Field
                                        as={Input}
                                        id="eventStartDate"
                                        name="eventStartDate"
                                        type="datetime-local"
                                        className="mt-1"
                                    />
                                    <ErrorMessage
                                        name="eventStartDate"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="eventEndDate">Event End Date & Time</Label>
                                    <Field
                                        as={Input}
                                        id="eventEndDate"
                                        name="eventEndDate"
                                        type="datetime-local"
                                        className="mt-1"
                                    />
                                    <ErrorMessage
                                        name="eventEndDate"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Field
                                        as={Input}
                                        id="location"
                                        name="location"
                                        placeholder="Enter location"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="venue">Venue</Label>
                                    <Field
                                        as={Input}
                                        id="venue"
                                        name="venue"
                                        placeholder="Enter venue"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="clientId">Client</Label>
                                {clientsLoading ? (
                                    <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                        Loading clients...
                                    </div>
                                ) : (
                                    <Field
                                        as="select"
                                        id="clientId"
                                        name="clientId"
                                        className="mt-1 w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">Select a client</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </Field>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                type="button"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? mode === "edit"
                                        ? "Updating..."
                                        : "Creating..."
                                    : mode === "edit"
                                      ? "Update Event"
                                      : "Create Event"}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
