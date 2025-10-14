import axiosClient from "../axiosClient";
import type {
    ApiResponse,
    PagedResponse,
    BoatyardService,
    BoatyardServiceRequest,
    BoatyardServiceUpdateRequest,
} from "@/types/boatyardService/boatyardService";

// 🟢 Tạo mới dịch vụ
export const createBoatyardServiceApi = async (
    data: BoatyardServiceRequest
): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>("/v1/boatyard-services", data);
    return response.data;
};

// 🟡 Lấy danh sách dịch vụ
export const getBoatyardServicesApi = async (
    page: number = 1,
    size: number = 10,
    sortBy?: string,
    isAsc?: boolean,
    typeService?: string
): Promise<ApiResponse<PagedResponse<BoatyardService>>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = { page, size };

    if (sortBy) params.sortBy = sortBy;
    if (isAsc !== undefined) params.isAsc = isAsc;
    if (typeService) params.typeService = typeService;

    const response = await axiosClient.get<ApiResponse<PagedResponse<BoatyardService>>>(
        "/v1/boatyard-services",
        { params }
    );
    return response.data;
};

// 🟣 Cập nhật dịch vụ theo ID
export const updateBoatyardServiceApi = async (
    id: string,
    data: BoatyardServiceUpdateRequest
): Promise<ApiResponse<string>> => {
    const response = await axiosClient.patch<ApiResponse<string>>(
        `/v1/boatyard-services/${id}`,
        data
    );
    return response.data;
};

// 🔵 Lấy chi tiết dịch vụ theo ID
export const getBoatyardServiceByIdApi = async (
    id: string
): Promise<ApiResponse<BoatyardService>> => {
    const response = await axiosClient.get<ApiResponse<BoatyardService>>(
        `/v1/boatyard-services/${id}`
    );
    return response.data;
};
