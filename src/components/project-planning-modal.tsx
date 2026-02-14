'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiRequest } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/endpoint'
import { useToast } from '@/components/ui/use-toast'
import type { Inventory } from '@/types/inventory'
import type { Vendor } from '@/types/vendor'

const CATEGORIES = ['DISPLAY', 'SOUND', 'LIGHT', 'PHOTO/VIDEO', 'POWER', 'LOGISTICS']

interface EventItemRow {
    category: string
    inventoryType: 'self' | 'external'
    item: string
    inventoryID?: string
    vendor?: string
    quantity: number
    pricePerItem: number
    days: number
    startDate: string
    endDate: string
    description: string
    finalAmt?: number
}

interface AdditionalCostRow {
    item: string;
    amount: number;
    remarks: string;
}

interface ProjectPlanningModalProps {
    isOpen: boolean
    onClose: () => void
    eventData: {
        id?: string
        title?: string
        eventStartDate?: string
        eventEndDate?: string
        location?: string
        venue?: string
        items?: any[]
        additionalCostEstimate?: AdditionalCostRow[]
        [key: string]: unknown
    }
    onSave: () => void
}

export function ProjectPlanningModal({ isOpen, onClose, eventData, onSave }: ProjectPlanningModalProps) {
    const [inventoryList, setInventoryList] = useState<Inventory[]>([])
    const [vendorList, setVendorList] = useState<Vendor[]>([])
    const [loadingInventory, setLoadingInventory] = useState(false)
    const [loadingVendors, setLoadingVendors] = useState(false)
    const [gst, setGst] = useState<number>(0)
    const [tds, setTds] = useState<number>(0)
    const { toast } = useToast()
    const [rows, setRows] = useState<EventItemRow[]>([
        {
            category: '',
            inventoryType: 'self',
            item: '',
            quantity: 1,
            pricePerItem: 0,
            days: 0,
            startDate: eventData?.eventStartDate || '',
            endDate: eventData?.eventEndDate || '',
            description: '',
            finalAmt: 0,
        },
    ])
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [additionalCosts, setAdditionalCosts] = useState<AdditionalCostRow[]>([]);
    const [isAdditionalCostsOpen, setIsAdditionalCostsOpen] = useState(true);
    const [isInventoryOpen, setIsInventoryOpen] = useState(true);
    const [showVersionPrompt, setShowVersionPrompt] = useState(false)
    const [versionDescription, setVersionDescription] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [showEmailDraft, setShowEmailDraft] = useState(false)
    const [emailForm, setEmailForm] = useState({ to: '', cc: '', subject: '', body: '' })
    const [sendingEmail, setSendingEmail] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    // Fetch inventory and vendors on mount - only once when modal opens
    useEffect(() => {
        if (!isOpen) return;

        // Reset steps
        setShowPreview(false)
        setShowEmailDraft(false)
        setSendingEmail(false)

        if (inventoryList.length === 0) {
            fetchInventory();
        }
        if (vendorList.length === 0) {
            fetchVendors();
        }

        // Load items from eventData if available
        if (Array.isArray(eventData?.items) && eventData.items.length > 0) {
            setRows(eventData.items.map((item: any) => ({
                category: item.category || '',
                inventoryType: item.vendor && item.vendor !== '' ? 'external' : 'self',
                item: item.item || '',
                inventoryID: item.inventoryID || '',
                vendor: item.vendor || '',
                quantity: item.quantity || 1,
                pricePerItem: item.pricePerItem || 0,
                days: item.days || 0,
                startDate: item.startDate || item.starDate || eventData?.eventStartDate || '',
                endDate: item.endDate || eventData?.eventEndDate || '',
                description: item.description || '',
                finalAmt: item.finalAmt || 0,
            })));
        }

        // Load existing additional costs if available
        if (Array.isArray(eventData?.additionalCostEstimate) && eventData.additionalCostEstimate.length > 0) {
            setAdditionalCosts(eventData.additionalCostEstimate);
        } else {
            setAdditionalCosts([]);
        }
    }, [isOpen, eventData]);

    const fetchInventory = async () => {
        setLoadingInventory(true)
        try {
            const res = await apiRequest(API_ENDPOINTS.inventory.dropdown)
            if (res.ok) {
                const data = await res.json()
                setInventoryList(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to fetch inventory:', err)
        } finally {
            setLoadingInventory(false)
        }
    }

    const fetchVendors = async () => {
        setLoadingVendors(true)
        try {
            const res = await apiRequest(API_ENDPOINTS.vendors.list)
            if (res.ok) {
                const data = await res.json()
                setVendorList(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to fetch vendors:', err)
        } finally {
            setLoadingVendors(false)
        }
    }

    const handleAddRow = () => {
        setRows([
            ...rows,
            {
                category: '',
                inventoryType: 'self',
                item: '',
                quantity: 1,
                pricePerItem: 0,
                days: 0,
                startDate: eventData?.eventStartDate || '',
                endDate: eventData?.eventEndDate || '',
                description: '',
                finalAmt: 0,
            },
        ])
        setIsDirty(true)
    }

    const handleDeleteRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index)
        setRows(newRows)
        setIsDirty(true)
    }

    const handleRowChange = (index: number, field: keyof EventItemRow, value: string | number) => {
        const newRows = [...rows]
        newRows[index] = { ...newRows[index], [field]: value }

        // Auto-calculate final amount if price or days change
        if (field === 'pricePerItem' || field === 'days' || field === 'quantity') {
            const price = field === 'pricePerItem' ? Number(value) : newRows[index].pricePerItem
            const days = field === 'days' ? Number(value) : newRows[index].days
            const quantity = field === 'quantity' ? Number(value) : newRows[index].quantity
            newRows[index].finalAmt = price * days * quantity
        }

        setRows(newRows)
        setIsDirty(true)
    }

    const handleAddAdditionalCostRow = () => {
        setAdditionalCosts([...additionalCosts, { item: '', amount: 0, remarks: '' }]);
        setIsDirty(true)
    };

    const handleRemoveAdditionalCostRow = (index: number) => {
        setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
        setIsDirty(true)
    };

    const handleAdditionalCostRowChange = (index: number, field: keyof AdditionalCostRow, value: string | number) => {
        const newAdditionalCosts = [...additionalCosts];
        newAdditionalCosts[index] = { ...newAdditionalCosts[index], [field]: value };
        setAdditionalCosts(newAdditionalCosts);
        setIsDirty(true)
    };

    const handleSaveClick = () => {
        // Validation before showing prompt
        const completeRows = rows.filter(row => row.category && row.item)
        if (completeRows.length === 0) {
            toast.error('Please add at least one inventory item')
            return
        }

        // Check if event is already under review
        // Assuming 'status' is available in eventData. 
        // We cast to any to safely access status, or interface should be updated.
        const currentStatus = (eventData as any).status;

        if (currentStatus === 'ESTIMATE_UNDER_REVIEW') {
            // Enforce new version workflow
            setShowVersionPrompt(true)
        } else {
            // Standard save
            executeSave(false)
        }
    }

    const executeSave = async (isNewVersion: boolean) => {
        try {
            // Filter out incomplete rows
            const completeRows = rows.filter(row => row.category && row.item)
            const completeAdditionalCosts = additionalCosts.filter(cost => cost.item && cost.amount > 0);

            // Map to backend EventItem model fields
            const itemsWithCalculations = completeRows.map(row => ({
                item: row.item,
                inventoryID: row.inventoryID || '',
                startDate: row.startDate,
                endDate: row.endDate,
                quantity: row.quantity,
                pricePerItem: row.pricePerItem,
                finalAmt: row.pricePerItem * row.days,
                category: row.category,
                description: row.description || '',
                vendor: row.vendor || '',
                days: row.days
            }))

            const updatedEvent = {
                ...eventData,
                items: itemsWithCalculations,
                gst,
                tds,
                additionalCostEstimate: completeAdditionalCosts,
                isNewVersion: isNewVersion,
                versionDescription: isNewVersion ? versionDescription : undefined
            }

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: 'POST',
                body: JSON.stringify(updatedEvent),
            })

            if (res.ok) {
                onSave()
                // Do NOT close modal, just update UI state to reflect saved status
                // onClose() 
                setShowVersionPrompt(false)
                setVersionDescription('')
                setIsDirty(false) // Mark as saved
                toast.success('Event saved successfully')
            } else {
                toast.error('Failed to save event')
            }
        } catch (err) {
            console.error('Error saving event:', err)
            toast.error('Error saving event')
        }
    }

    const handleSendToClientClick = () => {
        // Show preview first
        setShowPreview(true)
    }

    const handleProceedToEmail = () => {
        const clientEmail = (eventData as any).client?.email || ''
        setEmailForm({
            to: clientEmail,
            cc: '',
            subject: `Project Plan: ${eventData.title || 'Event'}`,
            body: `Dear Client,\n\nPlease find attached the project plan for your event ${eventData.title}.\n\nBest regards,\nZentra Team`
        })
        setShowEmailDraft(true)
    }

    const handleSendEmail = async () => {
        if (!emailForm.to) {
            toast.error('Please enter a recipient email')
            return
        }
        setSendingEmail(true)
        try {
            const formData = new FormData()
            // Split by comma or semicolon
            const toList = emailForm.to.split(/[,;]/).map(e => e.trim()).filter(e => e)
            const ccList = emailForm.cc.split(/[,;]/).map(e => e.trim()).filter(e => e)

            if (toList.length === 0) {
                toast.error('Please enter at least one valid email address')
                setSendingEmail(false)
                return
            }

            console.log('Sending email to:', toList, 'CC:', ccList)

            toList.forEach(email => formData.append('to', email))
            ccList.forEach(email => formData.append('cc', email))

            formData.append('subject', emailForm.subject)
            formData.append('body', emailForm.body)

            // Dummy PDF for now - In the future, this should be generated from the event details
            const pdfBlob = new Blob(['Placeholder PDF Content for Event Plan'], { type: 'application/pdf' })
            formData.append('pdfFile', pdfBlob, `Project_Plan_${eventData.title || 'Event'}.pdf`)

            const res = await apiRequest(API_ENDPOINTS.events.sendInvoice, {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                toast.success('Email sent successfully')
                setShowEmailDraft(false)
            } else {
                const text = await res.text()
                console.error('Failed to send email:', text)
                toast.error(`Failed to send email: ${text}`)
            }
        } catch (err) {
            console.error('Error sending email:', err)
            toast.error('Error sending email')
        } finally {
            setSendingEmail(false)
        }
    }

    if (!isOpen) return null


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] relative overflow-hidden flex flex-col">
                {/* Main Content Wrapper - Slides Left */}
                <div
                    className={`p-6 overflow-y-auto transition-all duration-300 ease-in-out h-full ${showPreview || showEmailDraft ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                    style={{
                        transform: showPreview || showEmailDraft ? 'translateX(-100%)' : 'translateX(0)',
                        visibility: showPreview || showEmailDraft ? 'hidden' : 'visible'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold mb-4">Project Planning</h2>

                    {/* Inventory Items Section (Expandable) */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Add Project Items</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsInventoryOpen(!isInventoryOpen)}>
                                {isInventoryOpen ? 'Collapse' : 'Expand'}
                            </Button>
                        </div>
                        {isInventoryOpen && (
                            <>
                                {/* Check if there are any items with categories */}
                                {(() => {
                                    const categorizedItems = rows.filter(r => r.category);
                                    const hasItems = categorizedItems.length > 0;

                                    // If no items or only uncategorized items provided initially, show full form
                                    // Also show form if we are editing the single first item (fresh start) and haven't saved yet
                                    const showForm = !hasItems || (rows.length === 1 && isDirty);

                                    if (showForm) {
                                        return (
                                            <div className="border rounded p-4 bg-gray-50 mb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                                    <div>
                                                        <Label className="text-sm font-medium">Category *</Label>
                                                        <select
                                                            value={rows[0]?.category || ''}
                                                            onChange={e => handleRowChange(0, 'category', e.target.value)}
                                                            className="w-full px-3 py-2 border rounded text-sm"
                                                        >
                                                            <option value="">Select Category</option>
                                                            {CATEGORIES.map(cat => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                            <option value="custom">+ Add Custom</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Source</Label>
                                                        <div className="flex gap-2 mt-2">
                                                            <label className="flex items-center gap-1">
                                                                <input
                                                                    type="radio"
                                                                    name="inventoryType-0"
                                                                    value="self"
                                                                    checked={rows[0]?.inventoryType === 'self'}
                                                                    onChange={() => handleRowChange(0, 'inventoryType', 'self')}
                                                                />
                                                                <span className="text-xs">Self</span>
                                                            </label>
                                                            <label className="flex items-center gap-1">
                                                                <input
                                                                    type="radio"
                                                                    name="inventoryType-0"
                                                                    value="external"
                                                                    checked={rows[0]?.inventoryType === 'external'}
                                                                    onChange={() => handleRowChange(0, 'inventoryType', 'external')}
                                                                />
                                                                <span className="text-xs">Vendor</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {rows[0]?.inventoryType === 'self' ? (
                                                        <div>
                                                            <Label className="text-sm font-medium">Inventory Item *</Label>
                                                            <select
                                                                value={rows[0]?.inventoryID || ''}
                                                                onChange={e => {
                                                                    const selected = inventoryList.find(i => String(i.id) === e.target.value)
                                                                    if (selected) {
                                                                        const newRows = [...rows]
                                                                        newRows[0] = {
                                                                            ...newRows[0],
                                                                            inventoryID: String(selected.id || ''),
                                                                            item: selected.itemName || '',
                                                                            pricePerItem: selected.price || 0
                                                                        }
                                                                        setRows(newRows)
                                                                    }
                                                                }}
                                                                className="w-full px-3 py-2 border rounded text-sm"
                                                                disabled={!rows[0]?.category}
                                                            >
                                                                <option value="">
                                                                    {!rows[0]?.category
                                                                        ? 'Select category first'
                                                                        : loadingInventory
                                                                            ? 'Loading...'
                                                                            : 'Select Inventory'}
                                                                </option>
                                                                {inventoryList
                                                                    .filter(inv => !rows[0]?.category || inv.category === rows[0].category)
                                                                    .map(inv => (
                                                                        <option key={inv.id} value={inv.id || ''}>
                                                                            {inv.itemName} ({inv.category})
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <Label className="text-sm font-medium">Vendor *</Label>
                                                            <select
                                                                value={rows[0]?.vendor || ''}
                                                                onChange={e => handleRowChange(0, 'vendor', e.target.value)}
                                                                className="w-full px-3 py-2 border rounded text-sm"
                                                            >
                                                                <option value="">
                                                                    {loadingVendors ? 'Loading...' : 'Select Vendor'}
                                                                </option>
                                                                {vendorList.map(v => (
                                                                    <option key={v.id} value={v.id || ''}>
                                                                        {v.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                                    <div>
                                                        <Label className="text-sm font-medium">Item Name *</Label>
                                                        <Input
                                                            type="text"
                                                            value={rows[0]?.item || ''}
                                                            onChange={e => handleRowChange(0, 'item', e.target.value)}
                                                            placeholder="Item name"
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Quantity</Label>
                                                        <Input
                                                            type="number"
                                                            value={rows[0]?.quantity || 1}
                                                            onChange={e => handleRowChange(0, 'quantity', parseInt(e.target.value) || 0)}
                                                            min="1"
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Price per Item</Label>
                                                        <Input
                                                            type="number"
                                                            value={rows[0]?.pricePerItem || 0}
                                                            onChange={e => handleRowChange(0, 'pricePerItem', parseFloat(e.target.value) || 0)}
                                                            min="0"
                                                            step="0.01"
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Days/Hours</Label>
                                                        <Input
                                                            type="number"
                                                            value={rows[0]?.days || 0}
                                                            onChange={e => handleRowChange(0, 'days', parseFloat(e.target.value) || 0)}
                                                            min="0"
                                                            step="0.5"
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <Label className="text-sm font-medium">Start Date</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={rows[0]?.startDate || ''}
                                                            onChange={e => handleRowChange(0, 'startDate', e.target.value)}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">End Date</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={rows[0]?.endDate || ''}
                                                            onChange={e => handleRowChange(0, 'endDate', e.target.value)}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <Label className="text-sm font-medium">Description</Label>
                                                    <Input
                                                        type="text"
                                                        value={rows[0]?.description || ''}
                                                        onChange={e => handleRowChange(0, 'description', e.target.value)}
                                                        placeholder="Description"
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }

                                    // If items exist, show grouped category view
                                    return null;
                                })()}

                                {/* Group items by category - only shown when items exist AND not in initial edit mode */}
                                {!(rows.length === 1 && isDirty) && Object.entries(rows.reduce((acc, row, idx) => {
                                    if (!row.category) return acc;
                                    if (!acc[row.category]) acc[row.category] = [];
                                    acc[row.category].push({ ...row, _idx: idx });
                                    return acc;
                                }, {} as Record<string, (EventItemRow & { _idx: number })[]>)).map(([category, items]) => (
                                    <div key={category} className="mb-2 border rounded">
                                        <div
                                            className="flex items-center justify-between bg-gray-100 px-4 py-2 cursor-pointer select-none"
                                            onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                        >
                                            <span className="font-semibold">{category}</span>
                                            <span>{openCategories[category] ? '▲' : '▼'}</span>
                                        </div>
                                        {openCategories[category] && (
                                            <div className="p-4 space-y-2">
                                                {/* Table header */}
                                                <div className="grid grid-cols-9 gap-2 font-semibold text-xs text-gray-700 border-b pb-1">
                                                    <div>Item Name</div>
                                                    <div>Source</div>
                                                    <div>Inventory/Vendor</div>
                                                    <div>Qty</div>
                                                    <div>Price</div>
                                                    <div>Days</div>
                                                    <div>Start Date</div>
                                                    <div>End Date</div>
                                                    <div>Description</div>
                                                    <div></div>
                                                </div>
                                                {items.map((row, index) => (
                                                    <div key={row._idx} className="grid grid-cols-9 gap-2 items-center border-b py-1 last:border-b-0">
                                                        {editIndex === row._idx ? (
                                                            <>
                                                                <Input type="text" value={row.item} onChange={e => handleRowChange(row._idx, 'item', e.target.value)} className="text-xs" />
                                                                <select value={row.inventoryType} onChange={e => handleRowChange(row._idx, 'inventoryType', e.target.value as 'self' | 'external')} className="text-xs border rounded px-1 py-0.5">
                                                                    <option value="self">Self</option>
                                                                    <option value="external">Vendor</option>
                                                                </select>
                                                                {row.inventoryType === 'self' ? (
                                                                    <select value={row.inventoryID || ''} onChange={e => {
                                                                        const selected = inventoryList.find(i => String(i.id) === e.target.value)
                                                                        if (selected) {
                                                                            handleRowChange(row._idx, 'inventoryID', String(selected.id || ''));
                                                                            handleRowChange(row._idx, 'item', selected.itemName || '');
                                                                            handleRowChange(row._idx, 'pricePerItem', selected.price || 0);
                                                                        }
                                                                    }} className="text-xs border rounded px-1 py-0.5">
                                                                        <option value="">Select Inventory</option>
                                                                        {inventoryList.filter(inv => !row.category || inv.category === row.category).map(inv => (
                                                                            <option key={inv.id} value={inv.id || ''}>{inv.itemName} ({inv.category})</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <select value={row.vendor || ''} onChange={e => handleRowChange(row._idx, 'vendor', e.target.value)} className="text-xs border rounded px-1 py-0.5">
                                                                        <option value="">Select Vendor</option>
                                                                        {vendorList.map(v => (
                                                                            <option key={v.id} value={v.id || ''}>{v.name}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                                <Input type="number" value={row.quantity} onChange={e => handleRowChange(row._idx, 'quantity', parseInt(e.target.value) || 0)} className="text-xs" />
                                                                <Input type="number" value={row.pricePerItem} onChange={e => handleRowChange(row._idx, 'pricePerItem', parseFloat(e.target.value) || 0)} className="text-xs" />
                                                                <Input type="number" value={row.days} onChange={e => handleRowChange(row._idx, 'days', parseFloat(e.target.value) || 0)} className="text-xs" />
                                                                <Input type="datetime-local" value={row.startDate} onChange={e => handleRowChange(row._idx, 'startDate', e.target.value)} className="text-xs" />
                                                                <Input type="datetime-local" value={row.endDate} onChange={e => handleRowChange(row._idx, 'endDate', e.target.value)} className="text-xs" />
                                                                <Input type="text" value={row.description} onChange={e => handleRowChange(row._idx, 'description', e.target.value)} className="text-xs" />
                                                                <Button size="sm" onClick={() => setEditIndex(null)} className="ml-2">Save</Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="truncate">{row.item}</span>
                                                                <span>{row.inventoryType === 'self' ? 'Self' : 'Vendor'}</span>
                                                                <span>{row.inventoryType === 'self' ? (inventoryList.find(i => String(i.id) === row.inventoryID)?.itemName || '-') : (vendorList.find(v => String(v.id) === row.vendor)?.name || '-')}</span>
                                                                <span>{row.quantity}</span>
                                                                <span>₹{row.pricePerItem}</span>
                                                                <span>{row.days}</span>
                                                                <span>{row.startDate ? new Date(row.startDate).toLocaleString() : '-'}</span>
                                                                <span>{row.endDate ? new Date(row.endDate).toLocaleString() : '-'}</span>
                                                                <span className="truncate">{row.description}</span>
                                                                <Button size="sm" variant="outline" onClick={() => setEditIndex(row._idx)} className="ml-2">Edit</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddRow}
                                    className="mt-4 w-full"
                                >
                                    + Add Another Item
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Additional Costs Section (Expandable) */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Additional Costs</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsAdditionalCostsOpen(!isAdditionalCostsOpen)}>
                                {isAdditionalCostsOpen ? 'Collapse' : 'Expand'}
                            </Button>
                        </div>
                        {isAdditionalCostsOpen && (
                            <>
                                {additionalCosts.length === 0 && (
                                    <div className="mb-4 text-red-600 text-sm font-medium">Please add additional cost items to continue.</div>
                                )}
                                <div className="space-y-4">
                                    {additionalCosts.map((cost, index) => (
                                        <div key={index} className="border rounded p-4 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <Label className="text-sm font-medium">Item Name</Label>
                                                    <Input
                                                        type="text"
                                                        value={cost.item}
                                                        onChange={e => handleAdditionalCostRowChange(index, 'item', e.target.value)}
                                                        placeholder="e.g., Permits, Security"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">Amount</Label>
                                                    <Input
                                                        type="number"
                                                        value={cost.amount}
                                                        onChange={e => handleAdditionalCostRowChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Enter amount"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">Remarks</Label>
                                                    <Input
                                                        type="text"
                                                        value={cost.remarks}
                                                        onChange={e => handleAdditionalCostRowChange(index, 'remarks', e.target.value)}
                                                        placeholder="Add any notes"
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveAdditionalCostRow(index)}
                                                className="text-red-600"
                                            >
                                                Remove Cost
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddAdditionalCostRow}
                                    className="mt-4 w-full"
                                >
                                    + Add Additional Cost
                                </Button>
                            </>
                        )}
                    </div>


                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSendToClientClick}
                            disabled={isDirty}
                            className={`text-white ${isDirty ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                            title={isDirty ? "Please save changes first" : "Send to client"}
                        >
                            Send to client
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveClick}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save Event
                        </Button>
                    </div>

                    {/* Version Confirmation Overlay */}
                    {showVersionPrompt && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 border border-gray-100">
                                <h3 className="text-xl font-bold mb-4">Save Configuration</h3>
                                <p className="mb-6 text-gray-600">Do you want to save this as a new version?</p>

                                <div className="mb-4">
                                    <Label className="block mb-2 text-sm font-medium">Version Description (if new version)</Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Added Sound adjustments"
                                        value={versionDescription}
                                        onChange={(e) => setVersionDescription(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Only show Cancel and Save New Version. No overwrite option for this flow. */}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowVersionPrompt(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!versionDescription.trim()) {
                                                toast.error('Please enter a version description')
                                                return
                                            }
                                            executeSave(true)
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Yes, Save New Version
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Preview Slide-over */}
                <div
                    className={`absolute inset-0 bg-white z-20 flex flex-col transition-all duration-300 ease-in-out ${showPreview ? 'translate-x-0' : 'translate-x-full'}`}
                    style={{
                        transform: showPreview ? 'translateX(0)' : 'translateX(100%)',
                        visibility: showPreview ? 'visible' : 'hidden'
                    }}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                        <h2 className="text-xl font-bold">Event Preview</h2>
                        <Button variant="ghost" onClick={() => setShowPreview(false)}>
                            Back to Edit
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* 1. Basic Details */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Event Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500">Event Title</span>
                                    <span className="font-medium">{eventData.title || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Dates</span>
                                    <span className="font-medium">
                                        {eventData.eventStartDate ? new Date(eventData.eventStartDate).toLocaleDateString() : '-'}
                                        {' - '}
                                        {eventData.eventEndDate ? new Date(eventData.eventEndDate).toLocaleDateString() : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Venue</span>
                                    <span className="font-medium">{eventData.venue || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Location</span>
                                    <span className="font-medium">{eventData.location || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Item Details Segregated by Category */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Event Items</h3>
                            {Object.entries(rows.reduce((acc, row) => {
                                if (!row.category || !row.item) return acc;
                                if (!acc[row.category]) acc[row.category] = [];
                                acc[row.category].push(row);
                                return acc;
                            }, {} as Record<string, EventItemRow[]>)).map(([category, items]) => (
                                <div key={category} className="mb-4 border rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 font-semibold text-sm border-b">
                                        {category}
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Item</th>
                                                    <th className="px-4 py-2 font-medium">Qty</th>
                                                    <th className="px-4 py-2 font-medium">Price</th>
                                                    <th className="px-4 py-2 font-medium">Days</th>
                                                    <th className="px-4 py-2 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2">{item.item}</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">₹{item.pricePerItem}</td>
                                                        <td className="px-4 py-2">{item.days}</td>
                                                        <td className="px-4 py-2 font-medium">₹{(item.quantity * item.pricePerItem * item.days).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                            {rows.filter(r => r.category && r.item).length === 0 && (
                                <p className="text-gray-500 italic">No items added yet.</p>
                            )}
                        </div>

                        {/* 3. Additional Costs */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Additional Costs</h3>
                            {additionalCosts.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Item</th>
                                                <th className="px-4 py-2 font-medium">Remarks</th>
                                                <th className="px-4 py-2 font-medium">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {additionalCosts.map((cost, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">{cost.item}</td>
                                                    <td className="px-4 py-2">{cost.remarks}</td>
                                                    <td className="px-4 py-2 font-medium">₹{cost.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No additional costs.</p>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleProceedToEmail}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Proceed to Email
                        </Button>
                    </div>
                </div>

                {/* Email Draft Slide-over (Gmail Style) - z-30 to stack ON TOP of preview */}
                <div
                    className={`absolute inset-0 bg-white z-30 flex flex-col transition-all duration-300 ease-in-out ${showEmailDraft ? 'translate-x-0' : 'translate-x-full'}`}
                    style={{
                        transform: showEmailDraft ? 'translateX(0)' : 'translateX(100%)',
                        visibility: showEmailDraft ? 'visible' : 'hidden'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b shadow-sm shrink-0">
                        <h2 className="text-sm font-semibold text-gray-700">New Message</h2>
                        <button
                            onClick={() => setShowEmailDraft(false)}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded p-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Compose Area */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <div className="px-4 pt-2">
                            <div className="flex items-center border-b border-gray-200 py-1">
                                <span className="text-gray-500 text-sm w-16 cursor-default">To</span>
                                <input
                                    type="text"
                                    value={emailForm.to}
                                    onChange={e => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                                    className="flex-1 py-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                                    placeholder="Recipients"
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center border-b border-gray-200 py-1">
                                <span className="text-gray-500 text-sm w-16 cursor-default">Cc</span>
                                <input
                                    type="text"
                                    value={emailForm.cc}
                                    onChange={e => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                                    className="flex-1 py-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                                    placeholder="Cc"
                                />
                            </div>
                            <div className="flex items-center border-b border-gray-200 py-1">
                                <input
                                    type="text"
                                    value={emailForm.subject}
                                    onChange={e => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                                    className="flex-1 py-2 text-sm font-medium outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                                    placeholder="Subject"
                                />
                            </div>
                        </div>

                        <textarea
                            value={emailForm.body}
                            onChange={e => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                            className="flex-1 w-full p-4 resize-none outline-none text-sm text-gray-800 font-sans leading-relaxed"
                            placeholder="Message body..."
                        />
                    </div>

                    {/* Footer / Toolbar */}
                    <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleSendEmail}
                                disabled={sendingEmail}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-6 rounded-full font-medium shadow-sm transition-all"
                            >
                                {sendingEmail ? 'Sending...' : 'Send'}
                            </Button>
                            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Attach files (dummy)">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Formatting options (dummy)">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowEmailDraft(false)}
                            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full hover:text-red-600 transition-colors"
                            title="Discard draft"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    )
}
