"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { useRequestApi } from "@/hooks/useRequestApi";
import { Button } from "@/components/ui/button";
import { MenuList } from "@/components/ui";
import { MoreVerticalIcon, TrashIcon, FileTextIcon } from "@/components/ui/icons";
import CreateClientModal from "@/components/create-client-modal";
import { PageHeader } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/data-table";
import { MobileCardList } from "@/components/shared/mobile-card-list";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { KeyValueDisplay } from "@/components/ui/key-value-display";
import { Client } from "@/types/client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { downloadCSV } from "@/lib/utils/file";
import { MenuItem } from "@/types";
import { AccessButton } from "@/components/shared/access-button";

const columns = (
    onView: (row: Client) => void,
    onDelete: (row: Client) => void,
): Column<Client>[] => [
    {
        key: "name",
        header: "Name",
        render: row => row.name,
    },
    {
        key: "email",
        header: "Email",
        render: row => row.email,
        className: "text-muted-foreground",
    },
    {
        key: "phone",
        header: "Phone",
        render: row => row.phone,
        className: "text-muted-foreground",
    },
    {
        key: "poc",
        header: "Point of Contact",
        render: row => row.poc,
        className: "text-muted-foreground",
    },
    {
        key: "gst",
        header: "GST",
        render: row => row.gst || "-",
        className: "text-muted-foreground",
    },
    {
        key: "actions",
        header: "",
        className: "text-right",
        render: row => {
            const items: MenuItem[] = [
                {
                    key: "view",
                    label: "View",
                    icon: <FileTextIcon size={16} />,
                    onClick: () => onView(row),
                },
                {
                    key: "delete",
                    label: "Delete",
                    icon: <TrashIcon size={16} />,
                    onClick: () => onDelete(row),
                    className: "text-destructive focus:text-destructive",
                    scopes: ["w:clients"],
                },
            ];

            return (
                <div className="flex justify-center">
                    <MenuList
                        align="end"
                        items={items}
                        trigger={
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVerticalIcon size={16} />
                            </Button>
                        }
                    />
                </div>
            );
        },
    },
];

export default function ClientsPage() {
    const { request, loading } = useRequestApi<Client[]>();
    const [clients, setClients] = useState<Client[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            const res = await request(API_ENDPOINTS.clients.list, {
                method: "GET",
            });
            if (res !== null) {
                setClients(res);
            }
        } catch (_err) {
            toast.error("Failed to fetch clients. Please try again.");
        }
    }, [request]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const handleCreate = () => {
        setModalOpen(true);
    };

    const handleView = (client: Client) => {
        setSelectedClient(client);
        setViewModalOpen(true);
    };

    const handleDeleteClick = (client: Client) => {
        setClientToDelete(client);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!clientToDelete) return;
        try {
            await request(`${API_ENDPOINTS.clients.detail(clientToDelete.id)}`, {
                method: "DELETE",
            });

            toast.success("Client deleted successfully!");
            fetchClients();
        } catch {
            toast.error("Failed to delete client. Please try again.");
        } finally {
            setDeleteModalOpen(false);
            setClientToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setClientToDelete(null);
    };

    const handleExport = () => {
        const exportData = clients.map(client => ({
            Name: client.name,
            Email: client.email,
            Phone: client.phone,
            "Point of Contact": client.poc,
            Address: client.address,
            GST: client.gst,
            PAN: client.pan,
            "GST Certificate": client.gstCertificate,
        }));
        downloadCSV(exportData, "clients-export.csv");
    };

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <PageHeader
                title="Client Management"
                description="Manage all clients and their contact information"
                actions={
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                        <Button variant="ghost" className="w-full sm:w-auto" onClick={handleExport}>
                            Export
                        </Button>
                        <AccessButton
                            scope={["w:clients"]}
                            className="w-full sm:w-auto"
                            onClick={handleCreate}
                        >
                            Create Client
                        </AccessButton>
                    </div>
                }
            />
            <div className="flex flex-col gap-4 sm:gap-1">
                <div className="rounded-lg bg-surface p-4 sm:p-6 shadow-sm hidden md:block">
                    <DataTable
                        columns={columns(handleView, handleDeleteClick)}
                        data={clients}
                        rowKey={row => row.id}
                        emptyMessage="No clients found."
                        hoverable
                        isLoading={loading}
                    />
                </div>
                <MobileCardList
                    className="flex flex-col gap-4 md:hidden"
                    items={clients.map(client => ({ id: client.id, data: client }))}
                    renderHeader={client => (
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-lg">{client.name}</div>
                            <div className="text-xs text-muted-foreground">{client.email}</div>
                        </div>
                    )}
                    renderContent={client => (
                        <>
                            <div className="mb-1">
                                Phone: <span className="font-medium">{client.phone}</span>
                            </div>
                            <div className="mb-1">
                                POC: <span className="font-medium">{client.poc}</span>
                            </div>
                            <div className="mb-1">
                                GST: <span className="font-medium">{client.gst || "-"}</span>
                            </div>
                            <div className="mb-2">
                                Address: <span className="font-medium">{client.address}</span>
                            </div>
                        </>
                    )}
                    renderActions={client => (
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleView(client)}>
                                View
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(client)}
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                    emptyMessage="No clients found."
                    isLoading={loading}
                />
                <CreateClientModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={fetchClients}
                />
                <ConfirmationModal
                    open={deleteModalOpen}
                    onClose={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Client"
                    description={
                        clientToDelete
                            ? `Are you sure you want to delete "${clientToDelete.name}"? This action cannot be undone.`
                            : undefined
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                />
                {/* View Client Modal */}
                <Modal
                    open={viewModalOpen}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedClient(null);
                    }}
                    title="Client Details"
                    size="xl"
                >
                    <ModalBody>
                        {selectedClient && (
                            <KeyValueDisplay
                                items={[
                                    { key: "Name", value: selectedClient.name },
                                    { key: "Email", value: selectedClient.email },
                                    { key: "Phone", value: selectedClient.phone },
                                    { key: "Point of Contact", value: selectedClient.poc },
                                    { key: "Address", value: selectedClient.address },
                                    { key: "GST Number", value: selectedClient.gst || "-" },
                                    { key: "PAN Number", value: selectedClient.pan || "-" },
                                    {
                                        key: "GST Certificate",
                                        value: selectedClient.gstCertificate || "-",
                                    },
                                ]}
                                columns={2}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setViewModalOpen(false);
                                setSelectedClient(null);
                            }}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
}
