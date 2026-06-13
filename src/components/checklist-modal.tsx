"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { Vendor } from "@/types/vendor";
import type { Inventory } from "@/types/inventory";
import { cn } from "@/lib/utils/cn";
import { TrashIcon } from "@/components/ui/icons";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Select, DatePickerField } from "./ui";
import { apiRequest } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { VendorDropdown } from "@/components/vendor-dropdown";

const CreatableSelectField = dynamic(
    () =>
        import("@/components/ui").then(mod => ({
            default: mod.CreatableSelectField,
        })),
    { ssr: false },
);

// Assuming EventItem matches backend EventItem model
interface EventItem {
    category?: string;
    subCategory?: string;
    item?: string;
    description?: string;
    quantity?: number;
    count?: number;
    vendor?: string;
    starDate?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: string | number | undefined;
}

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
    status?: string; // PENDING, CONFIRMED, IN_PROGRESS, DONE
    isInventoryItem?: boolean;
}

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventData: {
        id?: string;
        title?: string;
        items?: EventItem[];
        checklist?: ChecklistItem[];
        [key: string]: string | EventItem[] | ChecklistItem[] | undefined;
    };
    onSave: () => void;
    onCancel?: () => void;
    vendorList: Vendor[];
    inventoryList: Inventory[];
    loadingVendors?: boolean;
    loadingInventory?: boolean;
}

const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
];

