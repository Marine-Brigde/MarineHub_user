// src/api/Product/reviewApi.ts

import type { BaseResponse, ReviewListResponse } from '@/types/Product/review'
import axiosClient from '../axiosClient'

// ⭐ Lấy danh sách reviews của một product (GET /api/v1/products/{id}/reviews)
export const getProductReviewsApi = async (
    productId: string,
    params?: {
        page?: number
        size?: number
        sortBy?: string
        isAsc?: boolean
    }
) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'createdDate',
        isAsc: params?.isAsc ?? false,
    }

    const response = await axiosClient.get<BaseResponse<ReviewListResponse>>(
        `/v1/products/${productId}/reviews`,
        { params: queryParams }
    )

    return response.data
}

// ⭐ Tạo review cho product (POST /v1/products/{id}/reviews)
export const createProductReviewApi = async (
    id: string,
    data: { rating: number; comment?: string }
) => {
    const response = await axiosClient.post(`/v1/products/${id}/reviews`, data)
    return response.data
}

