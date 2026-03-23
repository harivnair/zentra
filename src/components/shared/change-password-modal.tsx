"use client";

import { useState, type FormEvent } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FormikFieldInput } from "../ui/formik-field-input";
import { useRequestApi } from "@/hooks/useRequestApi";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import authUtilities from "@/lib/validations/auth";

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

type ChangePasswordFormValues = {
    oldPassword: string;
    newPassword: string;
};

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
    const { request, loading } = useRequestApi();
    const { user } = useAuth();

    const handleSubmit = async (values: ChangePasswordFormValues) => {
        try {
            const result = await request<ChangePasswordFormValues & { uid: string }>(
                "/api/change-password",
                {
                    method: "PUT",
                    body: { ...values, uid: user?.uid ?? "" },
                }
            );

            if (result !== null) {
                toast.success("Password changed successfully");
                onClose();
            }
        } catch {
        } finally {
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
            title="Change Password"
            description="Enter your current password and choose a new one"
        >
            <Formik
                initialValues={{ oldPassword: "", newPassword: "" }}
                validationSchema={authUtilities.changePasswordSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <ModalBody className="flex flex-col gap-4">
                            <FormikFieldInput
                                name="oldPassword"
                                label="Current Password"
                                type="password"
                                placeholder="Enter current password"
                            />
                            <FormikFieldInput
                                name="newPassword"
                                label="New Password"
                                type="password"
                                placeholder="Enter new password"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={loading} disabled={isSubmitting}>
                                Reset Password
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
