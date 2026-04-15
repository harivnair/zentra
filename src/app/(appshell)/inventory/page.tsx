"use client";

import React, { useCallback, useEffect, useState } from "react";
import InventoryUsageModal from "@/components/inventory-usage-modal";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { MenuList } from "@/components/ui/menu-list";
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";
import CreateInventoryModal from "@/components/create-inventory-modal";
import { Inventory, InventoryFormData, InventoryUsage } from "@/types/inventory";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { apiRequest } from "@/lib/api/api-client";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "@/components/ui";
import { downloadCSV } from "@/lib/utils/file";
import { AccessButton } from "@/components/shared/access-button";
import { MenuItem } from "@/types";
import { Download, PackagePlus } from "lucide-react";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryFormData | null>(null);
    // Usage modal state
    const [usageModalOpen, setUsageModalOpen] = useState(false);
    const [usageLoading, setUsageLoading] = useState(false);
    const [usageData, setUsageData] = useState<InventoryUsage[] | null>(null);

    // Confirmation modal state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleTrackUsage = async (inventoryId: string) => {
        setUsageModalOpen(true);
        setUsageLoading(true);
        setUsageData(null);
        try {
            const res = await apiRequest(API_ENDPOINTS.inventory.checkUsage(inventoryId));
            if (!res.ok) throw new Error("Failed to fetch usage");
            const data = await res.json();
            setUsageData(Array.isArray(data) ? data : []);
        } catch {
            setUsageData([]);
        } finally {
            setUsageLoading(false);
        }
    };
    // const { user } = useAuth() // user not used

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest(API_ENDPOINTS.inventory.list);
            if (!res.ok) {
                throw new Error(`Failed to fetch inventory: ${res.status}`);
            }
            const data = await res.json();
            setInventory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch inventory");
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: Inventory) => {
        const editData: InventoryFormData = {
            id: item.id,
            itemName: item.itemName,
            category: item.category,
            spec: item.spec,
            dimensions: item.dimensions,
            quantity: item.quantity,
            price: item.price,
        };
        setEditingItem(editData);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteItemId(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteItemId) return;

        setDeleteLoading(true);
        try {
            const res = await apiRequest(`${API_ENDPOINTS.inventory.list}/${deleteItemId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await fetchInventory();
                toast.success("Inventory item deleted successfully");
                setDeleteConfirmOpen(false);
            } else {
                const errText = await res.text().catch(() => "");
                throw new Error(`Failed to delete item: ${res.status} ${errText}`);
            }
        } catch (error) {
            toast.error("Failed to delete inventory item");
            console.error("Error deleting inventory item:", error);
        } finally {
            setDeleteLoading(false);
            setDeleteItemId(null);
        }
    };

    const handleExport = () => {
        const exportData = inventory.map(item => ({
            "Item Name": item.itemName,
            Category: item.category,
            Specification: item.spec || "",
            Dimensions: item.dimensions || "",
            Quantity: item.quantity,
            Price: item.price,
        }));
        downloadCSV(exportData, "inventory-export.csv");
        toast.success("Inventory exported successfully");
    };

    const columns: Column<Inventory>[] = [
        {
            key: "itemName",
            header: "Item Name",
            render: row => <span className="font-medium">{row.itemName}</span>,
        },
        {
            key: "category",
            header: "Category",
            render: row => row.category,
        },
        {
            key: "spec",
            header: "Specification",
            render: row => row.spec || "-",
        },
        {
            key: "dimensions",
            header: "Dimensions",
            render: row => row.dimensions || "-",
        },
        {
            key: "quantity",
            header: "Quantity",
            render: row => row.quantity,
        },
        {
            key: "price",
            header: "Price",
            render: row => `${row.price}`,
        },
        {
            key: "trackUsage",
            header: "Track Usage",
            render: row => (
                <button
                    className={cn(
                        "font-medium transition-colors cursor-pointer",
                        "text-primary hover:text-primary-hover",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm",
                    )}
                    onClick={() => handleTrackUsage(row.id!)}
                    type="button"
                >
                    Track Usage
                </button>
            ),
        },
        {
            key: "actions",
            header: "",
            render: row => {
                const items: MenuItem[] = [
                    {
                        key: "edit",
                        label: "Edit",
                        icon: <PencilIcon size={16} />,
                        onClick: () => openEditModal(row),
                        scopes: ["w:inventory"],
                    },
                    {
                        key: "delete",
                        label: "Delete",
                        icon: <TrashIcon size={16} />,
                        onClick: () => handleDelete(String(row.id)),
                        className: "text-destructive focus:text-destructive",
                        scopes: ["w:inventory"],
                    },
                ];

                return (
                    <div className="flex justify-center">
                        <MenuList
                            align="end"
                            items={items}
                            trigger={
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVerticalIcon size={16} />
                                </Button>
                            }
                        />
                    </div>
                );
            },
        },
    ];

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <PageHeader
                title="Inventory Management"
                description="Manage your inventory items, track usage, and keep everything organized."
                actions={
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                        <Button
                            variant="ghost"
                            className="w-full sm:w-auto"
                            onClick={handleExport}
                            icon={<Download size={16} />}
                        >
                            Export
                        </Button>
                        <AccessButton
                            scope={["w:inventory"]}
                            className="w-full sm:w-auto"
                            onClick={openCreateModal}
                            icon={<PackagePlus size={16} />}
                        >
                            Add Inventory Item
                        </AccessButton>
                    </div>
                }
            />

            <div className="mt-6 rounded-lg border border-border bg-surface p-4 sm:p-6 shadow-sm">
                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={inventory}
                    rowKey={row => String(row.id)}
                    emptyMessage="No inventory items found."
                    isLoading={loading}
                />
            </div>

            <InventoryUsageModal
                open={usageModalOpen}
                onClose={() => setUsageModalOpen(false)}
                usage={usageData}
                loading={usageLoading}
            />

            <CreateInventoryModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onSubmit={fetchInventory}
                editData={editingItem}
            />

            <ConfirmationModal
                open={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setDeleteItemId(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Inventory Item"
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                isLoading={deleteLoading}
            />
        </div>
    );
}
