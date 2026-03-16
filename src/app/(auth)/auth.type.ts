export type ForgotPasswordFormValues = {
    email: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
    showResetForm?: boolean;
    otpVerified?: boolean;
};
