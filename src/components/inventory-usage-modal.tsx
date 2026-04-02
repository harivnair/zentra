import React from "react";
import { Modal, ModalBody } from "@/components/ui/modal";
import { InventoryUsage } from "@/types/inventory";
import moment from "moment";

interface InventoryUsageModalProps {
    open: boolean;
    onClose: () => void;
    usage: InventoryUsage[] | null;
    loading: boolean;
}

const InventoryUsageModal: React.FC<InventoryUsageModalProps> = ({
    open,
    onClose,
    usage,
    loading,
}) => {
    return (
        <Modal
            showCloseIcon
            open={open}
            onClose={onClose}
            size="lg"
            title="Inventory Usage History"
        >
            <ModalBody>
                {loading ? (
                    <div className="py-16 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading usage data...</p>
                    </div>
                ) : usage && usage.length > 0 ? (
                    <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                                    <th className="py-3 px-4">Project ID</th>
                                    <th className="py-3 px-4">From Date</th>
                                    <th className="py-3 px-4">To Date</th>
                                    <th className="py-3 px-4 text-right">Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {usage.map((u, index) => (
                                    <tr
                                        key={u.id || index}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {u.projectID || u.projectId || "-"}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {u.fromDate
                                                ? moment(u.fromDate).format("MMM DD, YYYY")
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {u.toDate
                                                ? moment(u.toDate).format("MMM DD, YYYY")
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-foreground">
                                            {u.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="text-5xl mb-4">📦</div>
                        <p className="text-lg font-medium text-foreground">No usage found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            This inventory item has not been used in any projects yet.
                        </p>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default InventoryUsageModal;
