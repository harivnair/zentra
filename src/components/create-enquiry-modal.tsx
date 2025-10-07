"use client"

import React, { useEffect, useRef } from "react"
import { API_ENDPOINTS } from "../lib/endpoint"
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FieldProps, FormikProps } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnquiryFormData, CreateEnquiryModalProps } from "@/types/enquiry"
import { useClients } from "@/hooks/useClients"
import dynamic from "next/dynamic"
import DatePicker from "react-datepicker"
const CreatableSelect = dynamic(() => import("react-select/creatable"), { ssr: false })
import "react-datepicker/dist/react-datepicker.css"

const validationSchema = Yup.object({
    client: Yup.string().test('client-or-name', 'Please select a client', function (value) {
        const { clientName } = this.parent as { clientName?: string }
        return Boolean(value) || Boolean(clientName)
    }),
    eventType: Yup.string().oneOf(['PERSONAL', 'CORPORATE', 'OTHER'], 'Please select an event type').required("Event type is required"),
    fromDate: Yup.string().required("Event start date & time is required"),
    toDate: Yup.string().required("Event end date & time is required").test('after-start', 'End must be after start', function (value) {
        const { fromDate } = this.parent as { fromDate?: string }
        if (!value || !fromDate) return true
        return new Date(value) >= new Date(fromDate)
    }),
    location: Yup.string().required("Location is required"),
    venue: Yup.string().required("Venue is required"),
    highlvelRequirement: Yup.string().required("High level requirements are required").min(10, "Please provide more detailed requirements (at least 10 characters)"),
    clientPoC: Yup.string().optional(),
    enquiryPoCNumber: Yup.string().required("Client POC contact number is required").matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    eventPoC: Yup.string().optional(),
})

