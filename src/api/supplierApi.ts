import type { ApiResponse, SupplierRequest } from "@/models/supplier";
import axiosClient from "./axiosClient";


export const createSupplierApi = async (
    supplierData: SupplierRequest
): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("Name", supplierData.name);
    formData.append("Longitude", supplierData.longitude);
    formData.append("Latitude", supplierData.latitude);
    formData.append("FullName", supplierData.fullName);
    formData.append("Username", supplierData.username);
    formData.append("Email", supplierData.email);
    formData.append("Password", supplierData.password);
    formData.append("Address", supplierData.address);
    formData.append("PhoneNumber", supplierData.phoneNumber);
    formData.append("Otp", supplierData.otp);

    if (supplierData.avatar) {
        formData.append("Avatar", supplierData.avatar);
    }

    const response = await axiosClient.post<ApiResponse<string>>("/v1/suppliers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};