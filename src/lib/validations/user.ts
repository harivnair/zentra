import * as Yup from "yup";

export const getValidationSchema = (isEdit: boolean) => {
    return Yup.object({
        name: Yup.string().required("Name is required"),
        uid: Yup.string().required("Username is required"),
        password: isEdit ? Yup.string() : Yup.string().required("Password is required"),
        role: Yup.string().required("Role is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
    });
};
