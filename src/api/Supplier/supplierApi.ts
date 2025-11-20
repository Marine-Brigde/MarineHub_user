// src/api/Supplier/supplierApi.ts

import type {
    BaseResponse,
    Supplier,
    SupplierListResponse,
    GetSuppliersParams
} from '@/types/Supplier/supplier'
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

