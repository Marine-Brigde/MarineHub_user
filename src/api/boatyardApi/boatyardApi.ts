// src/boatyardApi.ts
import axiosClient from "../axiosClient";
import type { ApiResponse, BoatyardRequest, BoatyardItem, PaginatedResponse } from "@/types/boatyard";

// 🛠️ POST - Tạo mới Boatyard
export const createBoatyardApi = async (
    boatyardData: BoatyardRequest
): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    formData.append("Name", boatyardData.name);
    formData.append("Longitude", boatyardData.longitude);
    formData.append("Latitude", boatyardData.latitude);
    formData.append("FullName", boatyardData.fullName);
    formData.append("Username", boatyardData.username);
    formData.append("Email", boatyardData.email);
    formData.append("Password", boatyardData.password);
    formData.append("Address", boatyardData.address);
    formData.append("PhoneNumber", boatyardData.phoneNumber);
    formData.append("Otp", boatyardData.otp);

    if (boatyardData.avatar) {
        formData.append("Avatar", boatyardData.avatar);
    }

    if (boatyardData.dockSlots?.length > 0) {
        boatyardData.dockSlots.forEach((slot, index) => {
            formData.append(`DockSlots[${index}].name`, slot.name);
            formData.append(`DockSlots[${index}].assignedFrom`, slot.assignedFrom);
            formData.append(`DockSlots[${index}].assignedUntil`, slot.assignedUntil);
        });
    }

    const response = await axiosClient.post<ApiResponse<string>>("/v1/boatyards", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};

// 🧭 GET - Danh sách Boatyards (có phân trang, lọc theo name)
export const getBoatyardsApi = async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    isAsc?: boolean;
    name?: string;
}): Promise<ApiResponse<PaginatedResponse<BoatyardItem>>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<BoatyardItem>>>(
        "/v1/boatyards",
        { params }
    );
    return response.data;
};

// 🔍 GET - Lấy Boatyard theo ID
export const getBoatyardByIdApi = async (id: string): Promise<ApiResponse<BoatyardItem>> => {
    const response = await axiosClient.get<ApiResponse<BoatyardItem>>(`/v1/boatyards/${id}`);
    return response.data;
};

// 👤 GET - Lấy chi tiết Boatyard của người dùng hiện tại
export const getBoatyardDetailApi = async (): Promise<ApiResponse<BoatyardItem>> => {
    const response = await axiosClient.get<ApiResponse<BoatyardItem>>("/v1/boatyards/detail");
    return response.data;
};

// ✏️ PATCH - Cập nhật Boatyard
export const updateBoatyardApi = async (
    data: Partial<Omit<BoatyardRequest, "email" | "username" | "otp">> & { personalIntroduction?: string; phoneNumber?: string }
): Promise<ApiResponse<string>> => {
    const formData = new FormData();

    if (data.name) formData.append("Name", data.name);
    if (data.longitude) formData.append("Longitude", data.longitude);
    if (data.latitude) formData.append("Latitude", data.latitude);
    if (data.fullName) formData.append("FullName", data.fullName);
    if (data.phoneNumber) formData.append("PhoneNumber", data.phoneNumber);
    if (data.password) formData.append("Password", data.password);
    if (data.address) formData.append("Address", data.address);
    if (data.personalIntroduction !== undefined) formData.append("PersonalIntroduction", data.personalIntroduction);
    if (data.avatar) formData.append("Avatar", data.avatar);

    const response = await axiosClient.patch<ApiResponse<string>>("/v1/boatyards", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};
