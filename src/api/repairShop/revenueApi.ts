// src/api/repairShop/revenueApi.ts
import axiosClient from "../axiosClient"
import type { RevenuesResponse, } from "@/types/repairShop/revenue"

// GET /v1/revenues
export const getRevenuesApi = async (params?: { startDate?: string; endDate?: string }) => {
    const query: Record<string, any> = {}
    if (params?.startDate) query.startDate = params.startDate
    if (params?.endDate) query.endDate = params.endDate

    const response = await axiosClient.get<RevenuesResponse>(`/v1/revenues`, { params: query })
    return response.data
}

export default {
    getRevenuesApi,
}
