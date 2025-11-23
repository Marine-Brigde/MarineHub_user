// src/api/Order/orderApi.ts
import axiosClient from '../axiosClient'
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/Order/order'

// Tạo đơn hàng (POST /api/v1/orders)
export const createOrderApi = async (payload: CreateOrderRequest) => {
    const response = await axiosClient.post<CreateOrderResponse>('/v1/orders', payload)
    return response.data
}

export default {
    createOrderApi,
}
