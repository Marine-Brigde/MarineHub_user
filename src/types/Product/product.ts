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
    productImages?: ProductImage[]
    productVariants?: ProductVariant[]
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

export interface ProductImage {
    id: string
    imageUrl: string
    sortOrder?: number | null
}

export interface ProductVariant {
    id: string
    name: string
    price: number
}