export function ChecklistModal({
    isOpen,
    onClose,
    eventData,
    onSave,
    onCancel,
    vendorList,
    inventoryList,
    loadingVendors = false,
    loadingInventory = false,
}: ChecklistModalProps) {
    const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    // const [showPreview, setShowPreview] = useState(false);
    const detailPanelRef = useRef<HTMLDivElement>(null);
    const listPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        if (eventData.checklist && eventData.checklist.length > 0) {
            // Load existing checklist
            setChecklistData(eventData.checklist);
            setSelectedItemIndex(0);
        } else if (eventData.items && eventData.items.length > 0) {
            // Initialize from estimate items
            const initialChecklist: ChecklistItem[] = eventData.items.map(item => ({
                category: item.category || "Uncategorized",
                subCategory: item.subCategory || "",
                item: item.item || "",
                description: item.description || "",
                quantity: item.quantity || item.count || 1,
                vendor: item.vendor || "",
                inventoryID: (item.inventoryID as string | number | undefined) || "",
                status: "PENDING",
                startDate:
                    item.startDate || item.starDate
                        ? String(item.startDate || item.starDate).split("T")[0]
                        : "",
                endDate: item.endDate ? String(item.endDate).split("T")[0] : "",
                days: Number(item.days) || 1,
                pricePerItem: Number(item.pricePerItem) || 0,
                deadlineDate: String(item.deadlineDate || ""),
                isInventoryItem: Boolean(item.inventoryID) || false,
            }));
            setChecklistData(initialChecklist);
            setSelectedItemIndex(0);
            // Expand all categories on load
            const categoryMap = initialChecklist.reduce((acc, item) => {
                const cat = item.category || "Uncategorized";
                acc.add(cat);
                return acc;
            }, new Set<string>());
            setExpandedCategories(categoryMap);
        } else {
            setChecklistData([]);
            setExpandedCategories(new Set());
            setSelectedItemIndex(null);
        }
    }, [isOpen, eventData]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen || checklistData.length === 0) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedItemIndex(prev => {
                    const next = (prev ?? -1) + 1;
                    return next < checklistData.length ? next : prev;
                });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedItemIndex(prev => {
                    const next = (prev ?? 0) - 1;
                    return next >= 0 ? next : prev;
                });
            } else if (e.key === "Delete" && selectedItemIndex !== null) {
                e.preventDefault();
                handleRemoveItem(selectedItemIndex);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, checklistData.length, selectedItemIndex]);

    const handleItemChange = (
        index: number,
        field: keyof ChecklistItem,
        value: string | number,
    ) => {
        const newData = [...checklistData];
        newData[index] = { ...newData[index], [field]: value };
        setChecklistData(newData);
    };

    const handleCheckboxChange = (index: number, value: boolean) => {
        const newData = [...checklistData];
        if (value) {
            newData[index] = { ...newData[index], isInventoryItem: value, vendor: "" };
        } else {
            newData[index] = { ...newData[index], isInventoryItem: value, inventoryID: "" };
        }
        setChecklistData(newData);
    };

    const handleAddItem = (category: string) => {
        setChecklistData([
            ...checklistData,
            {
                category,
                subCategory: "",
                item: "",
                description: "",
                quantity: 1,
                days: 0,
                pricePerItem: 0,
                vendor: "",
                status: "PENDING",
                startDate: "",
                endDate: "",
                deadlineDate: "",
                isInventoryItem: false,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const newData = [...checklistData];
        newData.splice(index, 1);
        setChecklistData(newData);
        // Move selection to previous item if available
        if (selectedItemIndex !== null && selectedItemIndex >= newData.length) {
            setSelectedItemIndex(newData.length > 0 ? newData.length - 1 : null);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out empty items
            const filteredData = checklistData.filter(
                item => item.item.trim() !== "" || item.description?.trim() !== "",
            );

            // Validate each item has either a vendor or inventory selected
            const missingAssignment = filteredData.find(
                item => !item.vendor && (!item.isInventoryItem || !item.inventoryID),
            );
            if (missingAssignment) {
                toast.error(
                    `"${missingAssignment.item || "Unnamed item"}" must have a vendor or inventory assigned.`,
                );
                setSaving(false);
                return;
            }

            const updatedEvent = {
                ...eventData,
                checkListCompleted: true,
                items: filteredData,
            };

            const res = await apiRequest(API_ENDPOINTS.events.list, {
                method: "POST",
                body: JSON.stringify(updatedEvent),
            });

            if (res.ok) {
                toast.success("Checklist saved successfully");
                onSave();
                onClose();
            } else {
                toast.error("Failed to save checklist");
            }
        } catch (err) {
            console.error("Error saving checklist:", err);
            toast.error("Error saving checklist");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    // Group checklist items by category
    const itemsByCategory = checklistData.reduce(
        (acc, item, index) => {
            const cat = item.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push({ ...item, originalIndex: index });
            return acc;
        },
        {} as Record<string, (ChecklistItem & { originalIndex: number })[]>,
    );

    const categories = Object.keys(itemsByCategory);
    const selectedItem = selectedItemIndex !== null ? checklistData[selectedItemIndex] : null;

    const toggleCategory = (category: string) => {
        const updated = new Set(expandedCategories);
        if (updated.has(category)) {
            updated.delete(category);
        } else {
            updated.add(category);
        }
        setExpandedCategories(updated);
    };

    const handleSelectItem = (index: number) => {
        setSelectedItemIndex(index);
        // Scroll detail panel to top
        if (detailPanelRef.current) {
            detailPanelRef.current.scrollTop = 0;
        }
    };

    const modalContent = (
        <>
            <ModalBody className="flex gap-4 max-h-[calc(100vh-300px)] overflow-hidden">
                {/* Left Panel: Item List (40%) */}
                <div
                    ref={listPanelRef}
                    className="w-2/5 border-r border-border overflow-y-auto pr-4"
                >
                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4 text-sm">
                                No items found in estimate.
                            </p>
                            <Button
                                onClick={() => handleAddItem("New Category")}
                                variant="primary"
                                size="sm"
                            >
                                Add First Item
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category, catIndex) => {
                                const items = itemsByCategory[category];
                                const isExpanded = expandedCategories.has(category);

                                return (
                                    <div key={category}>
                                        {/* Category Header */}
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 font-semibold text-sm transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                    {catIndex + 1}
                                                </span>
                                                <span className="truncate">{category}</span>
                                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                                    ({items.length})
                                                </span>
                                            </div>
                                            <ChevronDownIcon
                                                size={16}
                                                className={cn(
                                                    "transition-transform duration-200 flex-shrink-0",
                                                    isExpanded ? "rotate-180" : "",
                                                )}
                                            />
                                        </button>

                                        {/* Category Items */}
                                        {isExpanded && (
                                            <div className="ml-2 mt-2 space-y-1 border-l border-border/50">
                                                {items.map(item => (
                                                    <button
                                                        key={item.originalIndex}
                                                        onClick={() =>
                                                            handleSelectItem(item.originalIndex)
                                                        }
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                                            item.status === "COMPLETED"
                                                                ? "text-green-700 dark:text-green-400 line-through"
                                                                : "text-foreground",
                                                            selectedItemIndex === item.originalIndex
                                                                ? "bg-primary/20 text-primary font-medium border border-primary/50"
                                                                : "hover:bg-accent/20",
                                                        )}
                                                        title={`${item.item} - ${item.status || "PENDING"}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold">
                                                                {item.status === "COMPLETED"
                                                                    ? "✓"
                                                                    : "○"}
                                                            </span>
                                                            <span className="truncate">
                                                                {item.item || "(Unnamed)"}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                                {/* Add Item Button */}
                                                <button
                                                    onClick={() => handleAddItem(category)}
                                                    className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                                                >
                                                    <PlusIcon size={14} />
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Panel: Item Details (60%) */}
                <div ref={detailPanelRef} className="w-3/5 overflow-y-auto">
                    {selectedItem === null ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground text-sm">
                                {checklistData.length === 0
                                    ? "Add an item to get started"
                                    : "Select an item to view details"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 pr-4">
                            {/* Header Row: Item Name, Subcategory, Status, Delete */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-border pb-4 items-end">
                                <Input
                                    value={selectedItem.item}
                                    onChange={e =>
                                        handleItemChange(selectedItemIndex!, "item", e.target.value)
                                    }
                                    label="Item Name"
                                    placeholder="Item name"
                                    smallLabel
                                />
                                <Input
                                    value={selectedItem.subCategory || ""}
                                    onChange={e =>
                                        handleItemChange(
                                            selectedItemIndex!,
                                            "subCategory",
                                            e.target.value,
                                        )
                                    }
                                    label="Sub Category (Optional)"
                                    placeholder="e.g. Signage, Branding..."
                                    smallLabel
                                />
                                <Select
                                    value={
                                        statusOptions.find(
                                            opt => opt.value === selectedItem.status,
                                        ) || null
                                    }
                                    onChange={e =>
                                        handleItemChange(
                                            selectedItemIndex!,
                                            "status",
                                            e?.value ?? "",
                                        )
                                    }
                                    options={statusOptions}
                                    label="Status"
                                    smallLabel
                                />
                                <button
                                    onClick={() => handleRemoveItem(selectedItemIndex!)}
                                    className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    title="Remove checklist item"
                                >
                                    <TrashIcon size={16} />
                                </button>
                            </div>

                            {/* Description / Days+Quantity / Inventory-Vendor Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                {/* Column 1: Description */}
                                <div className="lg:col-span-1">
                                    <Textarea
                                        value={selectedItem.description || ""}
                                        onChange={e =>
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        label="Description"
                                        placeholder="Add elaborate notes, specifics, lengths, details..."
                                        rows={2}
                                        style={{ minHeight: "114px" }}
                                        smallLabel
                                    />
                                </div>

                                {/* Column 2: Days (top) + Quantity (bottom) stacked */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Days"
                                        type="number"
                                        className="mb-3"
                                        value={(selectedItem.days ?? 0) || ""}
                                        onChange={e =>
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "days",
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        smallLabel
                                    />
                                    <Input
                                        label="Quantity"
                                        smallLabel
                                        type="number"
                                        value={selectedItem.quantity || ""}
                                        onChange={e =>
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "quantity",
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                {/* Column 3: Checkbox (top) aligned with Days, dropdown (bottom) aligned with Quantity */}
                                <div className="lg:col-span-1 flex flex-col gap-3">
                                    <div className="h-10 flex items-center lg:mt-[22px]">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedItem.isInventoryItem || false}
                                                onChange={e => {
                                                    handleCheckboxChange(
                                                        selectedItemIndex!,
                                                        e.target.checked,
                                                    );
                                                }}
                                                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                                            />
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Use Inventory
                                            </span>
                                        </label>
                                    </div>

                                    {/* Conditional Select - Inventory Item or Assigned Vendor */}
                                    {selectedItem.isInventoryItem ? (
                                        <CreatableSelectField
                                            smallLabel
                                            label="Inventory Item"
                                            options={inventoryList.map(inv => ({
                                                value: String(inv.id || ""),
                                                label: inv.itemName as string,
                                            }))}
                                            value={
                                                selectedItem.inventoryID
                                                    ? {
                                                          value: String(selectedItem.inventoryID),
                                                          label:
                                                              inventoryList.find(
                                                                  inv =>
                                                                      String(inv.id) ===
                                                                      String(
                                                                          selectedItem.inventoryID,
                                                                      ),
                                                              )?.itemName ||
                                                              String(selectedItem.inventoryID),
                                                      }
                                                    : null
                                            }
                                            onChange={selectedValue => {
                                                handleItemChange(
                                                    selectedItemIndex!,
                                                    "inventoryID",
                                                    selectedValue,
                                                );
                                            }}
                                            placeholder={
                                                loadingInventory
                                                    ? "Loading..."
                                                    : "Select Inventory Item"
                                            }
                                            isClearable
                                        />
                                    ) : (
                                        <VendorDropdown
                                            value={selectedItem.vendor}
                                            onChange={vendorId => {
                                                handleItemChange(
                                                    selectedItemIndex!,
                                                    "vendor",
                                                    vendorId,
                                                );
                                            }}
                                            vendorList={vendorList}
                                            loadingVendors={loadingVendors}
                                            smallLabel
                                            isClearable
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Execution Data Grid: Dates, Rate, Deadline */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                                {/* Start Date */}
                                <div className="lg:col-span-1">
                                    <DatePickerField
                                        value={
                                            selectedItem.startDate
                                                ? new Date(selectedItem.startDate + "T00:00:00")
                                                : null
                                        }
                                        onChange={date => {
                                            const value = date
                                                ? date.toISOString().split("T")[0]
                                                : "";
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "startDate",
                                                value,
                                            );
                                        }}
                                        placeholderText="Select date"
                                        dateFormat="MMM d, yyyy"
                                        showTimeSelect={false}
                                        wrapperClassName="lg:col-span-1"
                                        label="Start Date"
                                        smallLabel
                                    />
                                </div>

                                {/* End Date */}
                                <div className="lg:col-span-1">
                                    <DatePickerField
                                        value={
                                            selectedItem.endDate
                                                ? new Date(selectedItem.endDate + "T00:00:00")
                                                : null
                                        }
                                        onChange={date => {
                                            const value = date
                                                ? date.toISOString().split("T")[0]
                                                : "";
                                            handleItemChange(selectedItemIndex!, "endDate", value);
                                        }}
                                        placeholderText="Select date"
                                        dateFormat="MMM d, yyyy"
                                        showTimeSelect={false}
                                        wrapperClassName="lg:col-span-1"
                                        label="End Date"
                                        smallLabel
                                    />
                                </div>

                                {/* Deadline Date */}
                                <div className="lg:col-span-1">
                                    <DatePickerField
                                        value={
                                            selectedItem.deadlineDate
                                                ? new Date(selectedItem.deadlineDate + "T00:00:00")
                                                : null
                                        }
                                        onChange={date => {
                                            const value = date
                                                ? date.toISOString().split("T")[0]
                                                : "";
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "deadlineDate",
                                                value,
                                            );
                                        }}
                                        placeholderText="Select date"
                                        dateFormat="MMM d, yyyy"
                                        showTimeSelect={false}
                                        wrapperClassName="lg:col-span-1"
                                        label="Deadline"
                                        smallLabel
                                    />
                                </div>
                                {/* Rate */}
                                <div className="lg:col-span-1">
                                    <Input
                                        label="Rate"
                                        type="number"
                                        smallLabel
                                        value={(selectedItem.pricePerItem ?? 0) || ""}
                                        onChange={e =>
                                            handleItemChange(
                                                selectedItemIndex!,
                                                "pricePerItem",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <div className="flex-1 text-sm text-muted-foreground font-medium">
                    Total Items: {checklistData.length} | Done:{" "}
                    {checklistData.filter(i => i.status === "COMPLETED").length}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onCancel || onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} variant="primary">
                        {saving ? "Saving..." : "Save Checklist"}
                    </Button>
                </div>
            </ModalFooter>
        </>
    );

    return (
        <>
            <Modal
                open={isOpen}
                onClose={onClose}
                size="xxl"
                title="Execution Checklist"
                description={`Manage execution tasks for ${eventData.title}`}
                showCloseIcon={true}
            >
                {modalContent}
            </Modal>
        </>
    );
}
