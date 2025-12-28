"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import DropdownMenu from "@/components/ui/dropdown-menu"
import CreateInventoryModal from "@/components/create-inventory-modal"
import { Inventory, InventoryFormData } from "@/types/inventory"
import { ListSkeleton, TableRowSkeleton } from "@/components/skeleton-loader"
import { showConfirmation } from "@/components/confirmation-toast"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api-client"
import { useAuth } from "@/context/auth"
import { Package } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/endpoint"

export default function InventoryPage() {
    const [inventory, setInventory] = useState<Inventory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryFormData | null>(null)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const { user } = useAuth()

    const fetchInventory = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiRequest(API_ENDPOINTS.inventory.list)
            if (!res.ok) {
                throw new Error(`Failed to fetch inventory: ${res.status}`)
            }
            const data = await res.json()
            setInventory(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error fetching inventory:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
            setInventory([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInventory()
    }, [fetchInventory])

    const inventoryCount = useMemo(() => inventory.length, [inventory])

    const openCreateModal = () => {
        setModalMode('create')
        setEditingItem(null)
        setIsModalOpen(true)
    }

    const openEditModal = (item: Inventory) => {
        setModalMode('edit')
        const editData: InventoryFormData = {
            id: item.id,
            itemName: item.itemName,
            category: item.category,
            spec: item.spec,
            dimensions: item.dimensions,
            quantity: item.quantity,
            price: item.price,
        }
        setEditingItem(editData)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        showConfirmation({
            title: "Delete Inventory Item",
            description: "Are you sure you want to delete this item? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const res = await apiRequest(`${API_ENDPOINTS.inventory.list}/${id}`, {
                        method: 'DELETE'
                    })

                    if (res.ok) {
                        await fetchInventory()
                        toast.success('Inventory item deleted successfully')
                    } else {
                        const errText = await res.text().catch(() => '')
                        throw new Error(`Failed to delete item: ${res.status} ${errText}`)
                    }
                } catch (error) {
                    toast.error('Failed to delete inventory item')
                    console.error("Error deleting inventory item:", error)
                }
            },
        })
    }

    const getDropdownItems = (item: Inventory) => [
        {
            label: "Edit",
            icon: "✏️",
            action: () => openEditModal(item)
        },
        {
            label: "Delete",
            icon: "🗑️",
            action: () => handleDelete(String(item.id)),
            variant: "danger" as const
        }
    ]

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            Inventory Management
                        </h2>
                        <p className="text-muted-foreground">
                            You have {inventoryCount} {inventoryCount === 1 ? 'item' : 'items'} in inventory
                        </p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto">
                    <Button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto"
                    >
                        + Add Inventory Item
                    </Button>
                </div>
            </div>

            <div className="mt-6 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                {/* Mobile / small screens: stacked cards */}
                <div className="flex flex-col gap-4 md:hidden">
                    {loading && <ListSkeleton type="cards" items={5} />}
                    {error && <div className="p-4 text-red-600">{error}</div>}
                    {!loading && !error && inventory.length === 0 && (
                        <div className="p-4 text-muted-foreground">No inventory items found.</div>
                    )}

                    {!loading && !error && inventory.map((item) => (
                        <div key={item.id} className="border rounded-md p-4 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{item.itemName}</div>
                                <DropdownMenu items={getDropdownItems(item)} />
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                                {item.category} · {item.quantity} units
                            </div>
                            <div className="mt-1 text-sm font-medium">
                                ${item.price}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop: table view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground border-b">
                                <th className="py-3 px-4">Item Name</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Specification</th>
                                <th className="py-3 px-4">Dimensions</th>
                                <th className="py-3 px-4">Quantity</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4 text-right sticky right-0 bg-white">&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <TableRowSkeleton rows={8} />}
                            {error && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-red-600">
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && inventory.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                        No inventory items found.
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && inventory.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium">{item.itemName}</td>
                                    <td className="py-4 px-4">{item.category}</td>
                                    <td className="py-4 px-4">{item.spec || '-'}</td>
                                    <td className="py-4 px-4">{item.dimensions || '-'}</td>
                                    <td className="py-4 px-4">{item.quantity}</td>
                                    <td className="py-4 px-4">${item.price}</td>
                                    <td className="py-4 px-4 text-right sticky right-0 bg-white/90 backdrop-blur-sm">
                                        <DropdownMenu items={getDropdownItems(item)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateInventoryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingItem(null)
                    setModalMode('create')
                }}
                onSubmit={fetchInventory}
                editData={editingItem}
                mode={modalMode}
            />
        </div>
    )
}
