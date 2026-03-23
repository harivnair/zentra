"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui-old/button";
import DropdownMenu from "@/components/ui-old/dropdown-menu";
import CreateVendorModal from "@/components/create-vendor-modal";
import { VendorFormData } from "@/types/vendor";
import { ListSkeleton, TableRowSkeleton } from "@/components/skeleton-loader";
import { showConfirmation } from "@/components/confirmation-toast";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Truck } from "lucide-react";
import { apiRequest } from "@/lib/api/api-client";

type Vendor = {
    id: string;
    name: string;
    billingAddress: string;
    gst: number;
    tds: number;
    gstCertificate?: string;
    phone: string;
    items?: unknown[];
};

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<VendorFormData | null>(null);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const { user } = useAuth();

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest("/api/vendors");
            if (!res.ok) {
                throw new Error(`Failed to fetch vendors: ${res.status}`);
            }
            const data = await res.json();
            setVendors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching vendors:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch vendors");
            setVendors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const vendorCount = useMemo(() => vendors.length, [vendors]);

    const openCreateModal = () => {
        setModalMode("create");
        setEditingVendor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (vendor: Vendor) => {
        setModalMode("edit");
        const editData: VendorFormData = {
            id: vendor.id,
            name: vendor.name,
            billingAddress: vendor.billingAddress,
            gst: vendor.gst,
            tds: vendor.tds,
            gstCertificate: vendor.gstCertificate || "",
            phone: vendor.phone,
            items: vendor.items as VendorFormData["items"],
        };
        setEditingVendor(editData);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        showConfirmation({
            title: "Delete Vendor",
            description:
                "Are you sure you want to delete this vendor? This action cannot be undone.",
            onConfirm: async () => {
                try {
                    const res = await apiRequest(`/api/vendors/${id}`, {
                        method: "DELETE",
                    });

                    if (res.ok) {
                        await fetchVendors();
                        toast.success("Vendor deleted successfully");
                    } else {
                        const errText = await res.text().catch(() => "");
                        throw new Error(`Failed to delete vendor: ${res.status} ${errText}`);
                    }
                } catch (error) {
                    toast.error("Failed to delete vendor");
                    console.error("Error deleting vendor:", error);
                }
            },
        });
    };

    const getDropdownItems = (vendor: Vendor) => [
        {
            label: "Edit",
            icon: "✏️",
            action: () => openEditModal(vendor),
        },
        {
            label: "Delete",
            icon: "🗑️",
            action: () => handleDelete(vendor.id),
            variant: "danger" as const,
        },
    ];

    const handleVendorSaved = async () => {
        await fetchVendors();
    };

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Truck className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            Hi, {user?.name || user?.uid || "User"}!
                        </h2>
                        <p className="text-muted-foreground">
                            You have {vendorCount} {vendorCount === 1 ? "Vendor" : "Vendors"}{" "}
                            registered
                        </p>
                    </div>
                </div>

                <div className="ml-auto w-full sm:w-auto">
                    <Button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                    >
                        + Add New Vendor
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                    {/* Mobile / small screens: stacked cards */}
                    <div className="flex flex-col gap-4 md:hidden">
                        {loading && <ListSkeleton type="cards" items={5} />}
                        {error && <div className="p-4 text-red-600">{error}</div>}
                        {!loading && !error && vendors.length === 0 && (
                            <div className="p-4 text-muted-foreground">
                                No vendors found. Add your first vendor to get started.
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            vendors.map(vendor => (
                                <div key={vendor.id} className="border rounded-md p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium">{vendor.name}</div>
                                        <DropdownMenu items={getDropdownItems(vendor)} />
                                    </div>
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        {vendor.phone}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground truncate">
                                        {vendor.billingAddress}
                                    </div>
                                    <div className="mt-3 flex gap-4 text-sm">
                                        <span>
                                            GST: <span className="font-medium">{vendor.gst}%</span>
                                        </span>
                                        <span>
                                            TDS: <span className="font-medium">{vendor.tds}%</span>
                                        </span>
                                    </div>
                                    {vendor.gstCertificate && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            GST No: {vendor.gstCertificate}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Desktop: table view */}
                    <div className="hidden md:block">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="py-3">Vendor Name</th>
                                    <th className="py-3">Phone</th>
                                    <th className="py-3">Billing Address</th>
                                    <th className="py-3">GST %</th>
                                    <th className="py-3">TDS %</th>
                                    <th className="py-3">GST Certificate</th>
                                    <th className="py-3 text-right">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <TableRowSkeleton rows={8} />}
                                {error && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-red-600">
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && vendors.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No vendors found. Add your first vendor to get started.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    !error &&
                                    vendors.map(vendor => (
                                        <tr key={vendor.id} className="border-t hover:bg-gray-50">
                                            <td className="py-4 font-medium">{vendor.name}</td>
                                            <td className="py-4">{vendor.phone}</td>
                                            <td
                                                className="py-4 max-w-xs truncate"
                                                title={vendor.billingAddress}
                                            >
                                                {vendor.billingAddress}
                                            </td>
                                            <td className="py-4">{vendor.gst}%</td>
                                            <td className="py-4">{vendor.tds}%</td>
                                            <td className="py-4 text-gray-500">
                                                {vendor.gstCertificate || "-"}
                                            </td>
                                            <td className="py-4 text-right">
                                                <DropdownMenu items={getDropdownItems(vendor)} />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Vendor Modal */}
            <CreateVendorModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingVendor(null);
                    setModalMode("create");
                }}
                onSubmit={handleVendorSaved}
                editData={editingVendor}
                mode={modalMode}
            />
        </div>
    );
}
