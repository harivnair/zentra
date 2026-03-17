"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequestApi } from "@/hooks/useRequestApi";
import { Button } from "@/components/ui/button";
import CreateUserModal from "@/components/create-user-modal";

interface User {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    uid: string;
}

export default function UsersPage() {
    const { request } = useRequestApi();
    const [users, setUsers] = useState<User[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await request("/api/users", { method: "GET" });
            if (res !== null) {
                setUsers(res as unknown as User[]);
            }
        } catch {
        } finally {
        }
    }, [request]);

    useEffect(() => {
        console.log("Fetch");

        fetchUsers();
    }, [fetchUsers]);

    const handleCreate = () => {
        console.log("OPEEEEEE");

        setEditUser(null);
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await request(`/users/${id}`, { method: "DELETE" });
            fetchUsers();
        } catch {
            // handle error
        } finally {
        }
    };

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 text-2xl">👤</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <p className="text-muted-foreground">Manage all users and their roles</p>
                    </div>
                </div>
                <div className="ml-auto w-full sm:w-auto">
                    <Button className="w-full sm:w-auto" onClick={handleCreate}>
                        + Create User
                    </Button>
                </div>
            </div>
            <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                <div className="hidden md:block">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="py-3">Name</th>
                                <th className="py-3">Username</th>
                                <th className="py-3">Role</th>
                                <th className="py-3">Email</th>
                                <th className="py-3">Phone Number</th>
                                <th className="py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            {users.map(user => (
                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                    <td className="py-4">{user.name}</td>
                                    <td className="py-4 text-muted-foreground">{user.uid}</td>
                                    <td className="py-4 text-muted-foreground">{user.role}</td>
                                    <td className="py-4 text-muted-foreground">{user.email}</td>
                                    <td className="py-4 text-muted-foreground">{user.phone}</td>
                                    <td className="py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile cards */}
                <div className="flex flex-col gap-4 md:hidden">
                    {users.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">No users found.</div>
                    )}
                    {users.map(user => (
                        <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-lg">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.role}</div>
                            </div>
                            <div className="text-sm mb-1">
                                Username: <span className="font-medium">{user.uid}</span>
                            </div>
                            <div className="text-sm mb-1">
                                Email: <span className="font-medium">{user.email}</span>
                            </div>
                            <div className="text-sm mb-2">
                                Phone: <span className="font-medium">{user.phone}</span>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEdit(user)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <CreateUserModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                user={editUser}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
