"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";

import { API_ENDPOINTS } from "../lib/api/endpoint";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui-old/label";
import { FormikFieldInput } from "@/components/ui/formik-field-input";
import { FormikFieldTextArea } from "@/components/ui/formik-field-textarea";
import { FormikFieldRadio } from "@/components/ui/formik-field-radio";
import { FormikFieldDatePicker } from "@/components/ui/formik-field-date-picker";
import { cn } from "@/lib/utils/cn";
import { EnquiryFormData, CreateEnquiryModalProps } from "@/types/enquiry";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/api-client";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";

// Dynamically import FormikFieldCreatableSelect to avoid SSR issues with react-select
const FormikFieldCreatableSelect = dynamic(
    () =>
        import("@/components/ui/formik-field-creatable-select").then(mod => ({
            default: mod.FormikFieldCreatableSelect,
        })),
    { ssr: false },
);

const validationSchema = Yup.object({
    client: Yup.string().test("client-or-name", "Please select a client", function (value) {
        const { clientName } = this.parent as { clientName?: string };
        return Boolean(value) || Boolean(clientName);
    }),
    eventType: Yup.string()
        .oneOf(["PERSONAL", "CORPORATE", "OTHER"], "Please select an event type")
        .required("Event type is required"),
    fromDate: Yup.string()
        .transform(value => (value ? value : null))
        .nullable()
        .notRequired(),
    toDate: Yup.string()
        .transform(value => (value ? value : null))
        .nullable()
        .notRequired()
        .test("after-start", "End must be after start", function (value) {
            const { fromDate } = this.parent as { fromDate?: string | null };
            if (!value || !fromDate) return true;
            return new Date(value) >= new Date(fromDate);
        }),
    location: Yup.string().required("Location is required"),
    venue: Yup.string().required("Venue is required"),
    title: Yup.string().required("Event title is required").min(3, "Add at least 3 characters"),
    highlvelRequirement: Yup.string().required("High level requirements are required"),
    // .min(10, "Please provide more detailed requirements (at least 10 characters)"),
    clientPoC: Yup.string().optional(),
    enquiryPoCNumber: Yup.string().required("Client POC contact number is required"),
    // .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    eventPoC: Yup.string().optional(),
    enquiryPoC: Yup.string().optional(),
    eventPoCNumber: Yup.string().optional(),
    // .matches(/^\d{10}$/, {
    //     message: "Phone number must be exactly 10 digits",
    //     excludeEmptyString: true,
    // }),
    assignedTo: Yup.string().optional(),
});

