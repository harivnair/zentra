"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectPlanningModal } from "@/components/project-planning-modal";
import { EstimateHistoryModal } from "@/components/estimate-history-modal";
import { ExpensesModal } from "@/components/expenses-modal";
import { BillingExpenseModal } from "@/components/billing-expense-modal";
import { ChecklistModal } from "@/components/checklist-modal";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { apiRequest } from "@/lib/api/api-client";
import { EventResponse } from "@/types/event";

// Event status label mapping (read-only)
const STATUS_LABELS: Record<string, string> = {
    ENQUIRY_CREATED: "Enquiry Created",
    ESTIMATE_INPROGRESS: "Estimate In Progress",
    ESTIMATE_UNDER_REVIEW: "Estimate Under Review",
    ESTIMATE_APPROVED: "Estimate Approved",
    PROJECT_INPROGRESS: "Project In Progress",
    PROJECT_SETTLEMENT_IN_PROGRESS: "Project Settlement In Progress",
    PROJECT_COMPLETED: "Project Completed",
};

const STATUS_COLORS: Record<string, string> = {
    ENQUIRY_CREATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    ESTIMATE_INPROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    ESTIMATE_UNDER_REVIEW:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    ESTIMATE_APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    PROJECT_INPROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    PROJECT_SETTLEMENT_IN_PROGRESS:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    PROJECT_COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
};

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [eventTitle, setEventTitle] = useState<string>("Event Details");
    const [eventData, setEventData] = useState<EventResponse | null>(null);
    const [isProjectPlanningModalOpen, setIsProjectPlanningModalOpen] = useState(false);
    const [isEstimateHistoryModalOpen, setIsEstimateHistoryModalOpen] = useState(false);
    const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const fetchPromiseRef = React.useRef<Promise<EventResponse | null> | null>(null);

    const fetchEventData = React.useCallback(async () => {
        try {
            // Reset the fetch promise to force a new fetch
            fetchPromiseRef.current = null;

            const queryParam = String(id).includes("_") ? id : id;
            fetchPromiseRef.current = (async () => {
                const res = await apiRequest(
                    API_ENDPOINTS.events.detail(encodeURIComponent(String(queryParam))),
                );
                if (!res.ok) return null;
                return (await res.json()) as EventResponse;
            })();

            const data = await fetchPromiseRef.current;
            if (!data) return;

            // Store full event data
            setEventData(data);

            // Set event title
            const title = data.title ?? `Event ${data.eventID || id}`;
            setEventTitle(String(title));
        } catch {
            // ignore
        }
    }, [id]);

    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);

    // Calculate totals from categorySummary (provided by backend)
    let totalEstimatedCost = 0;
    const totalExpense = 0;
    const totalIncome = 0;
    let totalPendingAmount = 0;
    let totalBalance = 0;

    if (Array.isArray(eventData?.categorySummary)) {
        eventData?.categorySummary.forEach(cat => {
            totalEstimatedCost += cat.totalAmount || 0;
            totalPendingAmount += cat.advanceAmount || 0;
            totalBalance += cat.balance || 0;
        });
    }

    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 min-h-screen">
            {/* Breadcrumb */}
            <nav className="text-sm text-muted-foreground mb-6">
                Project &gt; <span className="font-medium text-foreground">{eventTitle}</span>
            </nav>

            {/* Top Section: Event Info (Primary) + Client Details (Secondary) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left: Event Primary Details */}
                <div className="lg:col-span-1">
                    {/* Event Name and Details Card */}
                    <div className="surface p-6 h-full">
                        <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-border/50">
                            {eventTitle}
                        </h2>

                        {/* Event Details List */}
                        <div className="space-y-6">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                    Event Name
                                </label>
                                <p className="text-[15px] font-medium leading-tight">
                                    {eventTitle}
                                </p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                    Start Date
                                </label>
                                <p className="text-[15px] font-medium leading-tight">
                                    {eventData?.eventStartDate
                                        ? new Date(eventData.eventStartDate).toLocaleDateString(
                                              "en-IN",
                                              {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              },
                                          )
                                        : "-"}
                                </p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                    End Date
                                </label>
                                <p className="text-[15px] font-medium leading-tight">
                                    {eventData?.eventEndDate
                                        ? new Date(eventData.eventEndDate).toLocaleDateString(
                                              "en-IN",
                                              {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              },
                                          )
                                        : "-"}
                                </p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                    Location
                                </label>
                                <p className="text-[15px] font-medium leading-tight">
                                    {eventData?.location ?? eventData?.venue ?? "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Client Details (Secondary) */}
                <div className="lg:col-span-2">
                    {eventData?.client && (
                        <div className="surface p-6 h-full flex flex-col">
                            <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border/50">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                                    <span className="text-2xl font-bold">
                                        {(eventData.client.name ?? "C")[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 mt-1">
                                    <h3 className="text-xl font-bold">{eventData.client.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Client Details
                                    </p>
                                </div>
                            </div>

                            {/* Client Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Name
                                    </label>
                                    <p className="text-[15px] font-medium leading-tight">
                                        {eventData.client.name ?? "-"}
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Client Name
                                    </label>
                                    <p className="text-[15px] font-medium leading-tight">
                                        {eventData.client.name ?? "-"}
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Contact Person
                                    </label>
                                    <p className="text-[15px] font-medium leading-tight">
                                        {eventData.client.poc ?? "-"}
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Phone
                                    </label>
                                    <p className="text-[15px] font-medium leading-tight">
                                        {eventData.client.phone ?? "-"}
                                    </p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-block text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md ${
                                                STATUS_COLORS[eventData?.status ?? ""] ??
                                                "bg-muted text-muted-foreground border border-border/50"
                                            }`}
                                        >
                                            {STATUS_LABELS[eventData?.status ?? ""] ??
                                                eventData?.status ??
                                                "—"}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                                        Address
                                    </label>
                                    <p className="text-[15px] font-medium leading-tight">
                                        {eventData.client.address ?? eventData.venue ?? "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Estimated Cost */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Estimated Cost
                        </label>
                        <p className="text-2xl font-bold text-gray-900">
                            ₹{totalEstimatedCost.toLocaleString()}
                        </p>
                    </div>

                    {/* Income */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Income
                        </label>
                        <p className="text-2xl font-bold text-gray-900">{totalIncome}</p>
                    </div>

                    {/* Expense */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Expense
                        </label>
                        <p className="text-2xl font-bold text-gray-900">{totalExpense}</p>
                    </div>

                    {/* Pending Amount */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Pending Amount
                        </label>
                        <p className="text-2xl font-bold text-gray-900">
                            ₹{totalPendingAmount.toLocaleString()}
                        </p>
                    </div>

                    {/* Pending Amount (To Pay) */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Pending Amount (To Pay)
                        </label>
                        <p className="text-2xl font-bold text-red-600">
                            ₹{totalBalance.toLocaleString()}
                        </p>
                    </div>

                    {/* Balance Cash In hand */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-500">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">
                            Balance Cash In hand
                        </label>
                        <p className="text-2xl font-bold text-teal-600">
                            ₹{Math.max(0, totalIncome - totalEstimatedCost).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {/* Project Planning */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Estimate creation</h4>
                    <p className="text-xs opacity-90 mb-3">Project Items</p>
                    <button
                        onClick={() => setIsProjectPlanningModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Add Items →
                    </button>
                </div>

                {/* Inventory List */}
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Inventory List</h4>
                    <p className="text-xs opacity-90 mb-3">Report</p>
                    <button
                        onClick={() => router.push("/inventory")}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        View List →
                    </button>
                </div>

                {/* Estimate History */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Estimate History</h4>
                    <p className="text-xs opacity-90 mb-3">Estimates</p>
                    <button
                        onClick={() => setIsEstimateHistoryModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        View History →
                    </button>
                </div>

                {/* Expenses */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Expenses</h4>
                    <p className="text-xs opacity-90 mb-3">Manage Expenses</p>
                    <button
                        onClick={() => setIsExpensesModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Add Expenses →
                    </button>
                </div>

                {/* Billing & Expenses */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-4">
                    <h4 className="font-semibold text-sm mb-2">Billing & Expenses</h4>
                    <p className="text-xs opacity-90 mb-3">Tax & Billing Info</p>
                    <button
                        onClick={() => setIsBillingModalOpen(true)}
                        className="text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Manage Billing →
                    </button>
                </div>

                {/* Event Checklist */}
                <div
                    className={`bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-sm p-4 ${
                        eventData?.status !== "ESTIMATE_APPROVED" ? "opacity-60 saturate-50" : ""
                    }`}
                >
                    <h4 className="font-semibold text-sm mb-2">Event Checklist</h4>
                    <p className="text-xs opacity-90 mb-3">Execution Tasks</p>
                    <button
                        onClick={() => setIsChecklistModalOpen(true)}
                        disabled={eventData?.status !== "ESTIMATE_APPROVED"}
                        className={`text-xs font-medium transition-opacity ${
                            eventData?.status !== "ESTIMATE_APPROVED"
                                ? "cursor-not-allowed opacity-50"
                                : "hover:opacity-90 cursor-pointer"
                        }`}
                    >
                        Manage Checklist →
                    </button>
                </div>
            </div>

            {/* Project Planning Modal */}
            <ProjectPlanningModal
                isOpen={isProjectPlanningModalOpen}
                onClose={() => setIsProjectPlanningModalOpen(false)}
                eventData={eventData || {}}
                onSave={() => {
                    // Reload event data after save
                    setIsProjectPlanningModalOpen(false);
                    fetchEventData();
                }}
            />

            {/* Estimate History Modal */}
            <EstimateHistoryModal
                isOpen={isEstimateHistoryModalOpen}
                onClose={() => setIsEstimateHistoryModalOpen(false)}
                eventTitle={eventTitle}
                eventID={eventData?.eventID || id}
            />

            {/* Expenses Modal */}
            <ExpensesModal
                isOpen={isExpensesModalOpen}
                onClose={() => setIsExpensesModalOpen(false)}
                eventData={eventData || {}}
                onSave={() => {
                    setIsExpensesModalOpen(false);
                    fetchEventData();
                }}
            />

            {/* Billing & Expenses Modal */}
            <BillingExpenseModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
                eventData={eventData || {}}
                onSave={() => {
                    setIsBillingModalOpen(false);
                    fetchEventData();
                }}
            />

            {/* Checklist Modal */}
            <ChecklistModal
                isOpen={isChecklistModalOpen}
                onClose={() => setIsChecklistModalOpen(false)}
                eventData={
                    (eventData as unknown as {
                        [key: string]: any;
                        id?: string;
                        items?: any[];
                        checklist?: any[];
                    }) || {}
                }
                onSave={() => {
                    setIsChecklistModalOpen(false);
                    fetchEventData();
                }}
            />
        </div>
    );
}
