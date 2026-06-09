import { useMemo } from "react";
import { Receipt, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { Table, Column } from "@/components/ui/table";
import { VendorSummary } from "@/types/event";
import { formatCurrency } from "@/lib/utils";

interface PurchaseOrderSectionProps {
    expanded: boolean;
    onToggle: () => void;
    onAddPurchaseOrder?: () => void;
    onViewPurchaseOrder?: () => void;
    isChecklistCompleted: boolean;
    vendorSummary?: Array<VendorSummary>;
    vendorList?: Array<{ id?: string; name: string }>;
}

export function PurchaseOrderSection({
    expanded,
    // isChecklistCompleted,
    vendorSummary = [],
    vendorList = [],
    onToggle,
    onAddPurchaseOrder,
    onViewPurchaseOrder,
}: PurchaseOrderSectionProps) {
    // const items = useMemo(() => {
    //     return vendorSummary.filter(summary => Boolean(summary.vendor));
    // }, [vendorSummary]);

    const columns: Column<VendorSummary>[] = useMemo(
        () => [
            {
                key: "vendor",
                header: "Vendor",
                render: item =>
                    vendorList.find(v => v.id === item.vendor)?.name ||
                    item.vendor ||
                    "Inventory(Self)",
            },
            {
                key: "amount",
                header: "Amount",
                render: item => (item.totalAmount != null ? formatCurrency(item.totalAmount) : "—"),
            },
            {
                key: "gst",
                header: "GST(%)",
                render: item => (item.gst != null ? item.gst : "—"),
            },
            {
                key: "tds",
                header: "TDS(%)",
                render: item => (item.tds != null ? item.tds : "—"),
            },
            {
                key: "adjustment",
                header: "Adjustment",
                align: "right",
                render: item => (item.adjustedAmt != null ? formatCurrency(item.adjustedAmt) : "—"),
            },
            {
                key: "advance",
                header: "Advance",
                align: "right",
                render: item =>
                    item.advanceAmount != null ? formatCurrency(item.advanceAmount) : "—",
            },
            {
                key: "balance",
                header: "Balance",
                align: "right",
                render: item => (item.balance != null ? formatCurrency(item.balance) : "—"),
                className: "font-medium",
            },
        ],
        [vendorList, vendorSummary],
    );

    return (
        <div className="bg-surface rounded-xl border border-border/20 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-foreground">Purchase Order</h3>
                        <p className="text-[11px] text-muted-foreground">
                            Vendor items and order details
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                    }`}
                />
            </button>
            {expanded && (
                <div className="px-5 pb-5 pt-0 border-t border-border/10 pt-5">
                    {
                        // isChecklistCompleted &&
                        vendorSummary && vendorSummary.length > 0 ? (
                            <Table<VendorSummary>
                                data={vendorSummary}
                                columns={columns}
                                emptyMessage="No purchase orders available for this event."
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                No purchase orders available for this event. Please complete the
                                checklist to add purchase orders.
                            </p>
                        )
                    }
                    {
                        // isChecklistCompleted &&
                        onAddPurchaseOrder && (
                            <div className="flex justify-end mt-2">
                                <Button size="sm" variant="ghost" onClick={onViewPurchaseOrder}>
                                    View
                                </Button>
                                <Button onClick={onAddPurchaseOrder} size="sm" variant="ghost">
                                    Update
                                </Button>
                            </div>
                        )
                    }
                </div>
            )}
        </div>
    );
}
