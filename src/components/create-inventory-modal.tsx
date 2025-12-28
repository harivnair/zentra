"use client"

import React from "react"
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InventoryFormData, CreateInventoryModalProps } from "@/types/inventory"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"
import { API_ENDPOINTS } from "@/lib/endpoint"

const validationSchema = Yup.object({
    itemName: Yup.string().required('Item name is required'),
    category: Yup.string().required('Category is required'),
    spec: Yup.string().optional(),
    dimensions: Yup.string().optional(),
    quantity: Yup.number()
        .min(0, 'Quantity must be 0 or greater')
        .required('Quantity is required'),
    price: Yup.number()
        .min(0, 'Price must be 0 or greater')
        .required('Price is required'),
})

export default function CreateInventoryModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateInventoryModalProps) {
    const isEdit = mode === 'edit' || !!editData?.id

    const initialValues: InventoryFormData = editData ? {
        ...editData,
        quantity: editData.quantity ?? 0,
        price: editData.price ?? 0,
    } : {
        itemName: '',
        category: '',
        spec: '',
        dimensions: '',
        quantity: 0,
        price: 0,
    }

    const handleSubmit = async (values: InventoryFormData, { setSubmitting, setStatus }: FormikHelpers<InventoryFormData>) => {
        try {
            setStatus(null)

            const payload = {
                ...(isEdit && editData?.id ? { id: editData.id } : {}),
                itemName: values.itemName,
                category: values.category,
                spec: values.spec,
                dimensions: values.dimensions,
                quantity: Number(values.quantity),
                price: Number(values.price),
            }

            const url = isEdit && editData?.id
                ? API_ENDPOINTS.inventory.detail(editData.id)
                : API_ENDPOINTS.inventory.list
            const method = isEdit ? 'PUT' : 'POST'

            const res = await apiRequest(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(text || `Failed to ${isEdit ? 'update' : 'create'} inventory item: ${res.status}`)
            }

            toast.success(`Inventory item ${isEdit ? 'updated' : 'created'} successfully`)
            onSubmit()
            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save inventory item'
            setStatus(message)
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, status }) => (
                        <Form>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">
                                    {mode === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {status && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                                    {status}
                                </div>
                            )}

                            <div className="grid gap-4">
                                <div>
                                    <Label htmlFor="itemName">Item Name</Label>
                                    <Field
                                        as={Input}
                                        id="itemName"
                                        name="itemName"
                                        placeholder="Enter item name"
                                        className="mt-1"
                                    />
                                    <ErrorMessage name="itemName" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Field
                                        as={Input}
                                        id="category"
                                        name="category"
                                        placeholder="Enter category"
                                        className="mt-1"
                                    />
                                    <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="spec">Specification</Label>
                                        <Field
                                            as={Input}
                                            id="spec"
                                            name="spec"
                                            placeholder="Enter specification"
                                            className="mt-1"
                                        />
                                        <ErrorMessage name="spec" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="dimensions">Dimensions</Label>
                                        <Field
                                            as={Input}
                                            id="dimensions"
                                            name="dimensions"
                                            placeholder="Enter dimensions"
                                            className="mt-1"
                                        />
                                        <ErrorMessage name="dimensions" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Field
                                            as={Input}
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            placeholder="0"
                                            className="mt-1"
                                        />
                                        <ErrorMessage name="quantity" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="price">Price</Label>
                                        <Field
                                            as={Input}
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                        <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Add Item' : 'Save Changes')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
