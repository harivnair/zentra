"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui-old/button";
import { Input } from "@/components/ui-old/input";
import { Label } from "@/components/ui-old/label";
import { VendorFormData, CreateVendorModalProps } from "@/types/vendor";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";

const validationSchema = Yup.object({
    name: Yup.string().required("Vendor name is required"),
    billingAddress: Yup.string().required("Billing address is required"),
    gst: Yup.number()
        .min(0, "GST must be 0 or greater")
        .max(100, "GST cannot exceed 100%")
        .required("GST percentage is required"),
    tds: Yup.number()
        .min(0, "TDS must be 0 or greater")
        .max(100, "TDS cannot exceed 100%")
        .required("TDS percentage is required"),
    gstCertificate: Yup.string().optional(),
    phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
});

export default function CreateVendorModal({
    isOpen,
    onClose,
    onSubmit,
    editData,
    mode = "create",
}: CreateVendorModalProps) {
    const isEdit = mode === "edit" || !!editData?.id;

    const initialValues: VendorFormData = editData
        ? {
              ...editData,
              gst: editData.gst ?? 0,
              tds: editData.tds ?? 0,
              gstCertificate: editData.gstCertificate ?? "",
          }
        : {
              name: "",
              billingAddress: "",
              gst: 0,
              tds: 0,
              gstCertificate: "",
              phone: "",
          };

    const handleSubmit = async (
        values: VendorFormData,
        { setSubmitting, setStatus }: FormikHelpers<VendorFormData>
    ) => {
        try {
            setStatus(null);

            const payload = {
                name: values.name,
                billingAddress: values.billingAddress,
                gst: Number(values.gst),
                tds: Number(values.tds),
                gstCertificate: values.gstCertificate || "",
                phone: values.phone,
                items: values.items || [],
            };

            const url =
                isEdit && editData?.id
                    ? `/api/vendors/${encodeURIComponent(String(editData.id))}`
                    : `/api/vendors`;
            const method = isEdit ? "PUT" : "POST";

            const res = await apiRequest(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(
                    text || `Failed to ${isEdit ? "update" : "create"} vendor: ${res.status}`
                );
            }

            toast.success(`Vendor ${isEdit ? "updated" : "created"} successfully`);
            onSubmit();
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save vendor";
            setStatus(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="mt-12 md:mt-0 bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status }) => (
                        <Form>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-orange-100 flex items-center justify-center">
                                        🚚
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {isEdit ? "Edit Vendor" : "Add New Vendor"}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {isEdit
                                                ? "Update vendor details"
                                                : "Fill in the vendor details below"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="pt-4 space-y-4">
                                {status && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                        {status}
                                    </div>
                                )}

                                {/* Vendor Name */}
                                <div>
                                    <Label htmlFor="name">
                                        Vendor Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Field
                                        as={Input}
                                        id="name"
                                        name="name"
                                        placeholder="Enter vendor name"
                                        className="mt-1"
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <Label htmlFor="phone">
                                        Phone Number <span className="text-red-600">*</span>
                                    </Label>
                                    <Field name="phone">
                                        {({
                                            field,
                                            form,
                                        }: {
                                            field: { name: string; value: string };
                                            form: {
                                                setFieldValue: (
                                                    name: string,
                                                    value: string
                                                ) => void;
                                            };
                                        }) => (
                                            <Input
                                                {...field}
                                                id="phone"
                                                type="tel"
                                                placeholder="1234567890 (10 digits)"
                                                maxLength={10}
                                                className="mt-1"
                                                onChange={e => {
                                                    const value = e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 10);
                                                    form.setFieldValue("phone", value);
                                                }}
                                            />
                                        )}
                                    </Field>
                                    <ErrorMessage
                                        name="phone"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>

                                {/* Billing Address */}
                                <div>
                                    <Label htmlFor="billingAddress">
                                        Billing Address <span className="text-red-600">*</span>
                                    </Label>
                                    <Field
                                        as="textarea"
                                        id="billingAddress"
                                        name="billingAddress"
                                        rows={3}
                                        placeholder="Enter complete billing address"
                                        className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none border-gray-300"
                                    />
                                    <ErrorMessage
                                        name="billingAddress"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>

                                {/* GST and TDS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="gst">
                                            GST (%) <span className="text-red-600">*</span>
                                        </Label>
                                        <Field
                                            as={Input}
                                            id="gst"
                                            name="gst"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            placeholder="e.g., 18"
                                            className="mt-1"
                                        />
                                        <ErrorMessage
                                            name="gst"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="tds">
                                            TDS (%) <span className="text-red-600">*</span>
                                        </Label>
                                        <Field
                                            as={Input}
                                            id="tds"
                                            name="tds"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            placeholder="e.g., 2"
                                            className="mt-1"
                                        />
                                        <ErrorMessage
                                            name="tds"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                </div>

                                {/* GST Certificate */}
                                <div>
                                    <Label htmlFor="gstCertificate">GST Certificate Number</Label>
                                    <Field
                                        as={Input}
                                        id="gstCertificate"
                                        name="gstCertificate"
                                        placeholder="e.g., 22AAAAA0000A1Z5"
                                        className="mt-1"
                                    />
                                    <ErrorMessage
                                        name="gstCertificate"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Optional - Enter the GST registration number if available
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    {isSubmitting
                                        ? isEdit
                                            ? "Updating..."
                                            : "Creating..."
                                        : isEdit
                                        ? "Update Vendor"
                                        : "Add Vendor"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
