// src/api/Product/productImageApi.ts

import type {
    BaseResponse,
    UploadProductImageRequest,
    UploadProductImageResponse,
} from '@/types/Product/productImage'
import axiosClient from '../axiosClient'

// 📤 Upload Product Image (POST /api/v1/product-images)
export const uploadProductImageApi = async (data: UploadProductImageRequest) => {
    const formData = new FormData()

    formData.append('ProductId', data.productId)
    formData.append('Image', data.image)
    if (data.sortOrder !== undefined) {
        formData.append('SortOrder', data.sortOrder.toString())
    }

    const response = await axiosClient.post<BaseResponse<UploadProductImageResponse>>(
        '/v1/product-images',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    )

    return response.data
}

// 🗑️ Delete Product Image (DELETE /api/v1/product-images/{id})
export const deleteProductImageApi = async (id: string) => {
    const response = await axiosClient.delete<BaseResponse<string>>(
        `/v1/product-images/${id}`
    )

    return response.data
}
