// src/types/Product/supplierProduct.ts

export interface ProductVariant {
    name: string
    price: number
    modifierOptionIds?: string[]
}

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

export interface CreateProductRequest {
    name: string
    description: string
    categoryId: string
    price: number | null
    isHasVariant: boolean
    productVariants: ProductVariant[]
    productImages: File[]
    modifierOptionIds?: string[]
}

export interface UpdateProductRequest {
    name?: string
    description?: string
    categoryId?: string
    price?: number | null
    isHasVariant?: boolean
    productVariants?: ProductVariant[]
    productImages?: File[]
    modifierOptionIds?: string[]
}

export interface GetProductsParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}

