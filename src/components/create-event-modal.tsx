"use client"

import React, { useEffect, useRef } from "react"
import { Formik, Form, Field, ErrorMessage, FormikHelpers, FormikProps } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EventFormData, CreateEventModalProps } from "@/types/event"
import { useClients } from "@/hooks/useClients"

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    date: Yup.date().required('Date is required'),
    // clientId is optional to allow creating an event without assigning a client
    clientId: Yup.string().notRequired()
})

export default function CreateEventModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateEventModalProps) {
    const { clients, loading: clientsLoading } = useClients()
    const todayDate = new Date().toISOString().split('T')[0]
    const formikRef = useRef<FormikProps<EventFormData> | null>(null)

    const initialValues: EventFormData = editData ? ({ ...editData, date: editData.date || todayDate }) : { title: '', date: todayDate, location: '', status: '', clientId: '' }

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
            const isEdit = mode === 'edit' || !!editData?.id
            // Build minimal payload matching Postman sample / backend expectations
            const payload: Record<string, unknown> = {
                title: values.title,
                date: values.date,
            }
            if (values.location) payload.location = values.location
            if (values.clientId) payload.client = { id: values.clientId }

            const url = isEdit && editData?.id ? `/api/events/${encodeURIComponent(String(editData.id))}` : `/api/events`
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Field as={Input} id="title" name="title" placeholder="Event title" className="mt-1" />
                                        <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Field as={Input} id="date" name="date" type="date" className="mt-1" />
                                        <ErrorMessage name="date" component="div" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Field as={Input} id="location" name="location" placeholder="Venue or location" className="mt-1" />
                                </div>

                                <div>
                                    <Label htmlFor="clientId">Client</Label>
                                    {clientsLoading ? (
                                        <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">Loading clients...</div>
                                    ) : (
                                        <Field as="select" id="clientId" name="clientId" className="mt-1 w-full px-3 py-2 border rounded-md">
                                            <option value="">Select a client</option>
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
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
