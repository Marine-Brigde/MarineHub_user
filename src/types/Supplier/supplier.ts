// src/types/Supplier/supplier.ts

export interface Supplier {
    id: string
    name: string
    longitude: string
    latitude: string
    accountId: string
    fullName: string
    username: string
    email: string
    address: string
    phoneNumber: string
    avatarUrl: string | null
    bankName?: string | null
    bankNo?: string | null
    commissionFeePercent?: number
    createdDate: string
    lastModifiedDate: string | null
}

export interface SupplierListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: Supplier[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

export interface GetSuppliersParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}

