import { apiRequest } from "@/lib/api/api-client";
import { useState, useCallback } from "react";

export function useRequestApi<T>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = useCallback(
        async <B = object>(
            url: string,
            options?: Omit<RequestInit, "body"> & { body?: B },
        ): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                let body: BodyInit | undefined = options?.body as BodyInit | undefined;

                // Only stringify plain objects; leave FormData as is
                // Don't include body for GET/HEAD requests
                const method = options?.method?.toUpperCase();
                if (body && method !== "GET" && method !== "HEAD") {
                    if (typeof body === "object" && !(body instanceof FormData)) {
                        body = JSON.stringify(body);
                    }
                } else if (method === "GET" || method === "HEAD") {
                    body = undefined;
                }

                const res = await apiRequest(url, { ...options, body });
                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err.error || "API request failed");
                }
                const result = await res.json();
                setData(result);

                return result;
            } catch (err: unknown) {
                console.log(err);

                setError((err as Error)?.message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { data, loading, error, request };
}
