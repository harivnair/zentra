'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiRequest } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/endpoint'
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

    // Fetch inventory and vendors on mount - only once when modal opens
    useEffect(() => {
        if (!isOpen) return;
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
    }

    const handleRemoveRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index))
    }

    const handleRowChange = (index: number, field: keyof EventItemRow, value: string | number) => {
        const newRows = [...rows]
        newRows[index] = { ...newRows[index], [field]: value }
        setRows(newRows)
    }

    const handleAddAdditionalCostRow = () => {
        setAdditionalCosts([...additionalCosts, { item: '', amount: 0, remarks: '' }]);
    };

    const handleRemoveAdditionalCostRow = (index: number) => {
        setAdditionalCosts(additionalCosts.filter((_, i) => i !== index));
    };

    const handleAdditionalCostRowChange = (index: number, field: keyof AdditionalCostRow, value: string | number) => {
        const newAdditionalCosts = [...additionalCosts];
        newAdditionalCosts[index] = { ...newAdditionalCosts[index], [field]: value };
        setAdditionalCosts(newAdditionalCosts);
    };

    const handleSave = async () => {
        try {
            // Filter out incomplete rows
            const completeRows = rows.filter(row => row.category && row.item)
            const completeAdditionalCosts = additionalCosts.filter(cost => cost.item && cost.amount > 0);

            if (completeRows.length === 0) {
                alert('Please add at least one inventory item')
                return
            }

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
            }

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: 'POST',
                body: JSON.stringify(updatedEvent),
            })

            if (res.ok) {
                onSave()
                onClose()
            } else {
                alert('Failed to save event')
            }
        } catch (err) {
            console.error('Error saving event:', err)
            alert('Error saving event')
        }
    }

    if (!isOpen) return null


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 relative">
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

                                // If no items or only uncategorized items, show full form for fresh add
                                if (!hasItems) {
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

                            {/* Group items by category - only shown when items exist */}
                            {Object.entries(rows.reduce((acc, row, idx) => {
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
                        onClick={handleSave}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save Event
                    </Button>
                </div>
            </div>
        </div>
    )
}
