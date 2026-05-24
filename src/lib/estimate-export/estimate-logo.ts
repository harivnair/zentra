const LOGO_PATH = "/logo.svg";
const LOGO_RENDER_WIDTH = 200;
const LOGO_RENDER_HEIGHT = 200;

let cachedLogoPngBase64: string | null = null;
let cachedLogoDataUrl: string | null = null;

function stripDataUrlPrefix(dataUrl: string): string {
    const commaIndex = dataUrl.indexOf(",");
    return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

function svgToPngDataUrl(svgText: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const aspect =
                img.naturalWidth > 0 && img.naturalHeight > 0
                    ? img.naturalWidth / img.naturalHeight
                    : 1;

            if (aspect >= 1) {
                canvas.width = LOGO_RENDER_WIDTH;
                canvas.height = Math.round(LOGO_RENDER_WIDTH / aspect);
            } else {
                canvas.height = LOGO_RENDER_HEIGHT;
                canvas.width = Math.round(LOGO_RENDER_HEIGHT * aspect);
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("Canvas is not available"));
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to render logo image"));
        };

        img.src = objectUrl;
    });
}

/**
 * Loads `/logo.svg`, rasterizes to PNG in the browser, and caches the result.
 */
export async function getEstimateLogoPngBase64(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    if (cachedLogoPngBase64) return cachedLogoPngBase64;

    try {
        const response = await fetch(LOGO_PATH);
        if (!response.ok) return null;

        const svgText = await response.text();
        const dataUrl = await svgToPngDataUrl(svgText);
        cachedLogoPngBase64 = stripDataUrlPrefix(dataUrl);
        cachedLogoDataUrl = dataUrl;
        return cachedLogoPngBase64;
    } catch (error) {
        console.error("Failed to load estimate logo:", error);
        return null;
    }
}

export async function getEstimateLogoDataUrl(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    if (cachedLogoDataUrl) return cachedLogoDataUrl;

    const base64 = await getEstimateLogoPngBase64();
    if (!base64) return null;

    return `data:image/png;base64,${base64}`;
}

/** Clears cached logo (useful if logo asset changes during dev hot reload). */
export function clearEstimateLogoCache(): void {
    cachedLogoPngBase64 = null;
    cachedLogoDataUrl = null;
}
