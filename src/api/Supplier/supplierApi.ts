// src/api/Supplier/supplierApi.ts

import type {
    BaseResponse,
    Supplier,
    SupplierListResponse,
    GetSuppliersParams
} from '@/types/Supplier/supplier'
import type { ProductListResponse } from '@/types/Product/product'
import axiosClient from '../axiosClient'

// 🏢 Lấy danh sách Suppliers (GET /api/v1/suppliers)
export const getSuppliersApi = async (params?: GetSuppliersParams) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 12,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
    }

    if (params?.name) {
        queryParams.name = params.name
    }

    const response = await axiosClient.get<BaseResponse<SupplierListResponse>>(
        '/v1/suppliers',
        { params: queryParams }
    )

    return response.data
}

// 🏢 Lấy chi tiết Supplier (GET /api/v1/suppliers/{id})
export const getSupplierByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<Supplier>>(`/v1/suppliers/${id}`)
    return response.data
}

// 🏢 Lấy danh sách sản phẩm theo supplier (GET /api/v1/suppliers/{id}/products)
export const getSupplierProductsByIdApi = async (
    supplierId: string,
    params?: { page?: number; size?: number; sortBy?: string; isAsc?: boolean; name?: string; isActive?: boolean }
) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'createdDate',
        isAsc: params?.isAsc ?? false,
    }

    if (params?.name) {
        queryParams.name = params.name
    }

    if (params?.isActive !== undefined) {
        queryParams.isActive = params.isActive
    }

    const response = await axiosClient.get<BaseResponse<ProductListResponse>>(
        `/v1/suppliers/${supplierId}/products`,
        { params: queryParams }
    )
    return response.data
}

