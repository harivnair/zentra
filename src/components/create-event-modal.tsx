"use client"

import React, { useEffect, useRef, useState } from "react"
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FormikProps } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EventFormData, CreateEventModalProps, EstimateDropdownItem, EstimateEventDetails } from "@/types/event"
import { useClients } from "@/hooks/useClients"
import { apiRequest } from "@/lib/api-client"
import { toast } from "sonner"

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    eventStartDate: Yup.string().required('Event start date is required'),
    eventEndDate: Yup.string().required('Event end date is required').test('after-start', 'End date must be after start date', function (value) {
        const { eventStartDate } = this.parent as { eventStartDate?: string }
        if (!value || !eventStartDate) return true
        return new Date(value) >= new Date(eventStartDate)
    }),
    location: Yup.string().optional(),
    venue: Yup.string().optional(),
    clientId: Yup.string().notRequired()
})

export default function CreateEventModal({ isOpen, onClose, onSubmit, editData, prefillData, mode = 'create' }: CreateEventModalProps) {
    const { clients, loading: clientsLoading } = useClients()
    const formikRef = useRef<FormikProps<EventFormData> | null>(null)
    const [estimateDropdown, setEstimateDropdown] = useState<EstimateDropdownItem[]>([])
    const [loadingEstimates, setLoadingEstimates] = useState(false)
    const [loadingEventDetails, setLoadingEventDetails] = useState(false)
    const [selectedEstimateId, setSelectedEstimateId] = useState<string>('')
    const [estimateError, setEstimateError] = useState<string>('')

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedEstimateId('')
            setEstimateError('')
            setEstimateDropdown([])
        }
    }, [isOpen])

    // Fetch estimate dropdown on modal open
    useEffect(() => {
        if (!isOpen) return

        const fetchEstimateDropdown = async () => {
            try {
                setLoadingEstimates(true)
                const res = await apiRequest('/api/estimates/dropdown')
                if (!res.ok) {
                    throw new Error('Failed to fetch estimates')
                }
                const data: EstimateDropdownItem[] = await res.json()
                setEstimateDropdown(data)
            } catch (error) {
                console.error('Error fetching estimate dropdown:', error)
                toast.error('Failed to load estimates')
            } finally {
                setLoadingEstimates(false)
            }
        }

        fetchEstimateDropdown()
    }, [isOpen])

    // Fetch event details when estimate is selected
    const handleEstimateSelect = async (estimateId: string) => {
        if (!estimateId || !formikRef.current) {
            setSelectedEstimateId('')
            setEstimateError('')
            return
        }

        try {
            setLoadingEventDetails(true)
            setEstimateError('')
            const res = await apiRequest(`/api/estimates/${estimateId}/enquiry`)
            if (!res.ok) {
                throw new Error('Failed to fetch event details')
            }
            const responseData = await res.json()

            // Handle new nested response structure: { estimateId, enquiry: {...} }
            const enquiryData = responseData.enquiry || responseData
            const eventDetails: EstimateEventDetails = enquiryData
            // Use estimateId from response if available, otherwise use the parameter
            const responseEstimateId = responseData.estimateId || estimateId

            // Populate form with event details
            // Use eventName if available, otherwise fall back to title
            const eventTitle = eventDetails.eventName || eventDetails.title || ''

            // Extract clientId - handle both string and object formats
            const clientId = typeof eventDetails.client === 'string'
                ? eventDetails.client
                : eventDetails.client?.id || ''

            // Use 'id' field from enquiry as enquiryId
            const enquiryId = eventDetails.id || eventDetails.enquiryId || ''

            formikRef.current.setValues({
                ...formikRef.current.values,
                title: eventTitle,
                eventStartDate: formatDateForInput(eventDetails.fromDate),
                eventEndDate: formatDateForInput(eventDetails.toDate),
                location: eventDetails.location || '',
                venue: eventDetails.venue || '',
                clientId: clientId,
                estimateId: responseEstimateId,
                enquiryId: enquiryId,
            })

            setSelectedEstimateId(responseEstimateId)
            toast.success('Event details loaded from estimate')
        } catch (error) {
            console.error('Error fetching event details:', error)
            toast.error('Failed to load event details')
            setEstimateError('Failed to load event details')
        } finally {
            setLoadingEventDetails(false)
        }
    }

    // Helper function to format date for datetime-local input
    const formatDateForInput = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return ''
            const iso = d.toISOString()
            return iso.slice(0, 16) // YYYY-MM-DDTHH:mm
        } catch {
            return ''
        }
    }

    const initialValues: EventFormData = editData ? {
        ...editData,
        title: editData.title || editData.eventName || '',
        eventStartDate: formatDateForInput(editData.eventStartDate),
        eventEndDate: formatDateForInput(editData.eventEndDate),
    } : prefillData ? {
        title: prefillData.title || prefillData.eventName || '',
        eventStartDate: formatDateForInput(prefillData.eventStartDate),
        eventEndDate: formatDateForInput(prefillData.eventEndDate),
        location: prefillData.location || '',
        venue: prefillData.venue || '',
        clientId: prefillData.clientId || '',
        estimateId: prefillData.estimateId,
        enquiryId: prefillData.enquiryId,
    } : {
        title: '',
        eventStartDate: '',
        eventEndDate: '',
        location: '',
        venue: '',
        clientId: '',
    }

    useEffect(() => {
        if (!isOpen) return
        if (!clientsLoading && editData?.clientId && formikRef.current) {
            const current = formikRef.current.values.clientId
            if (current !== editData.clientId) formikRef.current.setFieldValue('clientId', editData.clientId)
        }
    }, [isOpen, clientsLoading, editData?.clientId])

    const handleSubmit = async (values: EventFormData, { setSubmitting, setStatus }: FormikHelpers<EventFormData>) => {
        try {
            setStatus(null)

            // Validate estimate selection in create mode
            if (mode === 'create' && !selectedEstimateId) {
                setEstimateError('Please select a final estimate')
                setSubmitting(false)
                return
            }

            // Ensure enquiryId is present
            if (mode === 'create' && !values.enquiryId) {
                setEstimateError('Enquiry information is missing. Please select an estimate again.')
                setSubmitting(false)
                return
            }

            const isEdit = mode === 'edit' || !!editData?.id

            // Convert to backend format
            const payload: Record<string, unknown> = {
                title: values.title,
                eventStartDate: values.eventStartDate,
                eventEndDate: values.eventEndDate,
            }

            if (values.location) payload.location = values.location
            if (values.venue) payload.venue = values.venue
            if (values.clientId) payload.client = { id: values.clientId }
            if (values.enquiryId) payload.enquiryId = values.enquiryId
            if (values.estimateId) payload.estimateId = values.estimateId
            if (values.enquiryDate) payload.enquiryDate = values.enquiryDate

            const url = isEdit && editData?.id ? `/api/events/${encodeURIComponent(String(editData.id))}` : `/api/events`
            const method = isEdit ? 'PUT' : 'POST'

            const res = await apiRequest(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(text || `Failed to ${isEdit ? 'update' : 'create'} event: ${res.status}`)
            }
            await res.json().catch(() => null)
            onSubmit()
            onClose()
        } catch (err) {
            setStatus(err instanceof Error ? err.message : 'Failed to save event')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
                <Formik innerRef={formikRef} initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, status }) => (
                        <Form>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">🎫</div>
                                    <div>
                                        <h2 className="text-xl font-semibold">{mode === 'edit' ? 'Edit Event' : 'Create Event'}</h2>
                                        <p className="text-sm text-gray-600">{mode === 'edit' ? 'Update event details' : 'Fill details to create an event'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" type="button">×</button>
                            </div>

                            <div className="pt-4 space-y-4">
                                {status && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{status}</div>}

                                {/* Estimate Dropdown - Only show in create mode */}
                                {mode === 'create' && (
                                    <div>
                                        <Label htmlFor="estimateSelect">Select Event Title <span className="text-red-600">*</span></Label>
                                        {loadingEstimates ? (
                                            <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Loading estimates...</div>
                                        ) : (
                                            <>
                                                <select
                                                    id="estimateSelect"
                                                    className="mt-1 w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
                                                    onChange={(e) => handleEstimateSelect(e.target.value)}
                                                    disabled={loadingEventDetails}
                                                    value={selectedEstimateId}
                                                >
                                                    <option value="">-- Select an event title --</option>
                                                    {estimateDropdown.map((est) => (
                                                        <option key={est.id} value={est.id}>
                                                            {est.name} ({est.version})
                                                        </option>
                                                    ))}
                                                </select>
                                                {estimateError && (
                                                    <p className="mt-1 text-sm text-red-600">{estimateError}</p>
                                                )}
                                            </>
                                        )}
                                        {loadingEventDetails && (
                                            <p className="mt-1 text-sm text-blue-600">Loading event details...</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="title">Event Title</Label>
                                    <Field as={Input} id="title" name="title" placeholder="Event title" className="mt-1" />
                                    <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="eventStartDate">Event Start Date & Time</Label>
                                        <Field as={Input} id="eventStartDate" name="eventStartDate" type="datetime-local" className="mt-1" />
                                        <ErrorMessage name="eventStartDate" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="eventEndDate">Event End Date & Time</Label>
                                        <Field as={Input} id="eventEndDate" name="eventEndDate" type="datetime-local" className="mt-1" />
                                        <ErrorMessage name="eventEndDate" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="location">Location</Label>
                                        <Field as={Input} id="location" name="location" placeholder="Enter location" className="mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="venue">Venue</Label>
                                        <Field as={Input} id="venue" name="venue" placeholder="Enter venue" className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="clientId">Client</Label>
                                    {clientsLoading ? (
                                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Loading clients...</div>
                                    ) : (
                                        <Field as="select" id="clientId" name="clientId" className="mt-1 w-full px-3 py-2 border rounded-md">
                                            <option value="">Select a client</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Field>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                                    {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Event' : 'Create Event')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
