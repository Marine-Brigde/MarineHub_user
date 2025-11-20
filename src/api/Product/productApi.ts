// src/api/Product/productApi.ts

import type {
    BaseResponse,
    Product,
    ProductListResponse,
    GetProductsParams
} from '@/types/Product/product'
import axiosClient from '../axiosClient'

// 📦 Lấy danh sách Products (GET /api/v1/products)
export const getProductsApi = async (params?: GetProductsParams) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
    }

    if (params?.name) {
        queryParams.name = params.name
    }

    const response = await axiosClient.get<BaseResponse<ProductListResponse>>(
        '/v1/products',
        { params: queryParams }
    )

    return response.data
}

// 📦 Lấy chi tiết Product (GET /api/v1/products/{id})
export const getProductByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<Product>>(`/v1/products/${id}`)
    return response.data
}

