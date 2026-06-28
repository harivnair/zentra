"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
    type ArtifactLine,
    type GroupedCategory,
    type GroupedItem,
    groupLinesByCategory,
    createEmptyLine,
    createCategoryMarker,
    createSubCategoryMarker,
    getUniqueCategoryName,
    getUniqueSubCategoryName,
    itemTotal,
} from "@/lib/utils/artifact-utils";
import { TrashIcon, PlusIcon } from "@/components/ui/icons";

/* ------------------------------------------------------------------ */
/*  Line insertion helpers – preserve creation order within categories */
/* ------------------------------------------------------------------ */

function getCategoryName(line: ArtifactLine): string {
    return line.category || "General";
}

function getCategoryLineIndices(lines: ArtifactLine[], catName: string): number[] {
    return lines
        .map((line, index) => (getCategoryName(line) === catName ? index : -1))
        .filter(index => index >= 0);
}

function insertLineAt(lines: ArtifactLine[], index: number, line: ArtifactLine): ArtifactLine[] {
    const next = [...lines];
    next.splice(index, 0, line);
    return next;
}

function insertAtEndOfCategory(
    lines: ArtifactLine[],
    catName: string,
    line: ArtifactLine,
): ArtifactLine[] {
    const indices = getCategoryLineIndices(lines, catName);
    const insertAt = indices.length > 0 ? indices[indices.length - 1] + 1 : lines.length;
    return insertLineAt(lines, insertAt, line);
}

function insertDirectItemInCategory(
    lines: ArtifactLine[],
    catName: string,
    line: ArtifactLine,
): ArtifactLine[] {
    const indices = getCategoryLineIndices(lines, catName);
    if (indices.length === 0) {
        return [...lines, line];
    }

    let lastDirectIdx = -1;
    let firstSubIdx = -1;

    for (const index of indices) {
        const current = lines[index];
        if (current.subCategory?.trim()) {
            if (firstSubIdx === -1) {
                firstSubIdx = index;
            }
        } else if (!current.kind || current.kind === "item" || current.kind === "category_marker") {
            lastDirectIdx = index;
        }
    }

    const insertAt =
        firstSubIdx !== -1
            ? firstSubIdx
            : lastDirectIdx !== -1
              ? lastDirectIdx + 1
              : indices[indices.length - 1] + 1;

    return insertLineAt(lines, insertAt, line);
}

function insertSubCategoryInCategory(
    lines: ArtifactLine[],
    catName: string,
    line: ArtifactLine,
): ArtifactLine[] {
    return insertAtEndOfCategory(lines, catName, line);
}

function insertItemInSubCategory(
    lines: ArtifactLine[],
    catName: string,
    subName: string,
    line: ArtifactLine,
): ArtifactLine[] {
    const indices = getCategoryLineIndices(lines, catName);
    if (indices.length === 0) {
        return [...lines, line];
    }

    let lastSubLineIdx = -1;
    for (const index of indices) {
        const current = lines[index];
        if ((current.subCategory?.trim() || "") === subName) {
            lastSubLineIdx = index;
        }
    }

    const insertAt = lastSubLineIdx !== -1 ? lastSubLineIdx + 1 : indices[indices.length - 1] + 1;

    return insertLineAt(lines, insertAt, line);
}

/* ------------------------------------------------------------------ */

interface InlineEditProps {
    value: string;
    onSave: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

function InlineEdit({
    value,
    onSave,
    placeholder = "",
    className = "",
    disabled = false,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = useCallback(() => {
        setIsEditing(false);
        const trimmed = editValue.trim();
        if (trimmed !== value) {
            onSave(trimmed);
        }
    }, [editValue, onSave, value]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                handleSave();
            } else if (e.key === "Escape") {
                setEditValue(value);
                setIsEditing(false);
            }
        },
        [handleSave, value],
    );

