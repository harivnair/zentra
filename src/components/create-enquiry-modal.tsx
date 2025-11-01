"use client"

import React, { useEffect, useRef, useState } from "react"
import { API_ENDPOINTS } from "../lib/endpoint"
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FieldProps, FormikProps } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnquiryFormData, CreateEnquiryModalProps } from "@/types/enquiry"
import { useClients } from "@/hooks/useClients"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useEstimatePrefill, type EstimatePrefillPayload } from "@/context/estimate-prefill"
import { toast } from "sonner"
import type { EstimateStatus } from "@/types/estimate"
import DatePicker from "react-datepicker"
import { apiRequest } from "@/lib/api-client"
const CreatableSelect = dynamic(() => import("react-select/creatable"), { ssr: false })
import "react-datepicker/dist/react-datepicker.css"

const validationSchema = Yup.object({
    client: Yup.string().test('client-or-name', 'Please select a client', function (value) {
        const { clientName } = this.parent as { clientName?: string }
        return Boolean(value) || Boolean(clientName)
    }),
    eventType: Yup.string().oneOf(['PERSONAL', 'CORPORATE', 'OTHER'], 'Please select an event type').required("Event type is required"),
    fromDate: Yup.string()
        .transform(value => (value ? value : null))
        .nullable()
        .notRequired(),
    toDate: Yup.string()
        .transform(value => (value ? value : null))
        .nullable()
        .notRequired()
        .test('after-start', 'End must be after start', function (value) {
            const { fromDate } = this.parent as { fromDate?: string | null }
            if (!value || !fromDate) return true
            return new Date(value) >= new Date(fromDate)
        }),
    location: Yup.string().required("Location is required"),
    venue: Yup.string().required("Venue is required"),
    title: Yup.string().required("Event title is required").min(3, "Add at least 3 characters"),
    highlvelRequirement: Yup.string().required("High level requirements are required").min(10, "Please provide more detailed requirements (at least 10 characters)"),
    clientPoC: Yup.string().optional(),
    enquiryPoCNumber: Yup.string().required("Client POC contact number is required").matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    eventPoC: Yup.string().optional(),
})

