// src/types/category.ts

export interface Category {
    id: string
    name: string
    description: string
    imageUrl: string
    isActive: boolean
    createdDate: string
    lastModifiedDate: string
}

export interface CategoryListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: Category[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

export interface CreateCategoryRequest {
    name: string
    description: string
    image?: File
}

export interface UpdateCategoryRequest {
    name?: string
    description?: string
    image?: File
    isActive?: boolean
}

export interface GetCategoryParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}