export default function CreateEnquiryModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateEnquiryModalProps) {
    const { clients, loading: clientsLoading, refresh: refreshClients } = useClients()

    // Formik ref so we can set fields from outside when clients finish loading
    const formikRef = useRef<FormikProps<EnquiryFormData> | null>(null)

    // Helper function to normalize dates for datetime-local inputs (YYYY-MM-DDTHH:mm)
    const normalizeDateForForm = (dateStr: string) => {
        if (!dateStr) return ""
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return dateStr
            const iso = d.toISOString()
            return iso.slice(0, 16)
        } catch {
            return dateStr
        }
    }

    const initialValues: EnquiryFormData = editData ? {
        ...editData,
        fromDate: normalizeDateForForm(editData.fromDate) || "",
        toDate: normalizeDateForForm(editData.toDate) || "",
        eventType: editData.eventType || 'CORPORATE',
    } : {
        highlvelRequirement: "", fromDate: "", toDate: "",
        location: "", venue: "", clientPoC: "", enquiryPoCNumber: "", client: "", clientName: "",
        eventType: 'CORPORATE'
    }

    const handleSubmit = async (values: EnquiryFormData, { setSubmitting, setStatus, resetForm }: FormikHelpers<EnquiryFormData>) => {
        try {
            setStatus(null)
            const isEdit = mode === 'edit' || !!editData?.id

            // Helper to convert datetime-local (YYYY-MM-DDTHH:mm) to ISO string with Z
            const toIsoWithZFromDate = (dateVal?: string | Date) => {
                if (!dateVal) return dateVal as unknown as string
                if (typeof dateVal === 'string') {
                    if (dateVal.endsWith('Z')) return dateVal
                    return `${dateVal}:00.000Z`
                }
                return new Date(dateVal).toISOString()
            }

            let clientId = values.client
            // If user typed a new client (clientName present but no client id), create it now
            if (!clientId && values.clientName) {
                const res = await fetch(API_ENDPOINTS.clients.list, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: values.clientName })
                })
                if (!res.ok) throw new Error('Failed to create client')
                const created = await res.json()
                clientId = created.id
            }

            const requestBody = {
                ...values,
                client: clientId,
                // Always use current time for enquiryDate per requirement
                enquiryDate: new Date().toISOString(),
                fromDate: toIsoWithZFromDate(values.fromDate as unknown as Date),
                toDate: toIsoWithZFromDate(values.toDate as unknown as Date)
            }

            // Include ID for edit mode
            if (isEdit && editData?.id) {
                requestBody.id = editData.id
            }

            const response = await fetch(API_ENDPOINTS.enquiries.list, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} enquiry: ${response.statusText}`)

            await response.json()
            onSubmit()

            // Reset form only for create mode
            if (!isEdit) {
                resetForm({ values: { ...initialValues } })
            }
            onClose()
        } catch (error) {
            setStatus(error instanceof Error ? error.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} enquiry`)
        } finally {
            setSubmitting(false)
        }
    }

    // When clients are loaded and we have edit data, set the client only if it exists in the clients array
    useEffect(() => {
        if (!isOpen) return
        if (!clientsLoading && editData?.client && formikRef.current) {
            const found = clients.find(c => c.id === editData.client)
            if (found) {
                const currentClient = formikRef.current.values.client
                if (currentClient !== editData.client) {
                    formikRef.current.setFieldValue('client', editData.client)
                }
            } else {
                // If not found, clear the client field to avoid showing the ID
                formikRef.current.setFieldValue('client', '')
            }
        }
    }, [isOpen, clientsLoading, editData?.client, clients])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
                <Formik innerRef={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ errors, touched, isSubmitting, status, values, setFieldValue }) => (
                        <Form>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">📨</div>
                                    <div>
                                        <h2 className="text-xl font-semibold">{mode === 'edit' ? 'Edit Enquiry' : 'Create Enquiry'}</h2>
                                        <p className="text-sm text-gray-600">{mode === 'edit' ? 'Update the enquiry details' : 'Add the following details to create an enquiry'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" type="button">×</button>
                            </div>

                            <div className="pt-4 space-y-4">
                                {status && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{status}</div>}

                                {/* Enquiry Date removed; set internally on submit */}

                                {/* Row 2: Event Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fromDate">Event From (Date & Time)</Label>
                                        <Field name="fromDate">
                                            {({ field, form }: FieldProps) => (
                                                <DatePicker
                                                    id="fromDate"
                                                    selected={field.value ? new Date(field.value) : null}
                                                    onChange={(date: Date | null) => form.setFieldValue('fromDate', date ? date.toISOString() : '')}
                                                    showTimeSelect
                                                    timeIntervals={15}
                                                    dateFormat="MMM d, yyyy h:mm aa"
                                                    placeholderText="Select date & time"
                                                    className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm ${errors.fromDate && touched.fromDate ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="fromDate" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="toDate">Event To (Date & Time)</Label>
                                        <Field name="toDate">
                                            {({ field, form }: FieldProps) => (
                                                <DatePicker
                                                    id="toDate"
                                                    selected={field.value ? new Date(field.value) : null}
                                                    onChange={(date: Date | null) => form.setFieldValue('toDate', date ? date.toISOString() : '')}
                                                    showTimeSelect
                                                    timeIntervals={15}
                                                    dateFormat="MMM d, yyyy h:mm aa"
                                                    placeholderText="Select date & time"
                                                    className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm ${errors.toDate && touched.toDate ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="toDate" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                {/* Location and Venue */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Field as={Input} id="location" name="location" type="text" placeholder="Enter event location" className={`mt-1 ${errors.location && touched.location ? 'border-red-500' : ''}`} />
                                        <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="venue">Venue</Label>
                                        <Field as={Input} id="venue" name="venue" type="text" placeholder="Enter event venue" className={`mt-1 ${errors.venue && touched.venue ? 'border-red-500' : ''}`} />
                                        <ErrorMessage name="venue" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <Label htmlFor="highlvelRequirement">High Level Requirements</Label>
                                    <Field as="textarea" id="highlvelRequirement" name="highlvelRequirement" rows={4} placeholder="Describe the high level requirements for the event" className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${errors.highlvelRequirement && touched.highlvelRequirement ? 'border-red-500' : 'border-gray-300'}`} />
                                    <ErrorMessage name="highlvelRequirement" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                {/* Client Information Section */}
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-md font-semibold mb-3 text-gray-700">Client Information</h3>

                                    {/* Event Type Radio Buttons (first) */}
                                    <div className="mb-4">
                                        <Label>Event Type</Label>
                                        <div className="mt-2 flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Field type="radio" name="eventType" value="PERSONAL" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Personal</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Field type="radio" name="eventType" value="CORPORATE" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Corporate</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Field type="radio" name="eventType" value="OTHER" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Other</span>
                                            </label>
                                        </div>
                                        <ErrorMessage name="eventType" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>

                                    {/* Select/Create Client */}
                                    <div className="mb-4">
                                        <Label htmlFor="client">Client</Label>
                                        {clientsLoading ? (
                                            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Loading clients...</div>
                                        ) : (
                                            <>
                                                <CreatableSelect
                                                    inputId="client"
                                                    classNamePrefix="react-select"
                                                    isClearable
                                                    placeholder="Search or create client..."
                                                    value={(() => {
                                                        const option = clients.find(c => c.id === values.client);
                                                        if (option) return { value: option.id, label: option.name };
                                                        if (clientsLoading) return null;
                                                        if (values.clientName) return { value: '__new__', label: values.clientName };
                                                        return null;
                                                    })()}
                                                    onChange={(opt) => {
                                                        const selected = Array.isArray(opt) ? opt[0] : opt;
                                                        if (!selected) {
                                                            setFieldValue('client', '')
                                                            setFieldValue('clientName', '')
                                                            return
                                                        }
                                                        const sel = selected as { value: string; label: string }
                                                        if (sel.value === '__new__') {
                                                            setFieldValue('client', '')
                                                            setFieldValue('clientName', sel.label)
                                                            if (values.eventType === 'PERSONAL') {
                                                                setFieldValue('clientPoC', sel.label)
                                                            }
                                                        } else {
                                                            setFieldValue('client', sel.value)
                                                            setFieldValue('clientName', '')
                                                            if (values.eventType === 'PERSONAL') {
                                                                const selectedClient = clients.find(c => c.id === sel.value)
                                                                if (selectedClient) setFieldValue('clientPoC', selectedClient.name)
                                                            }
                                                        }
                                                    }}
                                                    onCreateOption={async (inputValue: string) => {
                                                        // Do not persist immediately; store typed name and show as selected
                                                        setFieldValue('client', '')
                                                        setFieldValue('clientName', inputValue)
                                                        if (values.eventType === 'PERSONAL') {
                                                            setFieldValue('clientPoC', inputValue)
                                                        }
                                                    }}
                                                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                                                    className={`mt-1 ${errors.client && touched.client ? 'border-red-500 rounded' : ''}`}
                                                />
                                                <ErrorMessage name="client" component="div" className="mt-1 text-sm text-red-600" />
                                            </>
                                        )}
                                    </div>

                                    {/* Client POC */}
                                    <div className="mb-4">
                                        <Label htmlFor="clientPoC">Client POC {values.eventType === 'PERSONAL' && '(Same as Client Name)'}
                                        </Label>
                                        <Field
                                            as={Input}
                                            id="clientPoC"
                                            name="clientPoC"
                                            type="text"
                                            placeholder={values.eventType === 'CORPORATE' ? "Enter POC name" : "Client name (auto-filled)"}
                                            disabled={values.eventType === 'PERSONAL'}
                                            className={`mt-1 ${values.eventType === 'PERSONAL' ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.clientPoC && touched.clientPoC ? 'border-red-500' : ''}`}
                                        />
                                        <ErrorMessage name="clientPoC" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>

                                    {/* Client POC Contact Number */}
                                    <div>
                                        <Label htmlFor="enquiryPoCNumber">Client POC Contact Number</Label>
                                        <Field name="enquiryPoCNumber" render={({ field, form }: FieldProps) => (
                                            <Input {...field} id="enquiryPoCNumber" type="tel" placeholder="1234567890 (10 digits)" maxLength={10} onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                form.setFieldValue('enquiryPoCNumber', value)
                                            }} className={`mt-1 ${errors.enquiryPoCNumber && touched.enquiryPoCNumber ? 'border-red-500' : ''}`} />
                                        )} />
                                        <ErrorMessage name="enquiryPoCNumber" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>

                                    {/* Event POC */}
                                    <div className="mt-4">
                                        <Label htmlFor="eventPoC">Event POC</Label>
                                        <Field as={Input} id="eventPoC" name="eventPoC" type="text" placeholder="Enter event POC name" className={`mt-1 ${errors.eventPoC && touched.eventPoC ? 'border-red-500' : ''}`} />
                                        <ErrorMessage name="eventPoC" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting ? (mode === 'edit' ? "Updating..." : "Creating...") : (mode === 'edit' ? "Update Enquiry" : "Create Enquiry")}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}