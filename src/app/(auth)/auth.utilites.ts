import * as Yup from "yup";

const forgotPasswordSchema = Yup.object({
    email: Yup.string().when("showResetForm", {
        is: true,
        then: schema => schema.optional(),
        otherwise: schema => schema.required("Email is required").email("Please enter a valid email address"),
    }),
    otp: Yup.string().when("showResetForm", {
        is: false,
        then: schema => schema.optional(),
        otherwise: schema => schema.required("OTP is required").min(4, "OTP must be at least 4 characters"),
    }),
    password: Yup.string().when("showResetForm", {
        is: false,
        then: schema => schema.optional(),
        otherwise: schema =>
            schema.when("otp", {
                is: (otp: string) => otp && otp.length >= 4,
                then: schema =>
                    schema.required("Password is required").min(8, "Password must be at least 8 characters"),
                otherwise: schema => schema.optional(),
            }),
    }),
    confirmPassword: Yup.string().when("showResetForm", {
        is: false,
        then: schema => schema.optional(),
        otherwise: schema =>
            schema.when("password", {
                is: (password: string) => password && password.length > 0,
                then: schema =>
                    schema
                        .required("Confirm Password is required")
                        .oneOf([Yup.ref("password")], "Passwords must match"),
                otherwise: schema => schema.optional(),
            }),
    }),
    showResetForm: Yup.boolean(),
    otpVerified: Yup.boolean(),
});

const authUtilities = {
    forgotPasswordSchema,
};

export default authUtilities;
