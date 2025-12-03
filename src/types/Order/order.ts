// src/types/Order/order.ts

export interface OrderItemRequest {
    productVariantId: string
    quantity: number
    productOptionName?: string
}

export interface CreateOrderRequest {
    orderItems: OrderItemRequest[]
}

export interface OrderResponseData {
    id: string
    totalAmount: number
    status: string
    shipId?: string | null
    shipName?: string | null
    boatyardId?: string | null
    boatyardName?: string | null
    phone?: string | null
}

export type OrderStatus = 'Pending' | 'Approved' | 'Delivered' | 'Completed' | 'Rejected'

export interface OrderItemResponse {
    productVariantId?: string
    productVariantName?: string
    quantity?: number
    price?: number
    productOptionName?: string
}

// Extended order response for detail endpoints
export interface OrderDetailResponseData extends OrderResponseData {
    shipId?: string | null
    boatyardId?: string
    orderCode?: string
    createdDate?: string
    items?: OrderItemResponse[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

export interface CreateOrderResponse {
    status: number
    message: string
    data: OrderResponseData
}

export interface OrderListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: OrderResponseData[]
}

export interface GetOrdersParams {
    shipId?: string
    status?: string
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    isAsc?: boolean
}

export interface GetOrdersResponse {
    status: number
    message: string
    data: OrderListResponse
}

export interface GetOrderByIdResponse {
    status: number
    message: string
    data: OrderDetailResponseData
}

export interface UpdateOrderRequest {
    status: OrderStatus
    orderItems?: Array<{ id: string; quantity: number }>
}

export interface UpdateOrderResponse {
    status: number
    message: string
    data: string | null
}
