"use client";

import { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui-old/button";
import { Input } from "@/components/ui-old/input";
import { Label } from "@/components/ui-old/label";
import { apiRequest } from "@/lib/api/api-client";

type EstimateLine = {
    id: string;
    category: string;
    item: string;
    specification: string;
    days: number;
    sqft: number;
    rate: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (row: {
        eventName: string;
        enquiryDate: string;
        clientPoc: string;
        status: "In Progress" | "Not Started" | "Completed";
        gst?: string;
        items?: EstimateLine[];
    }) => void;
};

const validationSchema = Yup.object({
    eventName: Yup.string().required("Event name is required"),
    dateFrom: Yup.string().required("Start date is required"),
});

export default function CreateChecklistModal({ open, onClose, onSave }: Props) {
    const [events, setEvents] = useState<
        Array<{ eventName: string; id: string; clientId?: string; clientName?: string }>
    >([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingEstimate, setLoadingEstimate] = useState(false);
    // selectedEventId not needed for now
    const [lines, setLines] = useState<EstimateLine[]>([]);
    const formikRef = useRef<FormikProps<FormValues> | null>(null);

    const generateId = () => {
        return `id-${Math.random().toString(36).slice(2, 10)}`;
    };

    type FormValues = {
        eventId: string;
        eventName: string;
        clientId: string;
        clientName: string;
        clientPoc: string;
        dateFrom: string;
        dateTo: string;
        fromDateTime: string;
        toDateTime: string;
        venue: string;
        description: string;
        gst: string;
    };

    // Helper to format a date string to YYYY-MM-DDTHH:mm for datetime-local inputs
    const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            const iso = d.toISOString();
            return iso.slice(0, 16); // YYYY-MM-DDTHH:mm
        } catch {
            return "";
        }
    };

    useEffect(() => {
        if (!open) return;
        // fetch events once when modal opens
        const fetchEvents = async () => {
            try {
                setLoadingEvents(true);
                const res = await apiRequest("/api/events/names");
                if (!res.ok) throw new Error("Failed to fetch events");
                const data = await res.json();
                // Expecting [{ eventName, id, clientId, clientName }, ...]
                if (Array.isArray(data)) {
                    const payload = data as unknown;
                    if (Array.isArray(payload)) {
                        const mapped = payload.map(d => {
                            const rec = d as Record<string, unknown>;
                            const eventName = String(
                                rec["eventName"] ?? rec["title"] ?? rec["name"] ?? ""
                            );
                            const id = String(rec["id"] ?? "");
                            const clientId = String(
                                rec["clientId"] ??
                                    (rec["client"] &&
                                        (rec["client"] as Record<string, unknown>)["id"]) ??
                                    ""
                            );
                            const clientName = String(
                                rec["clientName"] ??
                                    (rec["client"] &&
                                        (rec["client"] as Record<string, unknown>)["name"]) ??
                                    ""
                            );
                            return { eventName, id, clientId, clientName };
                        });
                        setEvents(mapped);
                    } else {
                        setEvents([]);
                    }
                } else {
                    setEvents([]);
                }
            } catch (err) {
                console.error("Failed to load events", err);
                setEvents([]);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
        // reset lines
        setLines([
            {
                id: generateId(),
                category: "General",
                item: "New item",
                specification: "",
                days: 1,
                sqft: 1,
                rate: 0,
            },
        ]);
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start md:items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="mt-12 md:mt-0 bg-white rounded-xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl hide-scrollbar mx-4 md:mx-0 relative">
                {loadingEstimate && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                            <div className="text-sm text-gray-700">Loading estimate…</div>
                        </div>
                    </div>
                )}
                <Formik<FormValues>
                    innerRef={formikRef}
                    initialValues={{
                        eventId: "",
                        eventName: "",
                        clientId: "",
                        clientName: "",
                        clientPoc: "",
                        dateFrom: "",
                        dateTo: "",
                        fromDateTime: "",
                        toDateTime: "",
                        venue: "",
                        description: "",
                        gst: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setSubmitting(true);
                        try {
                            const v = values as FormValues;
                            // build items payload grouped by category
                            const itemsPayload: Record<string, Array<Record<string, unknown>>> = {};
                            lines.forEach((ln, idx) => {
                                const cat = ln.category || "General";
                                if (!itemsPayload[cat]) itemsPayload[cat] = [];
                                const count =
                                    Number.isFinite(Number(ln.days)) &&
                                    Number.isFinite(Number(ln.sqft))
                                        ? Math.max(1, ln.days * ln.sqft)
                                        : ln.days || 1;
                                itemsPayload[cat].push({
                                    item: ln.item || "Item",
                                    serialNumber: idx + 1,
                                    count,
                                    pricePerItem: ln.rate || 0,
                                    description: ln.specification || undefined,
                                    days: ln.days || undefined,
                                });
                            });

                            const payload = {
                                highlvelRequirement: v.description || "",
                                enquiryDate: v.fromDateTime || v.dateFrom || undefined,
                                fromDate: v.fromDateTime || v.dateFrom || undefined,
                                toDate: v.toDateTime || v.dateTo || undefined,
                                status: "OPEN",
                                venue: v.venue || "",
                                clientPoC: v.clientPoc || "",
                                pocContactNumber: "",
                                enquiryPoC: undefined,
                                client: { id: v.clientId || "" },
                                items: itemsPayload,
                                enquiryId: v.eventId || "",
                                title: v.eventName || undefined,
                            };

                            // send to backend via API proxy
                            const res = await apiRequest("/api/estimates", {
                                method: "POST",
                                body: JSON.stringify(payload),
                            });
                            if (!res.ok) {
                                const txt = await res.text();
                                console.error("Failed to save estimate", res.status, txt);
                                // still call onSave locally so UI shows the checklist
                                onSave({
                                    eventName: v.eventName,
                                    enquiryDate: v.fromDateTime || v.dateFrom || "-",
                                    clientPoc: v.clientPoc || v.clientName || "-",
                                    status: "Not Started",
                                    gst: v.gst || undefined,
                                    items: lines,
                                });
                                setSubmitting(false);
                                return;
                            }

                            // Call onSave to update client-side listing and close modal
                            onSave({
                                eventName: v.eventName,
                                enquiryDate: v.fromDateTime || v.dateFrom || "-",
                                clientPoc: v.clientPoc || v.clientName || "-",
                                status: "Not Started",
                                gst: v.gst || undefined,
                                items: lines,
                            });
                            // close modal on success
                            onClose();
                        } catch (err) {
                            console.error("Error saving estimate", err);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, setFieldValue, values }) => (
                        <Form>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center">
                                        📝
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">Create Checklist</h2>
                                        <p className="text-sm text-gray-600">
                                            Select an event & client to prefill checklist. Other
                                            fields will be locked.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="pt-2 space-y-4">
                                <div>
                                    <Label htmlFor="eventId">Event (Client — Event)</Label>
                                    <select
                                        id="eventId"
                                        name="eventId"
                                        className="mt-1 w-full px-3 py-2 border rounded"
                                        value={values.eventId}
                                        onChange={async e => {
                                            const id = e.target.value;
                                            setFieldValue("eventId", id);
                                            // also update via formikRef if available (ensure immediate UI update)
                                            if (formikRef.current)
                                                formikRef.current.setFieldValue("eventId", id);
                                            // find event and prefill minimal values from /events/names
                                            const ev = events.find(
                                                x => String(x.id) === String(id)
                                            );
                                            if (ev) {
                                                setFieldValue("eventName", ev.eventName || "");
                                                setFieldValue("clientId", ev.clientId || "");
                                                setFieldValue("clientName", ev.clientName || "");
                                                if (formikRef.current) {
                                                    formikRef.current.setFieldValue(
                                                        "eventName",
                                                        ev.eventName || ""
                                                    );
                                                    formikRef.current.setFieldValue(
                                                        "clientId",
                                                        ev.clientId || ""
                                                    );
                                                    formikRef.current.setFieldValue(
                                                        "clientName",
                                                        ev.clientName || ""
                                                    );
                                                }
                                            }

                                            if (!id) return;

                                            // Clear detailed fields and show skeleton immediately
                                            setFieldValue("dateFrom", "");
                                            setFieldValue("dateTo", "");
                                            setFieldValue("fromDateTime", "");
                                            setFieldValue("toDateTime", "");
                                            setFieldValue("venue", "");
                                            setFieldValue("description", "");
                                            setFieldValue("clientPoc", "");
                                            if (formikRef.current) {
                                                formikRef.current.setFieldValue("dateFrom", "");
                                                formikRef.current.setFieldValue("dateTo", "");
                                                formikRef.current.setFieldValue("fromDateTime", "");
                                                formikRef.current.setFieldValue("toDateTime", "");
                                                formikRef.current.setFieldValue("venue", "");
                                                formikRef.current.setFieldValue("description", "");
                                                formikRef.current.setFieldValue("clientPoc", "");
                                            }
                                            setLines([
                                                {
                                                    id: generateId(),
                                                    category: "General",
                                                    item: "Loading...",
                                                    specification: "",
                                                    days: 0,
                                                    sqft: 0,
                                                    rate: 0,
                                                },
                                            ]);

                                            // Fetch detailed estimate for the selected event and prefill artifact lines & other fields
                                            setLoadingEstimate(true);
                                            try {
                                                const res = await apiRequest(
                                                    `/api/events/${encodeURIComponent(id)}/estimate`
                                                );
                                                if (!res.ok) {
                                                    console.warn(
                                                        "Estimate fetch failed",
                                                        res.status
                                                    );
                                                    return;
                                                }
                                                const data = await res.json();

                                                // Prefill date/venue/description/client POC and datetime fields
                                                const from = String(
                                                    data.fromDate ?? data.enquiryDate ?? ""
                                                );
                                                const to = String(data.toDate ?? data.to ?? "");
                                                // date inputs expect YYYY-MM-DD — extract date part if ISO datetime provided
                                                const extractDateOnly = (s: string) => {
                                                    if (!s) return "";
                                                    // if contains T, take left side
                                                    if (s.includes("T")) return s.split("T")[0];
                                                    // if ISO with timezone Z or offset, try to parse
                                                    try {
                                                        const d = new Date(s);
                                                        if (!isNaN(d.getTime()))
                                                            return d.toISOString().slice(0, 10);
                                                    } catch {}
                                                    return s;
                                                };
                                                // extract date-only (unused variable removed)
                                                extractDateOnly(from);
                                                extractDateOnly(to);
                                                // set datetime-local formatted values for dateFrom/dateTo
                                                const dtFrom = formatDateForInput(from);
                                                const dtTo = formatDateForInput(to);
                                                setFieldValue("dateFrom", dtFrom);
                                                setFieldValue("dateTo", dtTo);
                                                // keep full datetime in the datetime fields as ISO
                                                setFieldValue("fromDateTime", from);
                                                setFieldValue("toDateTime", to);
                                                if (formikRef.current) {
                                                    formikRef.current.setFieldValue(
                                                        "dateFrom",
                                                        dtFrom
                                                    );
                                                    formikRef.current.setFieldValue("dateTo", dtTo);
                                                    formikRef.current.setFieldValue(
                                                        "fromDateTime",
                                                        from
                                                    );
                                                    formikRef.current.setFieldValue(
                                                        "toDateTime",
                                                        to
                                                    );
                                                }
                                                setFieldValue("venue", String(data.venue ?? ""));
                                                setFieldValue(
                                                    "description",
                                                    String(
                                                        data.highlvelRequirement ??
                                                            data.description ??
                                                            ""
                                                    )
                                                );
                                                setFieldValue(
                                                    "clientPoc",
                                                    String(data.clientPoC ?? data.enquiryPoC ?? "")
                                                );
                                                // formikRef was already updated above with the correct formatted values;
                                                // avoid overwriting datetime-local fields with raw ISO strings which
                                                // do not display in datetime-local inputs.

                                                // Build lines from data.items (object of category arrays)
                                                const itemsObj = data.items || {};
                                                const newLines: typeof lines = [];
                                                Object.entries(itemsObj).forEach(
                                                    ([category, arr]) => {
                                                        if (!Array.isArray(arr)) return;
                                                        arr.forEach(raw => {
                                                            const it = raw as Record<
                                                                string,
                                                                unknown
                                                            >;
                                                            const name = String(
                                                                it["name"] ?? it["item"] ?? ""
                                                            );
                                                            const qty =
                                                                Number(
                                                                    it["quantity"] ??
                                                                        it["qty"] ??
                                                                        it["days"] ??
                                                                        1
                                                                ) || 1;
                                                            const rate =
                                                                Number(
                                                                    it["rate"] ?? it["price"] ?? 0
                                                                ) || 0;
                                                            const sqft =
                                                                Number(it["sqft"] ?? 1) || 1;
                                                            newLines.push({
                                                                id: generateId(),
                                                                category: category || "General",
                                                                item: name,
                                                                specification: String(
                                                                    it["specification"] ?? ""
                                                                ),
                                                                days: qty,
                                                                sqft,
                                                                rate,
                                                            });
                                                        });
                                                    }
                                                );

                                                if (newLines.length > 0) setLines(newLines);
                                            } catch (err) {
                                                console.error(
                                                    "Failed to fetch estimate for event",
                                                    id,
                                                    err
                                                );
                                            } finally {
                                                setLoadingEstimate(false);
                                            }
                                        }}
                                    >
                                        <option value="">-- Select event --</option>
                                        {loadingEvents ? (
                                            <option>Loading...</option>
                                        ) : (
                                            events.map(ev => {
                                                const clientName =
                                                    typeof ev.clientName === "string"
                                                        ? ev.clientName
                                                        : "";
                                                const label = `${
                                                    clientName ? clientName + " · " : ""
                                                }${ev.eventName || "Untitled"}`;
                                                return (
                                                    <option
                                                        key={String(ev.id)}
                                                        value={String(ev.id)}
                                                    >
                                                        {label}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                    {loadingEstimate && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Loading estimate…
                                        </p>
                                    )}
                                </div>

                                {/* Prefilled, read-only fields (show skeleton while estimate is loading) */}
                                {loadingEstimate ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="h-10 bg-gray-200 rounded" />
                                            <div className="h-10 bg-gray-200 rounded" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="h-10 bg-gray-200 rounded" />
                                            <div className="h-10 bg-gray-200 rounded" />
                                        </div>
                                        <div className="h-10 bg-gray-200 rounded" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="eventName">Event Name</Label>
                                                <Field
                                                    as={Input}
                                                    id="eventName"
                                                    name="eventName"
                                                    placeholder="Event name"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="clientName">Client</Label>
                                                <Field
                                                    as={Input}
                                                    id="clientName"
                                                    name="clientName"
                                                    placeholder="Client"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="dateFrom">From (date & time)</Label>
                                                <Field
                                                    as={Input}
                                                    id="dateFrom"
                                                    name="dateFrom"
                                                    type="datetime-local"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="dateTo">To (date & time)</Label>
                                                <Field
                                                    as={Input}
                                                    id="dateTo"
                                                    name="dateTo"
                                                    type="datetime-local"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fromDateTime">
                                                    From (date & time)
                                                </Label>
                                                <Field
                                                    as={Input}
                                                    id="fromDateTime"
                                                    name="fromDateTime"
                                                    placeholder="From date time"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="toDateTime">To (date & time)</Label>
                                                <Field
                                                    as={Input}
                                                    id="toDateTime"
                                                    name="toDateTime"
                                                    placeholder="To date time"
                                                    className="mt-1"
                                                    disabled
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="clientPoc">Client POC</Label>
                                            <Field
                                                as={Input}
                                                id="clientPoc"
                                                name="clientPoc"
                                                placeholder="Client POC"
                                                className="mt-1"
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="venue">Venue</Label>
                                            <Field
                                                as={Input}
                                                id="venue"
                                                name="venue"
                                                placeholder="Venue"
                                                className="mt-1"
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Field
                                                as="textarea"
                                                id="description"
                                                name="description"
                                                className="mt-1 block w-full border rounded px-3 py-2 text-sm h-24"
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="gst">GST</Label>
                                            <Field
                                                as={Input}
                                                id="gst"
                                                name="gst"
                                                placeholder="GST number"
                                                className="mt-1"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Artifacts required section (editable) */}
                                <section className="space-y-4">
                                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    Artifacts required
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    List the services, equipment, and resources
                                                    needed for this checklist.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setLines(prev => [
                                                        ...prev,
                                                        {
                                                            id: generateId(),
                                                            category:
                                                                prev.length > 0
                                                                    ? prev[prev.length - 1].category
                                                                    : "General",
                                                            item: "New item",
                                                            specification: "",
                                                            days: 1,
                                                            sqft: 1,
                                                            rate: 0,
                                                        },
                                                    ])
                                                }
                                            >
                                                + Add Item
                                            </Button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                                                        <th className="py-3 pr-3 font-medium">
                                                            No
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            Category
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            Item
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            Specification
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            Days
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            SqFt No
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium">
                                                            Rate
                                                        </th>
                                                        <th className="py-3 pr-3 font-medium text-right">
                                                            Total
                                                        </th>
                                                        <th className="py-3 text-right font-medium">
                                                            &nbsp;
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lines.map((line, index) => (
                                                        <tr
                                                            key={line.id}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    value={line.category}
                                                                    onChange={e =>
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          category:
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    value={line.item}
                                                                    onChange={e =>
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          item: e
                                                                                              .target
                                                                                              .value,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    value={line.specification}
                                                                    onChange={e =>
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          specification:
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={line.days}
                                                                    onChange={e => {
                                                                        const v = Number(
                                                                            e.target.value
                                                                        );
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          days: Number.isNaN(
                                                                                              v
                                                                                          )
                                                                                              ? 0
                                                                                              : v,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        );
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={line.sqft}
                                                                    onChange={e => {
                                                                        const v = Number(
                                                                            e.target.value
                                                                        );
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          sqft: Number.isNaN(
                                                                                              v
                                                                                          )
                                                                                              ? 0
                                                                                              : v,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        );
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    step="0.01"
                                                                    value={line.rate}
                                                                    onChange={e => {
                                                                        const v = Number(
                                                                            e.target.value
                                                                        );
                                                                        setLines(prev =>
                                                                            prev.map((l, idx) =>
                                                                                idx === index
                                                                                    ? {
                                                                                          ...l,
                                                                                          rate: Number.isNaN(
                                                                                              v
                                                                                          )
                                                                                              ? 0
                                                                                              : v,
                                                                                      }
                                                                                    : l
                                                                            )
                                                                        );
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="py-3 pr-3 align-middle text-right font-semibold">
                                                                ₹
                                                                {(
                                                                    line.days *
                                                                    line.sqft *
                                                                    line.rate
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td className="py-3 text-right align-middle">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={lines.length === 1}
                                                                    onClick={() =>
                                                                        setLines(prev =>
                                                                            prev.filter(
                                                                                (_, idx) =>
                                                                                    idx !== index
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || loadingEstimate || loadingEvents}
                                    className="bg-blue-600"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : loadingEstimate || loadingEvents
                                        ? "Working..."
                                        : "Save"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