export default function CreateEnquiryModal({
    isOpen,
    onClose,
    onSubmit,
    editData,
    mode = "create",
    onSaveSuccess,
}: CreateEnquiryModalProps) {
    const { clients, loading: clientsLoading } = useClients();

    // Formik ref so we can set fields from outside when clients finish loading
    const formikRef = useRef<FormikProps<EnquiryFormData> | null>(null);
    const [saveProcessing, setSaveProcessing] = useState(false);

    // Helper function to normalize dates for datetime-local inputs (YYYY-MM-DDTHH:mm)
    const normalizeDateForForm = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const iso = d.toISOString();
            return iso.slice(0, 16);
        } catch {
            return dateStr;
        }
    };

    const initialValues: EnquiryFormData = editData
        ? {
              ...editData,
              title: editData.title ?? "",
              fromDate: normalizeDateForForm(editData.fromDate || "") || "",
              toDate: normalizeDateForForm(editData.toDate || "") || "",
              eventType: editData.eventType || "CORPORATE",
          }
        : {
              highlvelRequirement: "",
              title: "",
              fromDate: "",
              toDate: "",
              location: "",
              venue: "",
              clientPoC: "",
              enquiryPoCNumber: "",
              client: "",
              clientName: "",
              eventType: "CORPORATE",
              enquiryPoC: "",
              eventPoCNumber: "",
              assignedTo: "",
          };

    const isEdit = mode === "edit" || !!editData?.id;

    const handleSubmit = async (
        values: EnquiryFormData,
        { setSubmitting, setStatus, resetForm }: FormikHelpers<EnquiryFormData>,
    ) => {
        setSaveProcessing(true);

        try {
            setStatus(null);
            const toIsoWithZFromDate = (dateVal?: string | Date) => {
                if (!dateVal) return undefined;
                if (typeof dateVal === "string") {
                    if (dateVal.endsWith("Z")) return dateVal;
                    if (dateVal.length === 16) return `${dateVal}:00.000Z`;
                    return dateVal;
                }
                return new Date(dateVal).toISOString();
            };

            const existingClient = clients.find(c => c.id === values.client);
            let clientId = values.client;
            let clientDisplayName = existingClient?.name ?? "";

            if (!clientId && values.clientName) {
                const res = await apiRequest(API_ENDPOINTS.clients.list, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: values.clientName }),
                });
                if (!res.ok) throw new Error("Failed to create client");
                const created = await res.json();
                clientId = created.id;
                clientDisplayName = typeof created.name === "string" ? created.name : "";
            }

            if (!clientId) {
                throw new Error("Client information is required before saving the enquiry");
            }

            const { fromDate, toDate, ...restValues } = values;
            const formattedFromDate = toIsoWithZFromDate(fromDate as unknown as string | Date);
            const formattedToDate = toIsoWithZFromDate(toDate as unknown as string | Date);

            const requestBody: Record<string, unknown> = {
                ...restValues,
                client: clientDisplayName,
                clientID: clientId,
                enquiryDate: new Date().toISOString(),
                eventName: values.title, // Send title as eventName to backend
            };

            if (formattedFromDate) requestBody.fromDate = formattedFromDate;
            if (formattedToDate) requestBody.toDate = formattedToDate;

            if (isEdit && editData?.id) {
                requestBody.id = editData.id;
            }

            const response = await apiRequest(API_ENDPOINTS.enquiries.list, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok)
                throw new Error(
                    `Failed to ${isEdit ? "update" : "create"} enquiry: ${response.statusText}`,
                );

            const contentType = response.headers.get("content-type") ?? "";
            let savedEnquiry: Record<string, unknown> | null = null;

            if (contentType.includes("application/json")) {
                try {
                    savedEnquiry = (await response.json()) as Record<string, unknown>;
                } catch {
                    throw new Error("Failed to parse enquiry response. Please try again.");
                }
            } else if (response.status !== 204) {
                throw new Error("Received unexpected response when saving the enquiry.");
            }

            await Promise.resolve(onSubmit());

            if (!isEdit) {
                resetForm({ values: { ...initialValues } });
            }

            // After successful save, close the edit/create modal
            onClose();

            // Then open the enquiry in view modal if callback provided
            if (savedEnquiry && onSaveSuccess) {
                onSaveSuccess(savedEnquiry as unknown as import("@/types/enquiry").Enquiry);
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : `Failed to ${isEdit ? "update" : "create"} enquiry`;
            setStatus(message);
            toast.error(`Unable to ${isEdit ? "update" : "create"} enquiry`, {
                description: message,
            });
        } finally {
            setSubmitting(false);
            setSaveProcessing(false);
        }
    };

    // When clients are loaded and we have edit data, set the client only if it exists in the clients array
    useEffect(() => {
        if (!isOpen) return;
        if (!clientsLoading && editData?.client && formikRef.current) {
            const found = clients.find(c => c.id === editData.client);
            if (found) {
                const currentClient = formikRef.current.values.client;
                if (currentClient !== editData.client) {
                    formikRef.current.setFieldValue("client", editData.client);
                }
            } else {
                // If not found, clear the client field to avoid showing the ID
                formikRef.current.setFieldValue("client", "");
            }
        }
    }, [isOpen, clientsLoading, editData?.client, clients]);

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Enquiry" : "Create Enquiry"}
            description={
                mode === "edit"
                    ? "Update the enquiry details"
                    : "Add the following details to create an enquiry"
            }
            size="xxl"
        >
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status, values, setFieldValue, submitForm }) => (
                    <Form>
                        <ModalBody className="max-h-[60vh] overflow-y-auto">
                            {status && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {status}
                                </div>
                            )}
                            {/* Event Title */}
                            <div className="mb-4">
                                <FormikFieldInput
                                    name="title"
                                    label="Event Title"
                                    type="text"
                                    placeholder="e.g. Birthday party, Annual day celebration"
                                    inputClassName="mt-1"
                                />
                            </div>
                            <div className="space-y-4">
                                {/* Enquiry Date removed; set internally on submit */}

                                {/* Row 2: Event Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormikFieldDatePicker
                                            name="fromDate"
                                            label={
                                                <>
                                                    Event From (Date & Time){" "}
                                                    <span className="text-gray-500 text-xs">
                                                        (optional)
                                                    </span>
                                                </>
                                            }
                                            inputClassName="mt-1"
                                            placeholderText="Select date & time"
                                        />
                                    </div>
                                    <div>
                                        <FormikFieldDatePicker
                                            name="toDate"
                                            label={
                                                <>
                                                    Event To (Date & Time){" "}
                                                    <span className="text-gray-500 text-xs">
                                                        (optional)
                                                    </span>
                                                </>
                                            }
                                            inputClassName="mt-1"
                                            placeholderText="Select date & time"
                                        />
                                    </div>
                                </div>

                                {/* Location and Venue */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormikFieldInput
                                            name="location"
                                            label="Location"
                                            type="text"
                                            placeholder="Enter event location"
                                            inputClassName="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <FormikFieldInput
                                            name="venue"
                                            label="Venue"
                                            type="text"
                                            placeholder="Enter event venue"
                                            inputClassName="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <FormikFieldTextArea
                                        name="highlvelRequirement"
                                        label="High Level Requirements"
                                        rows={4}
                                        placeholder="Describe the high level requirements for the event"
                                        textareaClassName="mt-1"
                                    />
                                </div>

                                {/* Client Information Section */}
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-md font-semibold mb-3 text-gray-700">
                                        Client Information
                                    </h3>

                                    {/* Event Type Radio Buttons (first) */}
                                    <div className="mb-4">
                                        <FormikFieldRadio
                                            name="eventType"
                                            label="Event Type"
                                            options={[
                                                { label: "Individual", value: "PERSONAL" },
                                                { label: "Corporate", value: "CORPORATE" },
                                            ]}
                                            radioClassName="mt-2"
                                        />
                                    </div>

                                    {/* Select/Create Client */}
                                    <div className="mb-4">
                                        <Label htmlFor="client">Client</Label>
                                        {clientsLoading ? (
                                            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                                Loading clients...
                                            </div>
                                        ) : (
                                            <FormikFieldCreatableSelect
                                                name="client"
                                                id="client"
                                                placeholder="Search or create client..."
                                                isClearable
                                                options={clients.map(c => ({
                                                    value: c.id,
                                                    label: c.name,
                                                }))}
                                                value={(() => {
                                                    const option = clients.find(
                                                        c => c.id === values.client,
                                                    );
                                                    if (option)
                                                        return {
                                                            value: option.id,
                                                            label: option.name,
                                                        };
                                                    if (clientsLoading) return null;
                                                    if (values.clientName)
                                                        return {
                                                            value: "__new__",
                                                            label: values.clientName,
                                                        };
                                                    return null;
                                                })()}
                                                onChange={selectedValue => {
                                                    const selectedOption = clients.find(
                                                        c => c.id === selectedValue,
                                                    );
                                                    if (selectedValue === "__new__") {
                                                        setFieldValue("client", "");
                                                        setFieldValue(
                                                            "clientName",
                                                            values.clientName,
                                                        );
                                                        if (values.eventType === "PERSONAL") {
                                                            setFieldValue(
                                                                "clientPoC",
                                                                values.clientName,
                                                            );
                                                        }
                                                    } else if (selectedOption) {
                                                        setFieldValue("client", selectedOption.id);
                                                        setFieldValue("clientName", "");
                                                        if (values.eventType === "PERSONAL") {
                                                            setFieldValue(
                                                                "clientPoC",
                                                                selectedOption.name,
                                                            );
                                                        }
                                                    } else {
                                                        setFieldValue("client", "");
                                                        setFieldValue("clientName", "");
                                                    }
                                                }}
                                                onCreateOption={(inputValue: string) => {
                                                    // Do not persist immediately; store typed name and show as selected
                                                    setFieldValue("client", "");
                                                    setFieldValue("clientName", inputValue);
                                                    if (values.eventType === "PERSONAL") {
                                                        setFieldValue("clientPoC", inputValue);
                                                    }
                                                }}
                                                selectClassName="mt-1"
                                            />
                                        )}
                                    </div>

                                    {/* Client POC */}
                                    <div className="mb-4">
                                        <FormikFieldInput
                                            name="clientPoC"
                                            label={
                                                <>
                                                    Client POC{" "}
                                                    {values.eventType === "PERSONAL" &&
                                                        "(Same as Client Name)"}
                                                </>
                                            }
                                            type="text"
                                            placeholder={
                                                values.eventType === "CORPORATE"
                                                    ? "Enter POC name"
                                                    : "Client name (auto-filled)"
                                            }
                                            disabled={values.eventType === "PERSONAL"}
                                            inputClassName={cn(
                                                "mt-1",
                                                values.eventType === "PERSONAL" &&
                                                    "bg-gray-100 cursor-not-allowed",
                                            )}
                                        />
                                    </div>

                                    {/* Client POC Contact Number */}
                                    <div>
                                        <FormikFieldInput
                                            name="enquiryPoCNumber"
                                            label="Client POC Contact Number"
                                            type="tel"
                                            placeholder="1234567890 (10 digits)"
                                            maxLength={10}
                                            inputClassName="mt-1"
                                            onChange={e => {
                                                const value = e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10);
                                                setFieldValue("enquiryPoCNumber", value);
                                            }}
                                        />
                                    </div>

                                    {/* Event POC */}
                                    <div className="mt-4">
                                        <FormikFieldInput
                                            name="eventPoC"
                                            label="Event POC"
                                            type="text"
                                            placeholder="Enter event POC name"
                                            inputClassName="mt-1"
                                        />
                                    </div>

                                    {/* Enquiry POC */}
                                    <div className="mt-4">
                                        <FormikFieldInput
                                            name="enquiryPoC"
                                            label="Enquiry POC"
                                            type="text"
                                            placeholder="Enter enquiry POC name"
                                            inputClassName="mt-1"
                                        />
                                    </div>

                                    {/* Event POC Number */}
                                    <div className="mt-4">
                                        <FormikFieldInput
                                            name="eventPoCNumber"
                                            label="Event POC Number"
                                            type="tel"
                                            placeholder="1234567890 (10 digits)"
                                            maxLength={10}
                                            inputClassName="mt-1"
                                            onChange={e => {
                                                const value = e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10);
                                                setFieldValue("eventPoCNumber", value);
                                            }}
                                        />
                                    </div>

                                    {/* Assigned To */}
                                    <div className="mt-4">
                                        <FormikFieldInput
                                            name="assignedTo"
                                            label="Assigned To"
                                            type="text"
                                            placeholder="Enter assigned staff name"
                                            inputClassName="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                type="button"
                                disabled={isSubmitting || saveProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={isSubmitting || saveProcessing}
                                onClick={() => submitForm()}
                            >
                                {saveProcessing || isSubmitting ? "Saving..." : "Save Enquiry"}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
