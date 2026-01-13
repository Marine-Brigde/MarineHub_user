// src/types/Product/productImage.ts

export interface UploadProductImageRequest {
    productId: string
    image: File
    sortOrder?: number
}

export interface UploadProductImageResponse {
    id: string
    productId: string
    imageUrl: string
    sortOrder: number
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}
