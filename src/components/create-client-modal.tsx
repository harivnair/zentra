import { Formik, Form } from "formik";

import { FormikFieldInput } from "@/components/ui/formik-field-input";
import { useRequestApi } from "@/hooks/useRequestApi";
import { Modal, ModalFooter, ModalBody } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { getClientValidationSchema } from "@/lib/validations/client";
import { ClientFormData } from "@/types/client";
import { clientFormInitialValues } from "@/constants/client";
import { API_ENDPOINTS } from "@/lib/api/endpoint";
import { toast } from "sonner";

interface CreateClientModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateClientModal({ open, onClose, onSuccess }: CreateClientModalProps) {
    const { request, loading, error } = useRequestApi();

    const handleSubmit = async (
        values: ClientFormData,
        { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
    ) => {
        try {
            const result = await request(API_ENDPOINTS.clients.list, {
                method: "POST",
                body: values,
            });

            if (result === null) {
                toast.error(`Failed to create client. Please try again. ${error}`);
                return;
            }

            if (onSuccess) onSuccess();
            toast.success("Client created successfully!");
            onClose();
        } catch {
            toast.error("Failed to create client. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const validationSchema = getClientValidationSchema();

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create Client"
            size="lg"
            description="Create a new client profile with contact and business details."
        >
            <Formik
                initialValues={clientFormInitialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
                validateOnMount={false}
            >
                {() => (
                    <Form className="grid gap-3">
                        <ModalBody className="grid gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormikFieldInput
                                    name="name"
                                    label="Name"
                                    placeholder="Client Name"
                                />
                                <FormikFieldInput
                                    name="poc"
                                    label="Point of Contact"
                                    placeholder="POC Name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormikFieldInput
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="Email"
                                />
                                <FormikFieldInput
                                    name="phone"
                                    label="Phone Number"
                                    placeholder="Phone Number"
                                />
                            </div>

                            <FormikFieldInput
                                name="address"
                                label="Address"
                                placeholder="Full Address"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormikFieldInput
                                    name="gst"
                                    label="GST Number"
                                    placeholder="GST Number"
                                />
                                <FormikFieldInput
                                    name="pan"
                                    label="PAN Number"
                                    placeholder="PAN Number"
                                />
                            </div>
                            <FormikFieldInput
                                name="gstCertificate"
                                label="GST Certificate"
                                placeholder="GST Certificate URL/Number"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button isLoading={loading} type="submit">
                                Create
                            </Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