    if (disabled) {
        return (
            <span className={cn("text-sm text-gray-500", className)}>{value || placeholder}</span>
        );
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-full border-b-2 border-primary bg-transparent px-1 py-0.5 text-sm outline-none transition-colors",
                    className,
                )}
                placeholder={placeholder}
            />
        );
    }

    return (
        <span
            className={cn(
                "cursor-pointer rounded py-0.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700",
                !value && "italic text-gray-400",
                className,
            )}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {value || <span className="text-gray-400 italic">{placeholder}</span>}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  InlineNumber – click-to-edit number field                          */
/* ------------------------------------------------------------------ */

interface InlineNumberProps {
    value: number;
    onSave: (value: number) => void;
    className?: string;
    disabled?: boolean;
    min?: number;
    step?: number;
}

function InlineNumber({
    value,
    onSave,
    className = "",
    disabled = false,
    min = 0,
    step = 1,
}: InlineNumberProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(String(value));
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = useCallback(() => {
        setIsEditing(false);
        const parsed = Number(editValue);
        if (!Number.isNaN(parsed) && parsed !== value) {
            onSave(parsed);
        }
    }, [editValue, onSave, value]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                handleSave();
            } else if (e.key === "Escape") {
                setEditValue(String(value));
                setIsEditing(false);
            }
        },
        [handleSave, value],
    );

    if (disabled) {
        return <span className={cn("text-sm text-gray-500", className)}>{value}</span>;
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="number"
                min={min}
                step={step}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-16 border-b-2 border-blue-400 bg-transparent px-1 py-0.5 text-right text-sm outline-none transition-colors",
                    className,
                )}
            />
        );
    }

    return (
        <span
            className={cn(
                "inline-flex cursor-pointer items-center justify-end gap-0.5 rounded px-1.5 py-0.5 text-sm tabular-nums transition-colors hover:bg-blue-50 hover:text-blue-700",
                className,
            )}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {value}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  ArtifactItemRow – renders a single item with inline fields         */
/* ------------------------------------------------------------------ */

interface ArtifactItemRowProps {
    item: GroupedItem;
    index: number; // 1-based display index
    disabled?: boolean;
    onUpdate: (updated: GroupedItem) => void;
    onDelete: () => void;
    hasError?: boolean;
}

function ArtifactItemRow({
    item,
    index,
    disabled = false,
    onUpdate,
    onDelete,
    hasError = false,
}: ArtifactItemRowProps) {
    const total = itemTotal(item);

    return (
        <tr
            className={cn(
                "group transition-colors hover:bg-gray-50/50",
                hasError && "bg-red-50 hover:bg-red-50",
            )}
            ref={
                hasError
                    ? (el: HTMLTableRowElement | null) => {
                          if (el?.isConnected) {
                              el.scrollIntoView({ behavior: "smooth", block: "center" });
                              el.focus({ preventScroll: true });
                          }
                      }
                    : undefined
            }
            tabIndex={hasError ? 0 : -1}
        >
            <td className="px-6 py-1.5 text-center">
                <span className="text-xs font-medium text-gray-400">{index}.</span>
            </td>
            <td className="px-2 py-1.5">
                <InlineEdit
                    value={item.item}
                    onSave={val => onUpdate({ ...item, item: val })}
                    placeholder="Item name"
                    disabled={disabled}
                    className="text-xs"
                />
            </td>
            <td className="px-2 py-1.5">
                <InlineEdit
                    value={item.specification}
                    onSave={val => onUpdate({ ...item, specification: val })}
                    placeholder="Specification"
                    disabled={disabled}
                    className="text-xs"
                />
            </td>
            <td className="px-2 py-1.5 text-center">
                <InlineNumber
                    value={item.days}
                    onSave={val => onUpdate({ ...item, days: val })}
                    disabled={disabled}
                    min={1}
                    className="mx-auto text-xs"
                />
            </td>
            <td className="px-2 py-1.5 text-center">
                <InlineNumber
                    value={item.sqft}
                    onSave={val => onUpdate({ ...item, sqft: val })}
                    disabled={disabled}
                    min={1}
                    className="mx-auto text-xs"
                />
            </td>
            <td className="px-2 py-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <InlineNumber
                        value={item.rate}
                        onSave={val => onUpdate({ ...item, rate: val })}
                        disabled={disabled}
                        min={0}
                        step={0.01}
                        className="tabular-nums text-xs"
                    />
                </div>
            </td>
            <td className="whitespace-nowrap px-2 py-1.5 text-right text-xs font-semibold text-gray-800">
                ₹{total.toFixed(2)}
            </td>
            <td className="px-2 py-1.5 text-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={onDelete}
                    className="h-7 w-7 p-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                >
                    <TrashIcon size={14} />
                </Button>
            </td>
        </tr>
    );
}

/* ------------------------------------------------------------------ */
/*  CategoryCard – renders a category with sub-categories & items      */
/* ------------------------------------------------------------------ */

interface CategoryCardProps {
    category: GroupedCategory;
    disabled?: boolean;
    onRename: (newName: string) => void;
    onDelete: () => void;
    onAddSubCategory: () => void;
    onAddItem: () => void;
    onDeleteSubCategory: (subName: string) => void;
    onRenameSubCategory: (oldName: string, newName: string) => void;
    onAddItemToSubCategory: (subName: string) => void;
    onUpdateItem: (itemId: string, updated: GroupedItem) => void;
    onDeleteItem: (itemId: string) => void;
    errorLineIds?: Set<string>;
}

function CategoryCard({
    category,
    disabled = false,
    onRename,
    onDelete,
    onAddSubCategory,
    onAddItem,
    onDeleteSubCategory,
    onRenameSubCategory,
    onAddItemToSubCategory,
    onUpdateItem,
    onDeleteItem,
    errorLineIds,
}: CategoryCardProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* ---- Category Header ---- */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <InlineEdit
                        value={category.name}
                        onSave={onRename}
                        placeholder="Category name"
                        disabled={disabled}
                        className="font-medium text-gray-900"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={onAddSubCategory}
                    >
                        <PlusIcon size={12} />
                        Sub Category
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={onDelete}
                        className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                        title="Delete category"
                    >
                        <TrashIcon size={14} />
                    </Button>
                </div>
            </div>

            {/* ---- Table with single header for all items ---- */}
            {(category.subCategories.length > 0 || category.directItems.length > 0) && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    #
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Item
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Specification
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Days
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Qty
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Rate
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Total
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-600" />
                                {/* Action */}
                            </tr>
                        </thead>
                        <tbody>
                            {/* ---- Direct items under category ---- */}
                            {category.directItems.map((item, itemIdx) => (
                                <ArtifactItemRow
                                    key={item.id}
                                    item={item}
                                    index={itemIdx + 1}
                                    disabled={disabled}
                                    onUpdate={updated => onUpdateItem(item.id, updated)}
                                    onDelete={() => onDeleteItem(item.id)}
                                    hasError={errorLineIds ? errorLineIds.has(item.id) : false}
                                />
                            ))}

                            {/* ---- Category-level Add Item (when sub categories exist) ---- */}
                            {category.subCategories.length > 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-1">
                                        <div className="flex flex-col gap-1 px-6 py-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={disabled}
                                                onClick={onAddItem}
                                                className="h-6 gap-1 text-xs text-gray-400"
                                            >
                                                <PlusIcon size={11} />
                                                Item
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* ---- Sub Categories ---- */}
                            {category.subCategories.map(sub => (
                                <React.Fragment key={sub.id}>
                                    <tr className="border-b border-gray-100 bg-gray-50/30">
                                        <td colSpan={8} className="px-4 py-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold uppercase text-gray-400">
                                                        {sub.romanIndex}.
                                                    </span>
                                                    <InlineEdit
                                                        value={sub.name}
                                                        onSave={newName =>
                                                            onRenameSubCategory(sub.name, newName)
                                                        }
                                                        placeholder="Sub category"
                                                        disabled={disabled}
                                                        className="text-sm text-gray-700"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={disabled}
                                                    onClick={() => onDeleteSubCategory(sub.name)}
                                                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                                                    title="Delete sub category"
                                                >
                                                    <TrashIcon size={13} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {sub.items.map((item, itemIdx) => (
                                        <ArtifactItemRow
                                            key={item.id}
                                            item={item}
                                            index={itemIdx + 1}
                                            disabled={disabled}
                                            onUpdate={updated => onUpdateItem(item.id, updated)}
                                            onDelete={() => onDeleteItem(item.id)}
                                            hasError={
                                                errorLineIds ? errorLineIds.has(item.id) : false
                                            }
                                        />
                                    ))}
                                    <tr>
                                        <td colSpan={8} className="px-6 py-1">
                                            <div className="flex flex-col gap-1 px-6 py-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={disabled}
                                                    onClick={() => onAddItemToSubCategory(sub.name)}
                                                    className="h-6 gap-1 text-xs text-gray-400"
                                                >
                                                    <PlusIcon size={11} />
                                                    Item
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add item buttons */}
            <div className="flex flex-col gap-1 px-6 py-2">
                {category.subCategories.length === 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={onAddItem}
                        className="h-6 gap-1 text-xs text-gray-400"
                    >
                        <PlusIcon size={11} />
                        Item
                    </Button>
                )}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  ArtifactsSection – main exported component                         */
/* ------------------------------------------------------------------ */

export interface ArtifactsSectionProps {
    lines: ArtifactLine[];
    onLinesChange: (lines: ArtifactLine[]) => void;
    disabled?: boolean;
    errorLineIds?: Set<string>;
    errorRowRef?: React.RefCallback<HTMLTableRowElement> | React.Ref<HTMLTableRowElement>;
}

export function ArtifactsSection({
    lines,
    onLinesChange,
    disabled = false,
    errorLineIds,
}: ArtifactsSectionProps) {
    const categories = useMemo(() => groupLinesByCategory(lines), [lines]);

    const commit = useCallback(
        (nextLines: ArtifactLine[]) => {
            onLinesChange(nextLines);
        },
        [onLinesChange],
    );

    const addCategory = useCallback(() => {
        const name = getUniqueCategoryName(lines);
        commit([...lines, createCategoryMarker(name)]);
    }, [lines, commit]);

    const deleteCategory = useCallback(
        (catName: string) => {
            commit(lines.filter(l => getCategoryName(l) !== catName));
        },
        [lines, commit],
    );

    const renameCategory = useCallback(
        (oldName: string, newName: string) => {
            if (!newName || oldName === newName) return;
            commit(
                lines.map(l => (getCategoryName(l) === oldName ? { ...l, category: newName } : l)),
            );
        },
        [lines, commit],
    );

    const addSubCategory = useCallback(
        (catName: string) => {
            const subName = getUniqueSubCategoryName(lines, catName);
            commit(
                insertSubCategoryInCategory(
                    lines,
                    catName,
                    createSubCategoryMarker(catName, subName),
                ),
            );
        },
        [lines, commit],
    );

    const deleteSubCategory = useCallback(
        (catName: string, subName: string) => {
            commit(
                lines.filter(l => !(getCategoryName(l) === catName && l.subCategory === subName)),
            );
        },
        [lines, commit],
    );

    const renameSubCategory = useCallback(
        (catName: string, oldName: string, newName: string) => {
            if (!newName || oldName === newName) return;
            commit(
                lines.map(l =>
                    getCategoryName(l) === catName && l.subCategory === oldName
                        ? { ...l, subCategory: newName }
                        : l,
                ),
            );
        },
        [lines, commit],
    );

    const addItemToCategory = useCallback(
        (catName: string) => {
            commit(insertDirectItemInCategory(lines, catName, createEmptyLine(catName)));
        },
        [lines, commit],
    );

    const addItemToSubCategory = useCallback(
        (catName: string, subName: string) => {
            commit(
                insertItemInSubCategory(lines, catName, subName, createEmptyLine(catName, subName)),
            );
        },
        [lines, commit],
    );

    const deleteItem = useCallback(
        (itemId: string) => {
            commit(lines.filter(l => l.id !== itemId));
        },
        [lines, commit],
    );

    const updateItem = useCallback(
        (itemId: string, updated: GroupedItem) => {
            commit(
                lines.map(l =>
                    l.id === itemId
                        ? {
                              ...l,
                              item: updated.item,
                              specification: updated.specification,
                              days: updated.days,
                              sqft: updated.sqft,
                              rate: updated.rate,
                              vendor: updated.vendor,
                          }
                        : l,
                ),
            );
        },
        [lines, commit],
    );

    /* ---- empty state ---- */
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-gray-500">No artifacts added yet.</p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={addCategory}
                    className="gap-1.5 border-dashed"
                >
                    <PlusIcon size={14} />
                    Add Category
                </Button>
            </div>
        );
    }

    /* ---- render ---- */
    return (
        <div className="space-y-3">
            {categories.map(cat => (
                <CategoryCard
                    key={cat.id}
                    category={cat}
                    disabled={disabled}
                    onRename={(newName: string) => renameCategory(cat.name, newName)}
                    onDelete={() => deleteCategory(cat.name)}
                    onAddSubCategory={() => addSubCategory(cat.name)}
                    onAddItem={() => addItemToCategory(cat.name)}
                    onDeleteSubCategory={(subName: string) => deleteSubCategory(cat.name, subName)}
                    onRenameSubCategory={(oldName: string, newName: string) =>
                        renameSubCategory(cat.name, oldName, newName)
                    }
                    onAddItemToSubCategory={(subName: string) =>
                        addItemToSubCategory(cat.name, subName)
                    }
                    onUpdateItem={(itemId: string, updated: GroupedItem) =>
                        updateItem(itemId, updated)
                    }
                    onDeleteItem={(itemId: string) => deleteItem(itemId)}
                    errorLineIds={errorLineIds}
                />
            ))}
            <div className="flex justify-center pt-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={addCategory}
                    className="gap-1.5 border-dashed text-xs"
                >
                    <PlusIcon size={14} />
                    Add Category
                </Button>
            </div>
        </div>
    );
}
