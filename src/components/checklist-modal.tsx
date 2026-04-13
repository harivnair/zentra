"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui-old/button";
import { Input } from "@/components/ui-old/input";
import { Label } from "@/components/ui-old/label";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui-old/accordion";
import dynamic from "next/dynamic";
import type { Vendor } from "@/types/vendor";
import { apiRequest } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";

const CreatableSelect = dynamic(() => import("react-select/creatable"), {
    ssr: false,
});

// Assuming EventItem matches backend EventItem model
interface EventItem {
    category?: string;
    subCategory?: string;
    item?: string;
    description?: string;
    quantity?: number;
    count?: number;
    vendor?: string;
    [key: string]: any;
}

interface ChecklistItem {
    category: string;
    subCategory?: string;
    item: string;
    description?: string;
    quantity: number;
    startDate?: string;
    endDate?: string;
    executionTime?: string;
    vendor?: string;
    status?: string; // PENDING, CONFIRMED, IN_PROGRESS, DONE
}

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventData: {
        id?: string;
        items?: EventItem[];
        checklist?: ChecklistItem[];
        [key: string]: any;
    };
    onSave: () => void;
}

export function ChecklistModal({ isOpen, onClose, eventData, onSave }: ChecklistModalProps) {
    const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [loadingVendors, setLoadingVendors] = useState(false);

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

        fetchVendors();
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
                status: "PENDING",
                startDate:
                    item.startDate || item.starDate
                        ? String(item.startDate || item.starDate).split("T")[0]
                        : "",
                endDate: item.endDate ? String(item.endDate).split("T")[0] : "",
                executionTime: "",
            }));
            setChecklistData(initialChecklist);
        } else {
            setChecklistData([]);
        }
    }, [isOpen, eventData]);

    // Group checklist items by category
    const itemsByCategory = checklistData.reduce((acc, item, index) => {
        const cat = item.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        // store original index to allow easy updates
        acc[cat].push({ ...item, originalIndex: index });
        return acc;
    }, {} as Record<string, (ChecklistItem & { originalIndex: number })[]>);

    const categories = Object.keys(itemsByCategory);

    const handleItemChange = (index: number, field: keyof ChecklistItem, value: any) => {
        const newData = [...checklistData];
        newData[index] = { ...newData[index], [field]: value };
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
                vendor: "",
                status: "PENDING",
                startDate: "",
                endDate: "",
                executionTime: "",
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
                item => item.item.trim() !== "" || item.description?.trim() !== ""
            );

            const updatedEvent = {
                ...eventData,
                checklist: filteredData,
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:!bg-gray-900 border dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative m-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-gray-50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Execution Checklist
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage execution tasks for {eventData.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">
                                No items found in estimate. Add a category to start your checklist.
                            </p>
                            <Button onClick={() => handleAddItem("New Category")}>
                                Add First Item
                            </Button>
                        </div>
                    ) : (
                        <Accordion type="multiple" className="space-y-4">
                            {categories.map((category, catIndex) => {
                                const items = itemsByCategory[category];
                                return (
                                    <AccordionItem
                                        key={category}
                                        value={category}
                                        className="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow-sm"
                                    >
                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 data-[state=open]:border-b">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                                                    {catIndex + 1}
                                                </span>
                                                {category}
                                                <span className="text-xs font-normal text-muted-foreground ml-2">
                                                    ({items.length} items)
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0">
                                            <div className="p-4 space-y-4">
                                                {items.map((item, idx) => (
                                                    <div
                                                        key={item.originalIndex}
                                                        className={`border rounded-xl p-4 transition-all ${
                                                            item.status === "DONE"
                                                                ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                                                : "bg-white dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                                        }`}
                                                    >
                                                        {/* Header Row: Item Name, Subcategory, Status, Delete */}
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b dark:border-gray-800 pb-3">
                                                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                                                <div>
                                                                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                        Item Name
                                                                    </Label>
                                                                    <Input
                                                                        value={item.item}
                                                                        onChange={e =>
                                                                            handleItemChange(
                                                                                item.originalIndex,
                                                                                "item",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Item name"
                                                                        className="h-8 text-[13px] font-semibold text-indigo-700 dark:text-indigo-400 bg-gray-50 dark:bg-gray-900 shadow-none border-transparent hover:border-border transition-colors focus:bg-white dark:focus:bg-gray-950"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                        Subcategory (Optional)
                                                                    </Label>
                                                                    <Input
                                                                        value={item.subCategory}
                                                                        onChange={e =>
                                                                            handleItemChange(
                                                                                item.originalIndex,
                                                                                "subCategory",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="e.g. Signage, Branding..."
                                                                        className="h-8 text-[12px] text-muted-foreground bg-gray-50 dark:bg-gray-900 shadow-none border-transparent hover:border-border transition-colors focus:bg-white dark:focus:bg-gray-950"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 dark:border-gray-800 justify-between sm:justify-end">
                                                                <div className="w-[140px]">
                                                                    <select
                                                                        value={
                                                                            item.status || "PENDING"
                                                                        }
                                                                        onChange={e =>
                                                                            handleItemChange(
                                                                                item.originalIndex,
                                                                                "status",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className={`h-8 w-full rounded-md border text-[12px] font-semibold px-2 cursor-pointer focus:ring-2 focus:ring-ring outline-none transition-colors
                                                                            ${
                                                                                item.status ===
                                                                                "DONE"
                                                                                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                                                                    : item.status ===
                                                                                      "CONFIRMED"
                                                                                    ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                                                                    : item.status ===
                                                                                      "IN_PROGRESS"
                                                                                    ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                                                                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                                                            }`}
                                                                    >
                                                                        <option value="PENDING">
                                                                            Pending
                                                                        </option>
                                                                        <option value="IN_PROGRESS">
                                                                            In Progress
                                                                        </option>
                                                                        <option value="CONFIRMED">
                                                                            Confirmed
                                                                        </option>
                                                                        <option value="DONE">
                                                                            Done
                                                                        </option>
                                                                    </select>
                                                                </div>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveItem(
                                                                            item.originalIndex
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                                    title="Remove checklist item"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Details Row */}
                                                        <div className="mb-4">
                                                            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5 cursor-default">
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
                                                                        d="M4 6h16M4 12h16M4 18h7"
                                                                    />
                                                                </svg>
                                                                Description details & specs
                                                            </Label>
                                                            <textarea
                                                                value={item.description || ""}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        item.originalIndex,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full h-16 min-h-[64px] max-h-40 text-[13px] p-2.5 border rounded-lg resize-y bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800 focus:ring-2 focus:ring-ring outline-none transition-shadow text-foreground placeholder:text-muted-foreground/60"
                                                                placeholder="Add elaborate notes, specifics, lengths, details..."
                                                            />
                                                        </div>

                                                        {/* Execution Data Grid */}
                                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-lg border dark:border-gray-800">
                                                            <div className="col-span-1">
                                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                    Quantity
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={e =>
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "quantity",
                                                                            parseInt(
                                                                                e.target.value
                                                                            ) || 0
                                                                        )
                                                                    }
                                                                    className="h-8 text-[13px] bg-white dark:bg-gray-950"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                    Start Date
                                                                </Label>
                                                                <Input
                                                                    type="date"
                                                                    value={item.startDate || ""}
                                                                    onChange={e =>
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "startDate",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="h-8 text-[12px] px-2 bg-white dark:bg-gray-950"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                    End Date
                                                                </Label>
                                                                <Input
                                                                    type="date"
                                                                    value={item.endDate || ""}
                                                                    onChange={e =>
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "endDate",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="h-8 text-[12px] px-2 bg-white dark:bg-gray-950"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                    Time
                                                                </Label>
                                                                <Input
                                                                    type="time"
                                                                    value={item.executionTime || ""}
                                                                    onChange={e =>
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "executionTime",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="h-8 text-[12px] px-2 bg-white dark:bg-gray-950"
                                                                />
                                                            </div>
                                                            <div className="col-span-2 lg:col-span-1 shrink-0">
                                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 cursor-default">
                                                                    Assigned Vendor
                                                                </Label>
                                                                <CreatableSelect
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
                                                                                                  v.id
                                                                                              ) ===
                                                                                              item.vendor
                                                                                      )?.name ||
                                                                                      item.vendor,
                                                                              }
                                                                            : null
                                                                    }
                                                                    onChange={(selected: any) =>
                                                                        handleItemChange(
                                                                            item.originalIndex,
                                                                            "vendor",
                                                                            selected
                                                                                ? selected.value
                                                                                : ""
                                                                        )
                                                                    }
                                                                    placeholder={
                                                                        loadingVendors
                                                                            ? "Loading..."
                                                                            : "Vendor"
                                                                    }
                                                                    className="text-[12px]"
                                                                    classNamePrefix="react-select"
                                                                    isClearable
                                                                    styles={{
                                                                        control: base => ({
                                                                            ...base,
                                                                            minHeight: "32px",
                                                                            height: "32px",
                                                                            backgroundColor:
                                                                                "var(--background)",
                                                                        }),
                                                                        valueContainer: base => ({
                                                                            ...base,
                                                                            padding: "0 8px",
                                                                        }),
                                                                        input: base => ({
                                                                            ...base,
                                                                            margin: "0",
                                                                            padding: "0",
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add New Item Button within Category */}
                                                <button
                                                    onClick={() => handleAddItem(category)}
                                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group mt-2"
                                                >
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                                        <svg
                                                            className="w-4 h-4"
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
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t shrink-0 flex justify-between items-center bg-white dark:bg-gray-900 rounded-b-xl">
                    <div className="text-sm text-gray-500 font-medium">
                        Total Items: {checklistData.length} | Done:{" "}
                        {checklistData.filter(i => i.status === "DONE").length}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {saving ? "Saving..." : "Save Checklist"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
