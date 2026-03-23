"use client";

import Image from "next/image";
import { Formik, Form, FormikHelpers } from "formik";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { FormikFieldInput } from "@/components/ui/formik-field-input";
import { useRequestApi } from "@/hooks/useRequestApi";
import { Button, LinkText } from "@/components/ui";
import authUtilities from "@/lib/validations/auth";
import { ForgotPasswordFormValues } from "@/types/auth";

const OTP_LENGTH = 6;

const initialValues: ForgotPasswordFormValues = {
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    showResetForm: false,
    otpVerified: false,
};

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { request } = useRequestApi();

    const handleEmailSubmit = async (
        values: ForgotPasswordFormValues,
        setFieldValue: (field: string, value: boolean) => void
    ) => {
        setLoading(true);
        try {
            const result = await request<{ email: string }>("/api/forgot-password", {
                method: "POST",
                body: { email: values.email },
            });

            if (result !== null) {
                toast.success(
                    "If an account exists for this email, you will receive reset instructions."
                );
                setFieldValue("showResetForm", true);
                setFieldValue("otpVerified", false);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (
        values: ForgotPasswordFormValues,
        setFieldValue: (field: string, value: boolean) => void
    ) => {
        const { otp, email } = values;

        if (!otp || otp.length !== OTP_LENGTH) {
            setFieldValue("otpVerified", false);
            return;
        }

        try {
            const result = await request("/api/verify-otp", {
                method: "POST",
                body: { email, otp },
            });

            if (result) {
                setFieldValue("otpVerified", true);
            } else {
                toast.error("Invalid OTP. Please check the code sent to your email.");
                setFieldValue("otpVerified", false);
            }
        } catch {
            setFieldValue("otpVerified", false);
        }
    };

    const handleResetPassword = async (values: ForgotPasswordFormValues) => {
        setLoading(true);
        try {
            const result = await request<{ email: string; password: string }>(
                "/api/reset-password",
                {
                    method: "POST",
                    body: { email: values.email, password: values.password },
                }
            );

            if (result) {
                toast.success("Password successfully reset. Please log in with your new password.");
                router.push("/login");
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (
        values: ForgotPasswordFormValues,
        { setFieldValue }: FormikHelpers<ForgotPasswordFormValues>
    ) => {
        if (!values.showResetForm) {
            handleEmailSubmit(values, setFieldValue);
        } else if (values.otpVerified) {
            handleResetPassword(values);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={authUtilities.forgotPasswordSchema}
            onSubmit={handleSubmit}
        >
            {({ values, setFieldValue }) => (
                <Form
                    className="mx-auto grid w-full max-w-sm gap-6 rounded-md shadow-xl p-8 animate-fadein backdrop-blur-md"
                    style={{
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        background: "white",
                    }}
                >
                    <div className="grid gap-2 text-center">
                        <div className="flex items-center justify-center">
                            <Image
                                src="/logo.svg"
                                alt="Zentra"
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                        </div>
                        <h1 className="text-2xl font-bold">
                            {!values.showResetForm ? "Find Your Account" : "Reset Password"}
                        </h1>
                        <p className="text-balance text-muted-foreground text-xs">
                            {!values.showResetForm
                                ? "Enter your registered email address to receive password reset instructions"
                                : "Enter the OTP sent to your email and your new password to reset your account."}
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {!values.showResetForm ? (
                            // Email submission form
                            <>
                                <FormikFieldInput
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="Email address"
                                    autoComplete="email"
                                />

                                <Button isLoading={loading}>Continue</Button>
                            </>
                        ) : (
                            // OTP and Password reset form
                            <>
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <FormikFieldInput
                                            name="otp"
                                            label="OTP"
                                            type="text"
                                            placeholder="Enter OTP"
                                            autoComplete="off"
                                            maxLength={OTP_LENGTH}
                                            inputMode="numeric"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const numericValue = e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                );
                                                setFieldValue("otp", numericValue);
                                                handleOtpVerify(
                                                    { ...values, otp: numericValue },
                                                    setFieldValue
                                                );
                                            }}
                                        />
                                        {values.otpVerified && (
                                            <div className="absolute right-3 top-9">
                                                <Check className="h-5 w-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <FormikFieldInput
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />

                                <FormikFieldInput
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />

                                <Button isLoading={loading} disabled={!values.otpVerified}>
                                    Reset Password
                                </Button>
                            </>
                        )}

                        <div className="text-center">
                            <LinkText href="/login">Back to Login</LinkText>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
