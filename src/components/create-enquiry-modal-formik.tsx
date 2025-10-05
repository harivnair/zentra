import React, { useEffect, useRef } from "react"
import { Form, Formik, Field, ErrorMessage, FieldProps } from "formik"
import * as Yup from "yup"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { EnquiryFormData, CreateEnquiryModalProps } from "@/types/enquiry"
import { useClients } from "@/hooks/useClients"
import CreatableSelect from "react-select/creatable"

export default function CreateEnquiryModal({ isOpen, onClose, onSubmit, editData, mode = 'create' }: CreateEnquiryModalProps) {
    const { clients, loading: clientsLoading, refresh: refreshClients } = useClients()
    const todayDateTimeLocal = new Date().toISOString().slice(0, 16)

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
        location: "", venue: "", clientPoC: "", enquiryPoCNumber: "", client: "",
        eventType: 'CORPORATE'
    }

    const validationSchema = Yup.object({
        client: Yup.string().required("Please select a client"),
        eventType: Yup.string().oneOf(['CORPORATE', 'INDIVIDUAL'], 'Please select an event type').required("Event type is required"),
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

    const handleSubmit = async (values: EnquiryFormData) => {
        try {
            const isEdit = !!editData
            const requestBody = {
                ...values,
                enquiryDate: new Date().toISOString(),
                fromDate: toIsoWithZ(values.fromDate),
                toDate: toIsoWithZ(values.toDate)
            }
            await onSubmit(requestBody)
        } catch (error) {
            console.error("Error submitting enquiry:", error)
        }
    }

    const toIsoWithZ = (dtLocal?: string) => {
        if (!dtLocal) return dtLocal as unknown as string
        if (dtLocal.endsWith('Z')) return dtLocal
        return `${dtLocal}:00.000Z`
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, setFieldValue, resetForm }) => (
                    <Form>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {mode === 'create' ? 'Create New Enquiry' : 'Edit Enquiry'}
                            </h2>
                            <div className="grid gap-4">
                                {/* Event Type Radio Buttons (first) */}
                                <div className="mb-4">
                                    <Label>Event Type</Label>
                                    <div className="mt-2 flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Field type="radio" name="eventType" value="CORPORATE" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">Corporate</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Field type="radio" name="eventType" value="INDIVIDUAL" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">Individual</span>
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
                                                    const option = clients.find(c => c.id === values.client)
                                                    return option ? { value: option.id, label: `${option.name} (${option.email})` } : null
                                                })()}
                                                onChange={(opt) => {
                                                    const selected = Array.isArray(opt) ? opt[0] : opt
                                                    setFieldValue('client', selected ? (selected as { value: string }).value : '')
                                                }}
                                                onCreateOption={async (inputValue: string) => {
                                                    try {
                                                        const res = await fetch('/api/clients', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ name: inputValue })
                                                        })
                                                        if (!res.ok) throw new Error('Failed to create client')
                                                        const created = await res.json()
                                                        await (refreshClients?.() ?? Promise.resolve())
                                                        setFieldValue('client', created.id)
                                                        if (values.eventType === 'INDIVIDUAL' && created.name) {
                                                            setFieldValue('clientPoC', created.name)
                                                        }
                                                    } catch (e) {
                                                        console.error('Create client failed', e)
                                                    }
                                                }}
                                                options={clients.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
                                                className={`mt-1 ${errors.client && touched.client ? 'border-red-500 rounded' : ''}`}
                                            />
                                            <ErrorMessage name="client" component="div" className="mt-1 text-sm text-red-600" />
                                        </>
                                    )}
                                </div>

                                {/* Client POC */}
                                <div className="mb-4">
                                    <Label htmlFor="clientPoC">Client POC {values.eventType === 'INDIVIDUAL' && '(Same as Client Name)'}</Label>
                                    <Field
                                        as={Input}
                                        id="clientPoC"
                                        name="clientPoC"
                                        type="text"
                                        placeholder={values.eventType === 'CORPORATE' ? "Enter POC name" : "Client name (auto-filled)"}
                                        disabled={values.eventType === 'INDIVIDUAL'}
                                        className={`mt-1 ${values.eventType === 'INDIVIDUAL' ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.clientPoC && touched.clientPoC ? 'border-red-500' : ''}`}
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
                        <div className="flex justify-end gap-2 p-6 border-t">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit">
                                {mode === 'create' ? 'Create Enquiry' : 'Save Changes'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}
