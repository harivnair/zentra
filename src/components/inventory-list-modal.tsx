"use client";

import React from "react";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/table";

interface ChecklistItem {
    category: string;
    subCategory?: string;
    item: string;
    description?: string;
    quantity: number;
    days?: number;
    pricePerItem?: number;
    startDate?: string;
    endDate?: string;
    deadlineDate?: string;
    vendor?: string;
    inventoryID?: string | number;
    status?: string;
    isInventoryItem?: boolean;
}

interface Inventory {
    id?: string;
    itemName: string;
    category: string;
    subCategory?: string;
    spec: string;
    dimensions: string;
    quantity: number;
    price: number;
}

interface InventoryListModalProps {
    isOpen: boolean;
    onClose: () => void;
    checklistData: ChecklistItem[];
    inventoryList: Inventory[];
}

export function InventoryListModal({
    isOpen,
    onClose,
    checklistData,
    inventoryList,
}: InventoryListModalProps) {
    if (!isOpen) return null;

    // Filter items that are from inventory (isInventoryItem=true)
    const eventInventoryItems = checklistData.filter(item => Boolean(item.inventoryID));

    // Enrich with inventory details
    const enrichedItems = eventInventoryItems.map(item => {
        const inventoryDetails = inventoryList.find(
            inv => String(inv.id) === String(item.inventoryID),
        );
        return {
            ...item,
            spec: inventoryDetails?.spec || "-",
            dimensions: inventoryDetails?.dimensions || "-",
            availableQuantity: inventoryDetails?.quantity || 0,
        };
    });

    const columns: Column<
        ChecklistItem & {
            spec: string;
            dimensions: string;
            availableQuantity: number;
        }
    >[] = [
        {
            key: "item",
            header: "Item Name",
            render: item => <span className="font-medium">{item.item}</span>,
        },
        {
            key: "category",
            header: "Category",
            render: item => item.category || "-",
        },
        {
            key: "subCategory",
            header: "Sub Category",
            render: item => item.subCategory || "-",
        },
        {
            key: "spec",
            header: "Specification",
            render: item => item.spec,
        },
        {
            key: "dimensions",
            header: "Dimensions",
            render: item => item.dimensions,
        },
        {
            key: "quantity",
            header: "Required Qty",
            align: "center",
            render: item => item.quantity || 0,
        },
        {
            key: "availableQuantity",
            header: "Available Qty",
            align: "center",
            render: item => (
                <span
                    className={
                        item.availableQuantity >= item.quantity
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : "text-red-600 dark:text-red-400 font-medium"
                    }
                >
                    {item.availableQuantity}
                </span>
            ),
        },
        {
            key: "pricePerItem",
            header: "Unit Price",
            align: "right",
            render: item => (item.pricePerItem ? `₹${item.pricePerItem}` : "-"),
        },
        {
            key: "status",
            header: "Status",
            align: "center",
            render: item => {
                const statusStyles: Record<string, string> = {
                    PENDING:
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    COMPLETED:
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                };
                const statusClass = statusStyles[item.status || "PENDING"] || statusStyles.PENDING;
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}>
                        {item.status || "PENDING"}
                    </span>
                );
            },
        },
    ];

    const summary = {
        total: enrichedItems.length,
        completed: enrichedItems.filter(i => i.status === "COMPLETED").length,
        pending: enrichedItems.filter(i => i.status === "PENDING").length,
        inProgress: enrichedItems.filter(i => i.status === "IN_PROGRESS").length,
        totalValue: enrichedItems.reduce(
            (sum, item) => sum + (item.pricePerItem || 0) * (item.quantity || 1),
            0,
        ),
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="xxl"
            title="Event Inventory List"
            description="View all inventory items allocated for this event"
            showCloseIcon={true}
        >
            <ModalBody className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 pb-6 border-b border-border">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{summary.total}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Total Items
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {summary.completed}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Completed
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {summary.pending}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Pending
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {summary.inProgress}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            In Progress
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">₹{summary.totalValue}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Total Value
                        </p>
                    </div>
                </div>

                {/* Table */}
                {enrichedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground text-sm">
                            No inventory items allocated for this event
                        </p>
                    </div>
                ) : (
                    <Table
                        data={enrichedItems}
                        columns={columns}
                        showRowNumbers={true}
                        emptyMessage="No inventory items found"
                    />
                )}
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}
