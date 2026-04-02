"use client";

import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryFormData, CreateInventoryModalProps } from "@/types/inventory";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";

const validationSchema = Yup.object({
    itemName: Yup.string().required("Item name is required"),
    category: Yup.string().required("Category is required"),
    spec: Yup.string().optional(),
    dimensions: Yup.string().optional(),
    quantity: Yup.number().min(0, "Quantity must be 0 or greater").required("Quantity is required"),
    price: Yup.number().min(0, "Price must be 0 or greater").required("Price is required"),
});

export default function CreateInventoryModal({
    isOpen,
    onClose,
    onSubmit,
    editData,
    mode = "create",
}: CreateInventoryModalProps) {
    const isEdit = mode === "edit" || !!editData?.id;

    const initialValues: InventoryFormData = editData
        ? {
              ...editData,
              quantity: editData.quantity ?? 0,
              price: editData.price ?? 0,
          }
        : {
              itemName: "",
              category: "",
              spec: "",
              dimensions: "",
              quantity: 0,
              price: 0,
          };

    const handleSubmit = async (
        values: InventoryFormData,
        { setSubmitting, setStatus }: FormikHelpers<InventoryFormData>,
    ) => {
        try {
            setStatus(null);

            const payload = {
                ...(isEdit && editData?.id ? { id: editData.id } : {}),
                itemName: values.itemName,
                category: values.category,
                spec: values.spec,
                dimensions: values.dimensions,
                quantity: Number(values.quantity),
                price: Number(values.price),
            };

            const url =
                isEdit && editData?.id
                    ? API_ENDPOINTS.inventory.detail(editData.id)
                    : API_ENDPOINTS.inventory.list;
            const method = isEdit ? "PUT" : "POST";

            const res = await apiRequest(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(
                    text ||
                        `Failed to ${isEdit ? "update" : "create"} inventory item: ${res.status}`,
                );
            }

            toast.success(`Inventory item ${isEdit ? "updated" : "created"} successfully`);
            onSubmit();
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save inventory item";
            setStatus(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="lg"
            title={mode === "create" ? "Add Inventory Item" : "Edit Inventory Item"}
        >
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, status }) => (
                    <Form>
                        <ModalBody>
                            {status && (
                                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    {status}
                                </div>
                            )}

                            <div className="grid gap-4">
                                <div>
                                    <label
                                        htmlFor="itemName"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Item Name
                                    </label>
                                    <Field
                                        as={Input}
                                        id="itemName"
                                        name="itemName"
                                        placeholder="Enter item name"
                                    />
                                    <ErrorMessage
                                        name="itemName"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="category"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Category
                                    </label>
                                    <Field
                                        as={Input}
                                        id="category"
                                        name="category"
                                        placeholder="Enter category"
                                    />
                                    <ErrorMessage
                                        name="category"
                                        component="div"
                                        className="mt-1 text-sm text-red-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="spec"
                                            className="block text-sm font-medium text-foreground"
                                        >
                                            Specification
                                        </label>
                                        <Field
                                            as={Input}
                                            id="spec"
                                            name="spec"
                                            placeholder="Enter specification"
                                        />
                                        <ErrorMessage
                                            name="spec"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="dimensions"
                                            className="block text-sm font-medium text-foreground"
                                        >
                                            Dimensions
                                        </label>
                                        <Field
                                            as={Input}
                                            id="dimensions"
                                            name="dimensions"
                                            placeholder="Enter dimensions"
                                        />
                                        <ErrorMessage
                                            name="dimensions"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className="block text-sm font-medium text-foreground"
                                        >
                                            Quantity
                                        </label>
                                        <Field
                                            as={Input}
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            placeholder="0"
                                        />
                                        <ErrorMessage
                                            name="quantity"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-sm font-medium text-foreground"
                                        >
                                            Price
                                        </label>
                                        <Field
                                            as={Input}
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder="0.00"
                                        />
                                        <ErrorMessage
                                            name="price"
                                            component="div"
                                            className="mt-1 text-sm text-red-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Saving..."
                                    : mode === "create"
                                      ? "Add Item"
                                      : "Save Changes"}
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
