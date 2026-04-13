import * as Yup from "yup";

export const getClientValidationSchema = () => {
    return Yup.object({
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        phone: Yup.string().required("Phone number is required"),
        address: Yup.string().required("Address is required"),
        poc: Yup.string().required("Point of contact is required"),
        gst: Yup.string(),
        pan: Yup.string(),
        gstCertificate: Yup.string(),
    });
};
