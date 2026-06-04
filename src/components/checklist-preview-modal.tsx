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

interface ChecklistPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    checklistData: ChecklistItem[];
    vendorList: { id?: string | number; name?: string }[];
    inventoryList: { id?: string | number; itemName?: string }[];
    onUpdate?: () => void;
}

export function ChecklistPreviewModal({
    isOpen,
    onClose,
    checklistData,
    vendorList,
    inventoryList,
    onUpdate,
}: ChecklistPreviewModalProps) {
    if (!isOpen) return null;

    const columns: Column<ChecklistItem>[] = [
        {
            key: "item",
            header: "Item Name",
            render: (item: ChecklistItem) => <span className="font-medium">{item.item}</span>,
        },
        {
            key: "category",
            header: "Category",
            render: (item: ChecklistItem) => item.category || "-",
        },
        {
            key: "quantity",
            header: "Qty",
            align: "center",
            render: (item: ChecklistItem) => item.quantity || 0,
        },
        {
            key: "vendor",
            header: "Vendor / Inventory",
            render: (item: ChecklistItem) => {
                if (item.inventoryID) {
                    const inv = inventoryList.find(i => String(i.id) === String(item.inventoryID));
                    return (
                        <span className="text-blue-600 dark:text-blue-400">📦 {inv?.itemName}</span>
                    );
                }
                const vendor = vendorList.find(v => String(v.id) === String(item.vendor));
                return <span>{vendor?.name || item.vendor || "-"}</span>;
            },
        },
        {
            key: "status",
            header: "Status",
            align: "center",
            render: (item: ChecklistItem) => {
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
        {
            key: "startDate",
            header: "Start Date",
            align: "center",
            render: (item: ChecklistItem) => item.startDate || "-",
        },
        {
            key: "endDate",
            header: "End Date",
            align: "center",
            render: (item: ChecklistItem) => item.endDate || "-",
        },
        {
            key: "rate",
            header: "Rate",
            align: "right",
            render: (item: ChecklistItem) => (item.pricePerItem ? `₹${item.pricePerItem}` : "-"),
        },
    ];

    const summary = {
        total: checklistData.length,
        completed: checklistData.filter(i => i.status === "COMPLETED").length,
        pending: checklistData.filter(i => i.status === "PENDING").length,
        inProgress: checklistData.filter(i => i.status === "IN_PROGRESS").length,
        totalValue: checklistData.reduce(
            (sum, item) => sum + (item.pricePerItem || 0) * (item.quantity || 1),
            0,
        ),
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="xxl"
            title="Checklist Preview"
            description="Review all checklist items before saving"
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
                <Table<ChecklistItem>
                    data={checklistData}
                    columns={columns}
                    showRowNumbers={true}
                    emptyMessage="No items in checklist"
                />
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
                {onUpdate && (
                    <Button onClick={onUpdate} variant="primary">
                        Update Checklist
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}
