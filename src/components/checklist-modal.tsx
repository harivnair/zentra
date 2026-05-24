"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import type { Vendor } from "@/types/vendor";
import type { Inventory } from "@/types/inventory";
import { apiRequest } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { cn } from "@/lib/utils/cn";
import { TrashIcon } from "@/components/ui/icons";
import { ChevronDownIcon } from "lucide-react";
import { Select, DatePickerField } from "./ui";

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
}

const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
];

export function ChecklistModal({ isOpen, onClose, eventData, onSave }: ChecklistModalProps) {
    const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchVendors = async () => {
            setLoadingVendors(true);
            try {
                const res = await apiRequest(API_ENDPOINTS.vendors.list);
                if (res.ok) {
                    const data = await res.json();
                    setVendorList(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch vendors:", err);
            } finally {
                setLoadingVendors(false);
            }
        };

        const fetchInventory = async () => {
            setLoadingInventory(true);
            try {
                const res = await apiRequest(API_ENDPOINTS.inventory.list);
                if (res.ok) {
                    const data = await res.json();
                    setInventoryList(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch inventory:", err);
            } finally {
                setLoadingInventory(false);
            }
        };

        fetchVendors();
        fetchInventory();
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        if (eventData.checklist && eventData.checklist.length > 0) {
            // Load existing checklist
            setChecklistData(eventData.checklist);
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
            // Expand all categories on load
            setExpandedCategories(new Set(Object.keys(itemsByCategory)));
        } else {
            setChecklistData([]);
            setExpandedCategories(new Set());
        }
    }, [isOpen, eventData]);

    // Group checklist items by category
    const itemsByCategory = checklistData.reduce(
        (acc, item, index) => {
            const cat = item.category || "Uncategorized";
            if (!acc[cat]) acc[cat] = [];
            // store original index to allow easy updates
            acc[cat].push({ ...item, originalIndex: index });
            return acc;
        },
        {} as Record<string, (ChecklistItem & { originalIndex: number })[]>,
    );

    const categories = Object.keys(itemsByCategory);

    const toggleCategory = (category: string) => {
        const updated = new Set(expandedCategories);
        if (updated.has(category)) {
            updated.delete(category);
        } else {
            updated.clear();
            updated.add(category);
        }
        setExpandedCategories(updated);
    };

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

    const modalContent = (
        <>
            <ModalBody className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No items found in estimate. Add a category to start your checklist.
                        </p>
                        <Button onClick={() => handleAddItem("New Category")} variant="primary">
                            Add First Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories.map((category, catIndex) => {
                            const items = itemsByCategory[category];
                            const isExpanded = expandedCategories.has(category);

                            return (
                                <div
                                    key={category}
                                    className="border border-border rounded-lg overflow-hidden bg-surface"
                                >
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 font-semibold transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                {catIndex + 1}
                                            </span>
                                            {category}
                                            <span className="text-xs font-normal text-muted-foreground ml-2">
                                                ({items.length} items)
                                            </span>
                                        </div>
                                        <ChevronDownIcon
                                            size={18}
                                            className={cn(
                                                "transition-transform duration-200",
                                                isExpanded ? "rotate-180" : "",
                                            )}
                                        />
                                    </button>

                                    {/* Category Content */}
                                    {isExpanded && (
                                        <div className="p-4 space-y-4 border-t border-border bg-surface">
                                            {items.map(item => (
                                                <div
                                                    key={item.originalIndex}
                                                    className={cn(
                                                        "border rounded-lg p-4 transition-all",
                                                        item.status === "DONE"
                                                            ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                                                            : "bg-surface border-border hover:border-accent/50",
                                                    )}
                                                >
                                                    {/* Header Row: Item Name, Subcategory, Status, Delete */}
                                                    <div className="grid grid-cols-3 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-4 border-b border-border pb-3 items-end">
                                                        <Input
                                                            value={item.item}
                                                            onChange={e =>
                                                                handleItemChange(
                                                                    item.originalIndex,
                                                                    "item",
                                                                    e.target.value,
                                                                )
                                                            }
                                                            label="Item Name"
                                                            placeholder="Item name"
                                                            smallLabel
                                                        />
                                                        <Input
                                                            value={item.subCategory}
                                                            onChange={e =>
                                                                handleItemChange(
                                                                    item.originalIndex,
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
                                                                    opt =>
                                                                        opt.value === item.status,
                                                                ) || null
                                                            }
                                                            onChange={e =>
                                                                handleItemChange(
                                                                    item.originalIndex,
                                                                    "status",
                                                                    e?.value ?? "",
                                                                )
                                                            }
                                                            options={statusOptions}
                                                            label="Status"
                                                            smallLabel
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveItem(item.originalIndex)
                                                            }
                                                            className="h-10 w-10 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                                            title="Remove checklist item"
                                                        >
                                                            <TrashIcon size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Description / Days+Quantity / Inventory-Vendor Row */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                                                        {/* Column 1: Description */}
                                                        <div className="lg:col-span-1">
                                                            <Textarea
                                                                value={item.description || ""}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "description",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                label="Description details & specs"
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
                                                                value={(item.days ?? 0) || ""}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "days",
                                                                        parseInt(e.target.value) ||
                                                                            0,
                                                                    )
                                                                }
                                                                smallLabel
                                                            />
                                                            <Input
                                                                label="Quantity"
                                                                smallLabel
                                                                type="number"
                                                                value={item.quantity || ""}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "quantity",
                                                                        parseInt(e.target.value) ||
                                                                            0,
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
                                                                        checked={
                                                                            item.isInventoryItem
                                                                        }
                                                                        onChange={e => {
                                                                            handleCheckboxChange(
                                                                                item.originalIndex,
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
                                                            {item.isInventoryItem ? (
                                                                <CreatableSelectField
                                                                    smallLabel
                                                                    label="Inventory Item"
                                                                    options={inventoryList.map(
                                                                        inv => ({
                                                                            value: String(
                                                                                inv.id || "",
                                                                            ),
                                                                            label: inv.itemName as string,
                                                                        }),
                                                                    )}
                                                                    value={
                                                                        item.inventoryID
                                                                            ? {
                                                                                  value: String(
                                                                                      item.inventoryID,
                                                                                  ),
                                                                                  label:
                                                                                      inventoryList.find(
                                                                                          inv =>
                                                                                              String(
                                                                                                  inv.id,
                                                                                              ) ===
                                                                                              String(
                                                                                                  item.inventoryID,
                                                                                              ),
                                                                                      )?.itemName ||
                                                                                      String(
                                                                                          item.inventoryID,
                                                                                      ),
                                                                              }
                                                                            : null
                                                                    }
                                                                    onChange={selectedValue => {
                                                                        handleItemChange(
                                                                            item.originalIndex,
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
                                                                <CreatableSelectField
                                                                    smallLabel
                                                                    label="Assigned Vendor"
                                                                    options={vendorList.map(v => ({
                                                                        value: String(v.id || ""),
                                                                        label: v.name as string,
                                                                    }))}
                                                                    value={
                                                                        item.vendor
                                                                            ? {
                                                                                  value: item.vendor,
                                                                                  label:
                                                                                      vendorList.find(
                                                                                          v =>
                                                                                              String(
                                                                                                  v.id,
                                                                                              ) ===
                                                                                              item.vendor,
                                                                                      )?.name ||
                                                                                      item.vendor,
                                                                              }
                                                                            : null
                                                                    }
                                                                    onChange={selectedValue => {
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "vendor",
                                                                            selectedValue,
                                                                        );
                                                                    }}
                                                                    placeholder={
                                                                        loadingVendors
                                                                            ? "Loading..."
                                                                            : "Vendor"
                                                                    }
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
                                                                    item.startDate
                                                                        ? new Date(
                                                                              item.startDate +
                                                                                  "T00:00:00",
                                                                          )
                                                                        : null
                                                                }
                                                                onChange={date => {
                                                                    const value = date
                                                                        ? date
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : "";
                                                                    handleItemChange(
                                                                        item.originalIndex,
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
                                                                    item.endDate
                                                                        ? new Date(
                                                                              item.endDate +
                                                                                  "T00:00:00",
                                                                          )
                                                                        : null
                                                                }
                                                                onChange={date => {
                                                                    const value = date
                                                                        ? date
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : "";
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "endDate",
                                                                        value,
                                                                    );
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
                                                                    item.deadlineDate
                                                                        ? new Date(
                                                                              item.deadlineDate +
                                                                                  "T00:00:00",
                                                                          )
                                                                        : null
                                                                }
                                                                onChange={date => {
                                                                    const value = date
                                                                        ? date
                                                                              .toISOString()
                                                                              .split("T")[0]
                                                                        : "";
                                                                    handleItemChange(
                                                                        item.originalIndex,
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
                                                                value={
                                                                    (item.pricePerItem ?? 0) || ""
                                                                }
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "pricePerItem",
                                                                        parseFloat(
                                                                            e.target.value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add New Item Button */}
                                            <button
                                                onClick={() => handleAddItem(category)}
                                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:text-accent hover:border-accent hover:bg-accent/5 transition-all mt-2"
                                            >
                                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-muted">
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    </svg>
                                                </span>
                                                Add new item to {category}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </ModalBody>

            <ModalFooter>
                <div className="flex-1 text-sm text-muted-foreground font-medium">
                    Total Items: {checklistData.length} | Done:{" "}
                    {checklistData.filter(i => i.status === "DONE").length}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose}>
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
    );
}
