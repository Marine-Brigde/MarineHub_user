// src/api/Order/orderApi.ts
import axiosClient from '../axiosClient'
import type {
    CreateOrderRequest,
    CreateOrderResponse,
    GetOrdersParams,
    GetOrdersResponse,
    GetOrderByIdResponse,

} from '@/types/Order/order'

// Tạo đơn hàng (POST /api/v1/orders)
export const createOrderApi = async (payload: CreateOrderRequest) => {
    const response = await axiosClient.post<CreateOrderResponse>('/v1/orders', payload)
    return response.data
}

// Lấy danh sách đơn hàng (GET /api/v1/orders)
export const getOrdersApi = async (params?: GetOrdersParams) => {
    const query: Record<string, any> = {}
    if (params?.shipId) query.ShipId = params.shipId
    if (params?.status) query.Status = params.status
    if (params?.page) query.Page = params.page
    if (params?.pageSize) query.PageSize = params.pageSize
    if (params?.search) query.Search = params.search
    if (params?.sortBy) query.SortBy = params.sortBy
    if (params?.isAsc !== undefined) query.IsAsc = params.isAsc

    const response = await axiosClient.get<GetOrdersResponse>('/v1/orders', { params: query })
    return response.data
}

// Lấy chi tiết đơn hàng (GET /api/v1/orders/{id})
export const getOrderByIdApi = async (id: string) => {
    const response = await axiosClient.get<GetOrderByIdResponse>(`/v1/orders/${id}`)
    return response.data
}

export default {
    createOrderApi,
    getOrdersApi,
    getOrderByIdApi,
}
