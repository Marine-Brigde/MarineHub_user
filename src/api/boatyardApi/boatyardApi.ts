import type { ApiResponse, BoatyardRequest } from "@/types/boatyard";
import axiosClient from "../axiosClient";

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

    // 🧠 DockSlots là mảng => cần stringify từng phần tử
    if (boatyardData.dockSlots && boatyardData.dockSlots.length > 0) {
        boatyardData.dockSlots.forEach((slot, index) => {
            formData.append(`DockSlots[${index}].name`, slot.name);
            formData.append(`DockSlots[${index}].assignedFrom`, slot.assignedFrom);
            formData.append(`DockSlots[${index}].assignedUntil`, slot.assignedUntil);
        });
    }

    const response = await axiosClient.post<ApiResponse<string>>("v1/boatyards", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};
