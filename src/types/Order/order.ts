// src/types/Order/order.ts

export interface OrderItemRequest {
    productVariantId: string
    quantity: number
    productOptionName?: string
}

export interface CreateOrderRequest {
    shipId: string
    orderItems: OrderItemRequest[]
}

export interface OrderResponseData {
    id: string
    shipId: string
    totalAmount: number
    status: string
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
