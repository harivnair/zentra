import type { CategoryEditorItemColumnSpec, CategoryEditorFieldType } from "../types";

/** An editable in-row field (text/number/unit columns in row order). */
export interface EditableItemField {
    field: string;
    type: Extract<CategoryEditorFieldType, "text" | "number" | "unit">;
}

/** Build the in-row editing order from the configured columns. */
export function buildEditableFieldOrder(
    columns: readonly CategoryEditorItemColumnSpec[],
): EditableItemField[] {
    const fields: EditableItemField[] = [];
    for (const column of columns) {
        if (column.type === "text" || column.type === "number" || column.type === "unit") {
            fields.push({ field: column.field, type: column.type });
        }
    }
    return fields;
}

/** Focus an element without scrolling the container. */
export function focusElement(elem: HTMLElement | null) {
    if (elem) {
        elem.focus({ preventScroll: true });
    }
}

/**
 * Focus the next editable field in the item row. Returns `false` when there
 * is no next field, so the caller can fall back to default browser behavior.
 */
export function focusNextItemField(
    row: HTMLElement,
    currentField: string,
    fieldOrder: readonly EditableItemField[],
    buttons: ReadonlyArray<HTMLButtonElement>,
): boolean {
    const currentIdx = fieldOrder.findIndex(f => f.field === currentField);
    if (currentIdx === -1) return false;

    const next = fieldOrder[currentIdx + 1];
    if (!next) return false;

    const nextEl = row.querySelector<HTMLElement>(`[data-field="${next.field}"]`);
    if (!nextEl) return false;

    // Unit columns have an associated dropdown toggle; prefer focusing a
    // button when present, otherwise open the editor by clicking the field.
    if (next.type === "unit") {
        const unitButton = buttons.find(b => b.dataset.field === next.field);
        if (unitButton) {
            unitButton.focus();
            return true;
        }
    }

    nextEl.click();
    focusElement(nextEl);
    return true;
}

/**
 * Focus the previous editable field in the item row (Shift+Tab). Returns
 * `false` when there is no previous field, so the caller can fall back to
 * the default browser behavior.
 */
export function focusPreviousItemField(
    row: HTMLElement,
    currentField: string,
    fieldOrder: readonly EditableItemField[],
    buttons: ReadonlyArray<HTMLButtonElement>,
): boolean {
    const currentIdx = fieldOrder.findIndex(f => f.field === currentField);
    if (currentIdx <= 0) return false;

    const prev = fieldOrder[currentIdx - 1];
    if (!prev) return false;

    const prevEl = row.querySelector<HTMLElement>(`[data-field="${prev.field}"]`);
    if (!prevEl) return false;

    if (prev.type === "unit") {
        const unitButton = buttons.find(b => b.dataset.field === prev.field);
        if (unitButton) {
            unitButton.focus();
        } else {
            prevEl.click();
        }
    } else {
        prevEl.click();
    }
    return true;
}