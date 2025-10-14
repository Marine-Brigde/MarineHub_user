// src/api/dockSlotApi.ts

import axiosClient from "@/api/axiosClient"
import type {
    BaseResponse,
    CreateDockSlotRequest,
    UpdateDockSlotRequest,
    GetDockSlotParams,
    DockSlotListResponse,
    DockSlot
} from "@/types/dockSlot/dockSlot"

// 🧩 Get list (GET /api/v1/dock-slots)
export const getDockSlotsApi = async (params?: GetDockSlotParams) => {
    const queryParams = {
        page: params?.page ?? 1,
        size: params?.size ?? 30,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
        name: params?.name ?? ''
    }

    const response = await axiosClient.get<BaseResponse<DockSlotListResponse>>(
        '/v1/dock-slots',
        { params: queryParams }
    )

    return response.data
}

// 🧩 Get by ID (GET /api/v1/dock-slots/{id})
export const getDockSlotByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<DockSlot>>(
        `/v1/dock-slots/${id}`
    )
    return response.data
}

// 🧩 Create (POST /api/v1/dock-slots)
export const createDockSlotApi = async (data: CreateDockSlotRequest) => {
    const response = await axiosClient.post<BaseResponse<string>>(
        '/v1/dock-slots',
        data
    )
    return response.data
}

// 🧩 Update (PUT /api/v1/dock-slots/{id})
export const updateDockSlotApi = async (
    id: string,
    data: UpdateDockSlotRequest
) => {
    const response = await axiosClient.put<BaseResponse<string>>(
        `/v1/dock-slots/${id}`,
        data
    )
    return response.data
}
