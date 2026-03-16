import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";

export function useRequestApi<T>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function request<B = object>(
        url: string,
        options?: Omit<RequestInit, "body"> & { body?: B },
    ): Promise<T | null> {
        setLoading(true);
        setError(null);

        try {
            let body = options?.body ?? {};

            // Only stringify plain objects; leave FormData as is
            if (body && typeof body === "object" && !(body instanceof FormData)) {
                body = JSON.stringify(body);
            }
            const res = await apiRequest(url, { ...options, body: body as BodyInit });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                toast.error(err?.error || "An error occurred");
                throw new Error(err.error || "API request failed");
            }
            const result = await res.json();
            setData(result);

            return result;
        } catch (err: unknown) {
            setError((err as Error)?.message);
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { data, loading, error, request };
}
