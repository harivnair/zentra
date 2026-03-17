import { useState } from "react";
import { Formik, Form } from "formik";
import { FormikFieldInput } from "@/components/ui/formik-field-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRequestApi } from "@/hooks/useRequestApi";
import Modal from "@/components/ui/modal";
import { Button } from "./ui/button";
import * as Yup from "yup";

interface User {
    id?: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    uid: string;
    password?: string;
}

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    user?: User | null;
    onSuccess?: () => void;
}

const initialValues: User = {
    name: "",
    role: "",
    phone: "",
    email: "",
    uid: "",
    password: "",
};

const roleOptions = [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Customer", value: "customer" },
];

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    uid: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    role: Yup.string().oneOf(["admin", "user", "customer"]).required("Role is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
});

export default function CreateUserModal({ open, onClose, user, onSuccess }: CreateUserModalProps) {
    const { request } = useRequestApi();
    const [loading, setLoading] = useState(false);

    // Use Modal component for consistent modal UI

    const handleSubmit = async (values: User) => {
        setLoading(true);
        try {
            if (user && user.id) {
                await request(`/users/${user.id}`, {
                    method: "PUT",
                    body: values,
                });
            } else {
                await request("/users", {
                    method: "POST",
                    body: values,
                });
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            header={<h2 className="text-xl font-bold">{user ? "Edit User" : "Create User"}</h2>}
            showCloseButton
        >
            <Formik
                initialValues={user ? { ...user, password: "" } : initialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form className="grid gap-4">
                        <FormikFieldInput name="name" label="Name" placeholder="Full Name" />
                        <FormikFieldInput name="uid" label="Username" placeholder="Username" />
                        <FormikFieldInput name="password" label="Password" type="text" placeholder="Password" />
                        <div>
                            <label className="text-sm mb-1 block" htmlFor="role">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="w-full border rounded-md px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                value={values.role}
                                onChange={e => setFieldValue("role", e.target.value)}
                            >
                                <option value="">Select role</option>
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {touched.role && errors.role && (
                                <div className="text-xs text-red-500 mt-1">{errors.role}</div>
                            )}
                        </div>
                        <FormikFieldInput name="email" label="Email" type="email" placeholder="Email" />
                        <FormikFieldInput name="phone" label="Phone Number" placeholder="Phone Number" />
                        <div className="flex flex-row items-center gap-2 justify-end mt-6">
                            <Button type="button" variant="outline" className="min-w-[90px]" onClick={onClose}>
                                Cancel
                            </Button>
                            <LoadingButton
                                className="min-w-[90px] border-0 bg-[var(--app-primary)] text-white hover:bg-[var(--app-primary-hover)] transition-colors"
                                loading={loading}
                                loadingLabel={user ? "Saving..." : "Creating..."}
                            >
                                {user ? "Save" : "Create"}
                            </LoadingButton>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
