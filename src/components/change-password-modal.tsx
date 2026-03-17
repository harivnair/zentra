"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { FormikFieldInput } from "@/components/ui/formik-field-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import Modal from "@/components/ui/modal";
import { useRequestApi } from "@/hooks/useRequestApi";
import { useAuth } from "@/context/auth";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ChangePasswordFormValues = {
    oldPassword: string;
    newPassword: string;
};

const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string().min(8, "New password must be at least 8 characters").required("New password is required"),
});

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { request, loading } = useRequestApi();
    const { user } = useAuth();

    const handleSubmit = async (values: ChangePasswordFormValues) => {
        try {
            const result = await request<ChangePasswordFormValues & { id: string }>("/api/change-password", {
                method: "PUT",
                body: { ...values, id: user?.id ?? "" },
            });

            if (result !== null) {
                toast.success("Password changed successfully");
                onClose();
            }
        } catch {
        } finally {
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            header={
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">🔒</div>
                    <div>
                        <h2 className="text-xl font-semibold">Change Password</h2>
                        <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                </div>
            }
        >
            <Formik
                initialValues={{ oldPassword: "", newPassword: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        {/* Current Password */}
                        <FormikFieldInput
                            name="oldPassword"
                            label="Current Password"
                            type="password"
                            placeholder="Enter current password"
                            wrapperClassName="mb-4"
                        />

                        {/* New Password */}
                        <FormikFieldInput
                            name="newPassword"
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                        />

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end mt-6">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <LoadingButton
                                loading={loading}
                                loadingLabel="Changing..."
                                disabled={isSubmitting}
                                className="border-0 bg-[var(--app-primary)] text-white hover:bg-[var(--app-primary-hover)] transition-colors"
                            >
                                Change Password
                            </LoadingButton>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
