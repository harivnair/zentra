/**
 * Converts an array of objects to CSV format
 * @param data - Array of objects with consistent keys
 * @returns CSV string
 */
export const convertToCSV = <T extends Record<string, unknown>>(data: T[]): string => {
    if (!data || data.length === 0) {
        return "";
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data
        .map(row =>
            Object.values(row)
                .map(value => {
                    // Escape values containing commas, quotes, or newlines
                    const stringValue = String(value ?? "");
                    if (
                        stringValue.includes(",") ||
                        stringValue.includes('"') ||
                        stringValue.includes("\n")
                    ) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                })
                .join(","),
        )
        .join("\n");

    return `${headers}\n${rows}`;
};

/**
 * Downloads data as a CSV file
 * @param data - Array of objects to download
 * @param filename - Name of the downloaded file (default: "table-data.csv")
 */
export const downloadCSV = <T extends Record<string, unknown>>(
    data: T[],
    filename: string = "table-data.csv",
): void => {
    const csv = convertToCSV(data);

    if (!csv) {
        console.warn("No data to download");
        return;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
};

/**
 * Downloads data as a JSON file
 * @param data - Data to download
 * @param filename - Name of the downloaded file (default: "table-data.json")
 */
export const downloadJSON = <T>(data: T, filename: string = "table-data.json"): void => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
};
