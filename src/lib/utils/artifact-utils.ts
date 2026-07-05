import { toRomanLower } from "./index";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ArtifactLineKind = "item" | "category_marker" | "subcategory_marker";

export interface ArtifactLine {
    id: string;
    category: string;
    subCategory: string;
    item: string;
    specification: string;
    days: number;
    sqft: number;
    rate: number;
    vendor: string;
    kind?: ArtifactLineKind;
    unit?: string;
}

export interface GroupedItem {
    id: string;
    item: string;
    specification: string;
    days: number;
    sqft: number;
    rate: number;
    vendor: string;
    unit?: string;
}

export interface GroupedSubCategory {
    id: string;
    name: string;
    items: GroupedItem[];
    romanIndex: string;
}

export interface GroupedCategory {
    id: string;
    name: string;
    directItems: GroupedItem[];
    subCategories: GroupedSubCategory[];
}

/* ------------------------------------------------------------------ */
/*  ID generator                                                       */
/* ------------------------------------------------------------------ */

export function generateId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2, 10)}`;
}

/* ------------------------------------------------------------------ */
/*  Group flat lines into hierarchical structure                       */
/* ------------------------------------------------------------------ */

export const QUANTITY_UNITS = ["sq.ft", "nos", "g", "kg", "cm", "m", "ft", "in"] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export function groupLinesByCategory(lines: ArtifactLine[]): GroupedCategory[] {
    const categoryMap = new Map<
        string,
        {
            name: string;
            directItems: GroupedItem[];
            subCategoryMap: Map<string, { id: string; name: string; items: GroupedItem[] }>;
        }
    >();

    for (const line of lines) {
        const catName = line.category || "General";
        if (!categoryMap.has(catName)) {
            categoryMap.set(catName, {
                name: catName,
                directItems: [],
                subCategoryMap: new Map(),
            });
        }
        const cat = categoryMap.get(catName)!;
        const kind = line.kind ?? "item";

        if (kind === "category_marker") {
            continue;
        }

        if (kind === "subcategory_marker") {
            const subName = line.subCategory.trim();
            if (!cat.subCategoryMap.has(subName)) {
                cat.subCategoryMap.set(subName, {
                    id: line.id,
                    name: subName,
                    items: [],
                });
            }
            continue;
        }

        const item: GroupedItem = {
            id: line.id,
            item: line.item,
            specification: line.specification,
            days: line.days,
            sqft: line.sqft,
            rate: line.rate,
            vendor: line.vendor,
            unit: line.unit || "nos",
        };

        if (line.subCategory && line.subCategory.trim()) {
            const subName = line.subCategory.trim();
            if (!cat.subCategoryMap.has(subName)) {
                cat.subCategoryMap.set(subName, {
                    id: generateId(),
                    name: subName,
                    items: [],
                });
            }
            cat.subCategoryMap.get(subName)!.items.push(item);
        } else {
            cat.directItems.push(item);
        }
    }

    const result: GroupedCategory[] = [];
    let catIndex = 0;
    for (const [, cat] of categoryMap) {
        catIndex++;
        const subCategories: GroupedSubCategory[] = [];
        let subIndex = 0;
        for (const [, sub] of cat.subCategoryMap) {
            subIndex++;
            subCategories.push({
                ...sub,
                romanIndex: toRomanLower(subIndex),
            });
        }
        result.push({
            id: `cat-${catIndex}-${generateId().slice(0, 6)}`,
            name: cat.name,
            directItems: cat.directItems,
            subCategories,
        });
    }
    return result;
}

/* ------------------------------------------------------------------ */
/*  Flatten grouped structure back to flat lines                       */
/* ------------------------------------------------------------------ */

export function flattenGroupedToLines(categories: GroupedCategory[]): ArtifactLine[] {
    const lines: ArtifactLine[] = [];

    for (const cat of categories) {
        for (const item of cat.directItems) {
            lines.push({
                id: item.id,
                category: cat.name,
                subCategory: "",
                item: item.item,
                specification: item.specification,
                days: item.days,
                sqft: item.sqft,
                rate: item.rate,
                vendor: item.vendor,
                unit: item.unit || "nos",
            });
        }
        for (const sub of cat.subCategories) {
            for (const item of sub.items) {
                lines.push({
                    id: item.id,
                    category: cat.name,
                    subCategory: sub.name,
                    item: item.item,
                    specification: item.specification,
                    days: item.days,
                    sqft: item.sqft,
                    rate: item.rate,
                    vendor: item.vendor,
                    unit: item.unit || "nos",
                });
            }
        }
    }
    return lines;
}

/* ------------------------------------------------------------------ */
/*  Helper – default empty line factory                                */
/* ------------------------------------------------------------------ */

export function createEmptyLine(category: string, subCategory = ""): ArtifactLine {
    return {
        id: generateId(),
        category,
        subCategory,
        item: "",
        specification: "",
        days: 1,
        sqft: 1,
        rate: 0,
        vendor: "",
        kind: "item",
        unit: "nos",
    };
}

export function createCategoryMarker(category: string): ArtifactLine {
    return {
        id: generateId(),
        category,
        subCategory: "",
        item: "",
        specification: "",
        days: 1,
        sqft: 1,
        rate: 0,
        vendor: "",
        kind: "category_marker",
        unit: "nos",
    };
}

export function createSubCategoryMarker(category: string, subCategory: string): ArtifactLine {
    return {
        id: generateId(),
        category,
        subCategory,
        item: "",
        specification: "",
        days: 1,
        sqft: 1,
        rate: 0,
        vendor: "",
        kind: "subcategory_marker",
        unit: "nos",
    };
}

export function isPersistableArtifactLine(line: ArtifactLine): boolean {
    return !line.kind || line.kind === "item";
}

export function getUniqueCategoryName(lines: ArtifactLine[]): string {
    const existing = new Set(lines.map(l => l.category || "General"));
    let name = "New Category";
    let counter = 1;
    while (existing.has(name)) {
        name = `New Category ${counter++}`;
    }
    return name;
}

export function getUniqueSubCategoryName(lines: ArtifactLine[], category: string): string {
    const existing = new Set(getSubCategoryNames(lines, category));
    let name = "New Sub Category";
    let counter = 1;
    while (existing.has(name)) {
        name = `New Sub Category ${counter++}`;
    }
    return name;
}

/* ------------------------------------------------------------------ */
/*  Utility – extract unique names                                     */
/* ------------------------------------------------------------------ */

export function getCategoryNames(lines: ArtifactLine[]): string[] {
    return [...new Set(lines.map(l => l.category || "General"))];
}

export function getSubCategoryNames(lines: ArtifactLine[], category: string): string[] {
    return [
        ...new Set(
            lines
                .filter(l => (l.category || "General") === category && l.subCategory)
                .map(l => l.subCategory),
        ),
    ].filter(Boolean);
}

export function itemTotal(item: GroupedItem): number {
    return item.days * item.sqft * item.rate;
}

export function sumItemsTotal(items: GroupedItem[]): number {
    return items.reduce((sum, item) => sum + itemTotal(item), 0);
}
