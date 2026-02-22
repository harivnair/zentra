'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiRequest } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/endpoint'
import { toast } from 'sonner'

interface BillingExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    eventData: {
        id?: string
        billingAddress?: string
        pan?: string
        gst?: number
        tds?: number
        serviceCharge?: number
        advanceAmt?: number
        discounts?: number
        client?: {
            gst?: string
            pan?: string
            [key: string]: unknown
        }
        [key: string]: unknown
    }
    onSave: () => void
}

export function BillingExpenseModal({ isOpen, onClose, eventData, onSave }: BillingExpenseModalProps) {
    const [billingAddress, setBillingAddress] = useState('')
    const [pan, setPan] = useState('')
    const [clientGst, setClientGst] = useState('')
    const [gst, setGst] = useState(0)
    const [tds, setTds] = useState(0)
    const [serviceCharge, setServiceCharge] = useState(0)
    const [advanceAmt, setAdvanceAmt] = useState(0)
    const [discounts, setDiscounts] = useState(0)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setBillingAddress(eventData?.billingAddress || '')
        setPan(eventData?.pan || '')
        setClientGst(eventData?.client?.gst || '')
        setGst(eventData?.gst || 0)
        setTds(eventData?.tds || 0)
        setServiceCharge(eventData?.serviceCharge || 0)
        setAdvanceAmt(eventData?.advanceAmt || 0)
        setDiscounts(eventData?.discounts || 0)
    }, [isOpen, eventData])

    const handleSave = async () => {
        setSaving(true)
        try {
            const updatedEvent = {
                ...eventData,
                billingAddress,
                pan,
                gst,
                tds,
                serviceCharge,
                advanceAmt,
                discounts,
                client: {
                    ...eventData?.client,
                    gst: clientGst,
                },
            }

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: 'POST',
                body: JSON.stringify(updatedEvent),
            })

            if (res.ok) {
                toast.success('Billing details saved successfully')
                onSave()
                onClose()
            } else {
                toast.error('Failed to save billing details')
            }
        } catch (err) {
            console.error('Error saving billing details:', err)
            toast.error('Error saving billing details')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:!bg-gray-900 dark:border dark:border-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    aria-label="Close modal"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing & Expenses</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage billing address, tax details, and financial information.</p>
                </div>

                <div className="space-y-5">
                    {/* Billing Address - Full Width */}
                    <div>
                        <Label className="text-sm font-medium">Billing Address</Label>
                        <textarea
                            value={billingAddress}
                            onChange={e => setBillingAddress(e.target.value)}
                            placeholder="Enter billing address"
                            rows={3}
                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* PAN and Client GST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">PAN</Label>
                            <Input
                                type="text"
                                value={pan}
                                onChange={e => setPan(e.target.value.toUpperCase())}
                                placeholder="e.g., ABCDE1234F"
                                className="text-sm mt-1"
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Client GST</Label>
                            <Input
                                type="text"
                                value={clientGst}
                                onChange={e => setClientGst(e.target.value.toUpperCase())}
                                placeholder="e.g., 29ABCDE1234F1ZK"
                                className="text-sm mt-1"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    {/* GST and TDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium">GST %</Label>
                            <Input
                                type="number"
                                value={gst}
                                onChange={e => setGst(parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.5"
                                className="text-sm mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">TDS %</Label>
                            <Input
                                type="number"
                                value={tds}
                                onChange={e => setTds(parseFloat(e.target.value) || 0)}
                                min="0"
                                max="100"
                                step="0.5"
                                className="text-sm mt-1"
                            />
                        </div>
                    </div>

                    {/* Service Charge, Advance, Discounts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium">Service Charge (₹)</Label>
                            <Input
                                type="number"
                                value={serviceCharge}
                                onChange={e => setServiceCharge(parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="text-sm mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Advance Amount (₹)</Label>
                            <Input
                                type="number"
                                value={advanceAmt}
                                onChange={e => setAdvanceAmt(parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="text-sm mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Discounts (₹)</Label>
                            <Input
                                type="number"
                                value={discounts}
                                onChange={e => setDiscounts(parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="text-sm mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {saving ? 'Saving...' : 'Save Billing Details'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
