// src/types/Product/review.ts

export interface Review {
    id: string
    productId: string
    productName?: string
    userId?: string
    userName?: string
    userAvatar?: string
    rating: number
    comment: string
    createdAt: string
    updatedAt?: string
}

export interface ReviewListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: Review[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

