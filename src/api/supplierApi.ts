import type { ApiResponse, SupplierRequest, SupplierItem } from "@/models/supplier";
import axiosClient from "./axiosClient";

// 🛠️ POST - Tạo mới Supplier
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

// 👤 GET - Lấy chi tiết Supplier của người dùng hiện tại
export const getSupplierDetailApi = async (): Promise<ApiResponse<SupplierItem>> => {
    const response = await axiosClient.get<ApiResponse<SupplierItem>>("/v1/suppliers/detail");
    return response.data;
};

// ✏️ PATCH - Cập nhật Supplier
export const updateSupplierApi = async (
    data: Partial<Omit<SupplierRequest, "email" | "username" | "otp" | "password">> & { personalIntroduction?: string; phoneNumber?: string }
): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    if (data.name) formData.append("Name", data.name);
    if (data.longitude) formData.append("Longitude", data.longitude);
    if (data.latitude) formData.append("Latitude", data.latitude);
    if (data.fullName) formData.append("FullName", data.fullName);
    if (data.phoneNumber) formData.append("PhoneNumber", data.phoneNumber);
    if (data.address) formData.append("Address", data.address);
    if (data.personalIntroduction !== undefined) formData.append("PersonalIntroduction", data.personalIntroduction);
    if (data.avatar) formData.append("Avatar", data.avatar);

    const response = await axiosClient.patch<ApiResponse<string>>("/v1/suppliers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};