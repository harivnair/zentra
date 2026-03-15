import * as Yup from "yup"

const forgotPasswordSchema = Yup.object({
    email: Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address"),
    otp: Yup.string()
        .when("email", {
            is: (email: string) => email && email.length > 0,
            then: (schema) => schema.required("OTP is required").min(4, "OTP must be at least 4 characters"),
            otherwise: (schema) => schema.optional(),
        }),
    password: Yup.string()
        .when("otp", {
            is: (otp: string) => otp && otp.length > 0,
            then: (schema) => schema.required("Password is required").min(8, "Password must be at least 8 characters"),
            otherwise: (schema) => schema.optional(),
        }),
    confirmPassword: Yup.string()
        .when("password", {
            is: (password: string) => password && password.length > 0,
            then: (schema) => schema
                .required("Confirm Password is required")
                .oneOf([Yup.ref("password")], "Passwords must match"),
            otherwise: (schema) => schema.optional(),
        }),
})

const authUtilities = {
    forgotPasswordSchema,
}

export default authUtilities
