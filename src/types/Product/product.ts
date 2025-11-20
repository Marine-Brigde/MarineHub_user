// src/types/Product/product.ts

export interface Product {
    id: string
    name: string
    description: string
    categoryId: string
    categoryName: string
    isHasVariant: boolean
    supplierId: string
    supplierName: string
    imageUrl: string
    createdDate: string
    lastModifiedDate: string
}

export interface ProductListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: Product[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

export interface GetProductsParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}

