/**
 * Shared validation for Execution Checklist items.
 *
 * Centralized so the editor (inline field errors) and the modal (Save gate +
 * hierarchy highlighting) both rely on the exact same rules. The "Inventory vs
 * Vendor" conditional requirement is re-evaluated on every check, so errors
 * update immediately as the "Use Inventory" toggle changes.
 */
import type { ChecklistItem } from "./types";

/** Field name -> error message. A present key means the field is invalid. */
export interface ChecklistItemValidation {
    item?: string;
    status?: string;
    description?: string;
    days?: string;
    quantity?: string;
    unit?: string;
    vendor?: string;
    inventoryID?: string;
    [field: string]: string | undefined;
}

const isPositiveNumber = (value: number | undefined): boolean =>
    value != null && Number.isFinite(Number(value)) && Number(value) > 0;

/** Validate one checklist item and return a map of field errors (empty = valid). */
export function validateChecklistItem(item: ChecklistItem): ChecklistItemValidation {
    const errors: ChecklistItemValidation = {};

    // Item Name — Required
    if (!item.item?.trim()) {
        errors.item = "Item Name is required.";
    }

    // Status — Required
    if (!item.status) {
        errors.status = "Status is required.";
    }

    // Description — Required
    if (!item.description?.trim()) {
        errors.description = "Description is required.";
    }

    // Days — Required
    if (!isPositiveNumber(item.days)) {
        errors.days = "Days is required.";
    }

    // Quantity — Required
    if (!isPositiveNumber(item.quantity)) {
        errors.quantity = "Quantity is required.";
    }

    // Unit — Required
    if (!item.unit?.trim()) {
        errors.unit = "Unit is required.";
    }

    // Conditional: Inventory required when "Use Inventory" is enabled;
    // otherwise Assigned Vendor is required.
    if (item.isInventoryItem) {
        if (item.inventoryID == null || String(item.inventoryID).trim() === "") {
            errors.inventoryID = 'Inventory is required when "Use Inventory" is enabled.';
        }
    } else if (!item.vendor?.trim()) {
        errors.vendor = "Vendor is required when inventory is not used.";
    }

    return errors;
}

/** True when the item has at least one validation error. */
export function hasValidationErrors(item: ChecklistItem): boolean {
    return Object.keys(validateChecklistItem(item)).length > 0;
}