export default function CreateEnquiryModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateEnquiryModalProps) {
    const { clients, loading: clientsLoading } = useClients()
    const router = useRouter()
    const { setPrefill: setEstimatePrefill } = useEstimatePrefill()

    // Formik ref so we can set fields from outside when clients finish loading
    const formikRef = useRef<FormikProps<EnquiryFormData> | null>(null)
    const submitIntentRef = useRef<'save' | 'estimate'>('save')
    const [estimateProcessing, setEstimateProcessing] = useState(false)
    const [saveProcessing, setSaveProcessing] = useState(false)

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
        title: editData.title ?? "",
        fromDate: normalizeDateForForm(editData.fromDate || "") || "",
        toDate: normalizeDateForForm(editData.toDate || "") || "",
        eventType: editData.eventType || 'CORPORATE',
    } : {
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
        eventType: 'CORPORATE'
    }

    const isEdit = mode === 'edit' || !!editData?.id

    const handleSubmit = async (values: EnquiryFormData, { setSubmitting, setStatus, resetForm }: FormikHelpers<EnquiryFormData>) => {
        const intent = submitIntentRef.current
        if (intent === 'estimate') {
            setEstimateProcessing(true)
        } else {
            setSaveProcessing(true)
        }

        try {
            setStatus(null)
            const toIsoWithZFromDate = (dateVal?: string | Date) => {
                if (!dateVal) return undefined
                if (typeof dateVal === 'string') {
                    if (dateVal.endsWith('Z')) return dateVal
                    if (dateVal.length === 16) return `${dateVal}:00.000Z`
                    return dateVal
                }
                return new Date(dateVal).toISOString()
            }

            const existingClient = clients.find(c => c.id === values.client)
            let clientId = values.client
            let clientDisplayName = existingClient?.name ?? ''

            if (!clientId && values.clientName) {
                const res = await apiRequest(API_ENDPOINTS.clients.list, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: values.clientName })
                })
                if (!res.ok) throw new Error('Failed to create client')
                const created = await res.json()
                clientId = created.id
                clientDisplayName = typeof created.name === 'string' ? created.name : ''
            }

            if (!clientId) {
                throw new Error('Client information is required before saving the enquiry')
            }

            const { fromDate, toDate, ...restValues } = values
            const formattedFromDate = toIsoWithZFromDate(fromDate as unknown as string | Date)
            const formattedToDate = toIsoWithZFromDate(toDate as unknown as string | Date)

            const requestBody: Record<string, unknown> = {
                ...restValues,
                client: clientId,
                enquiryDate: new Date().toISOString(),
                eventName: values.title, // Send title as eventName to backend
            }

            if (formattedFromDate) requestBody.fromDate = formattedFromDate
            if (formattedToDate) requestBody.toDate = formattedToDate

            if (isEdit && editData?.id) {
                requestBody.id = editData.id
            }

            const response = await apiRequest(API_ENDPOINTS.enquiries.list, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} enquiry: ${response.statusText}`)

            const contentType = response.headers.get('content-type') ?? ''
            let savedEnquiry: Record<string, unknown> | null = null

            if (contentType.includes('application/json')) {
                try {
                    savedEnquiry = await response.json() as Record<string, unknown>
                } catch {
                    throw new Error('Failed to parse enquiry response. Please try again.')
                }
            } else if (response.status !== 204) {
                throw new Error('Received unexpected response when saving the enquiry.')
            }

            const sourceEnquiry: Record<string, unknown> | null = savedEnquiry ?? (isEdit && editData ? { ...editData } as unknown as Record<string, unknown> : null)

            const pick = <T,>(record: Record<string, unknown> | null | undefined, keys: string[]): T | undefined => {
                if (!record) return undefined
                for (const key of keys) {
                    if (key in record && record[key] !== undefined && record[key] !== null) {
                        return record[key] as T
                    }
                }
                return undefined
            }

            const persistedEnquiryId = (() => {
                const raw = pick<string | number>(sourceEnquiry, ['id', 'enquiryId', 'enquiry_id'])
                if (raw === undefined || raw === null) return undefined
                return String(raw)
            })()

            const estimatePrefill: EstimatePrefillPayload | null = (() => {
                if (intent !== 'estimate') return null
                if (!sourceEnquiry) {
                    throw new Error('Enquiry details are unavailable for estimate creation.')
                }

                const savedClient = pick<unknown>(sourceEnquiry, ['client'])
                const normalisedClient = (() => {
                    if (savedClient && typeof savedClient === 'object') {
                        const clientRecord = savedClient as { id?: string | number; name?: string }
                        if (clientRecord.id || clientRecord.name) {
                            return {
                                id: clientRecord.id ? String(clientRecord.id) : undefined,
                                name: clientRecord.name,
                            }
                        }
                    }
                    if (clientId) {
                        return {
                            id: String(clientId),
                            name: clientDisplayName || existingClient?.name,
                        }
                    }
                    return undefined
                })()

                const rawItems = pick<Record<string, unknown>>(sourceEnquiry, ['items'])
                const cleanedItems = rawItems && typeof rawItems === 'object'
                    ? Object.entries(rawItems).reduce<Record<string, { id: string; description: string; quantity: number; unitCost: number; total: number }[]>>((acc, [category, entries]) => {
                        if (!Array.isArray(entries)) return acc
                        acc[category] = entries.map((item, index) => {
                            const record = item as Record<string, unknown>
                            const quantity = typeof record.quantity === 'number' ? record.quantity : Number(record.quantity ?? 0)
                            const unitCost = typeof record.unitCost === 'number' ? record.unitCost : Number(record.unitCost ?? 0)
                            const totalValue = quantity * unitCost
                            return {
                                id: String(record.id ?? `${category}-${index}`),
                                description: typeof record.description === 'string' ? record.description : 'Line item',
                                quantity: Number.isFinite(quantity) ? quantity : 0,
                                unitCost: Number.isFinite(unitCost) ? unitCost : 0,
                                total: Number.isFinite(totalValue) ? Number(totalValue.toFixed(2)) : 0,
                            }
                        })
                        return acc
                    }, {})
                    : undefined

                const rawStatus = pick<string>(sourceEnquiry, ['status', 'enquiryStatus'])
                const allowedStatuses: EstimateStatus[] = ['OPEN', 'CLOSED', 'CANCELLED']
                const normalisedStatus = rawStatus ? rawStatus.toUpperCase() : undefined
                const status = normalisedStatus && allowedStatuses.includes(normalisedStatus as EstimateStatus)
                    ? (normalisedStatus as EstimateStatus)
                    : 'OPEN'

                return {
                    enquiryId: persistedEnquiryId,
                    title: pick<string>(sourceEnquiry, ['title', 'eventName']) ?? values.title ?? '',
                    highlvelRequirement: pick<string>(sourceEnquiry, ['highlvelRequirement', 'summary', 'title']) ?? '',
                    enquiryDate: pick<string>(sourceEnquiry, ['enquiryDate', 'createdAt']),
                    fromDate: pick<string>(sourceEnquiry, ['fromDate', 'eventStart']),
                    toDate: pick<string>(sourceEnquiry, ['toDate', 'eventEnd']),
                    status,
                    location: pick<string>(sourceEnquiry, ['location', 'eventLocation']),
                    venue: pick<string>(sourceEnquiry, ['venue']) ?? '',
                    clientPoC: pick<string>(sourceEnquiry, ['clientPoC']) ?? '',
                    pocContactNumber: pick<string>(sourceEnquiry, ['enquiryPoCNumber', 'pocContactNumber', 'clientPhone']) ?? '',
                    enquiryPoC: pick<string>(sourceEnquiry, ['eventPoC', 'enquiryPoC']),
                    client: normalisedClient,
                    items: cleanedItems,
                }
            })()

            await Promise.resolve(onSubmit())

            if (!isEdit && intent === 'save') {
                resetForm({ values: { ...initialValues } })
            }

            if (intent === 'estimate') {
                if (!estimatePrefill) {
                    throw new Error('Failed to create estimate prefill from enquiry response.')
                }

                setEstimatePrefill(estimatePrefill)
                onClose()
                router.push('/estimates')
                return
            }

            onClose()
        } catch (error) {
            const message = error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} enquiry`
            setStatus(message)
            toast.error(`Unable to ${isEdit ? 'update' : 'create'} enquiry`, {
                description: message,
            })
        } finally {
            setSubmitting(false)
            submitIntentRef.current = 'save'
            if (intent === 'estimate') {
                setEstimateProcessing(false)
            } else {
                setSaveProcessing(false)
            }
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
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
                <Formik innerRef={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ errors, touched, isSubmitting, status, values, setFieldValue, submitForm }) => (
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
                            {/* Event Title */}
                            <div>
                                <Label htmlFor="title">Event Title</Label>
                                <Field
                                    as={Input}
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Birthday party, Annual day celebration"
                                    className={`mt-1 ${errors.title && touched.title ? 'border-red-500' : ''}`}
                                />
                                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            <div className="pt-4 space-y-4">
                                {status && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{status}</div>}

                                {/* Enquiry Date removed; set internally on submit */}

                                {/* Row 2: Event Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="fromDate">Event From (Date & Time) <span className="text-gray-500 text-xs">(optional)</span></Label>
                                        <Field name="fromDate">
                                            {({ field, form }: FieldProps) => (
                                                <DatePicker
                                                    selected={field.value ? new Date(field.value) : null}
                                                    onChange={(date: Date | null) => {
                                                        form.setFieldValue('fromDate', date ? date.toISOString() : '')
                                                    }}
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
                                        <Label htmlFor="toDate">Event To (Date & Time) <span className="text-gray-500 text-xs">(optional)</span></Label>
                                        <Field name="toDate">
                                            {({ field, form }: FieldProps) => (
                                                <DatePicker
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
                                                <span className="text-sm text-gray-700">Individual</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Field type="radio" name="eventType" value="CORPORATE" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700">Corporate</span>
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
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end mt-6 pt-4 border-t">
                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting || estimateProcessing || saveProcessing}>Cancel</Button>
                                    <Button
                                        type="button"
                                        disabled={isSubmitting || saveProcessing || estimateProcessing}
                                        onClick={() => {
                                            submitIntentRef.current = 'save'
                                            submitForm()
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {saveProcessing || (isSubmitting && submitIntentRef.current === 'save')
                                            ? 'Saving...'
                                            : (mode === 'edit' ? 'Save Changes' : 'Save Enquiry')}
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                    disabled={isSubmitting || estimateProcessing}
                                    onClick={() => {
                                        submitIntentRef.current = 'estimate'
                                        submitForm()
                                    }}
                                >
                                    {estimateProcessing || (isSubmitting && submitIntentRef.current === 'estimate')
                                        ? 'Saving & Opening Estimate...'
                                        : 'Save & Create Estimate'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}