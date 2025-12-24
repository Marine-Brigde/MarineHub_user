// src/api/Product/supplierProductApi.ts

import type {
    BaseResponse,
    Product,
    ProductListResponse,
    GetProductsParams,
    CreateProductRequest,
    UpdateProductRequest
} from '@/types/Product/supplierProduct'
import axiosClient from '../axiosClient'

// 📦 Lấy danh sách Products của supplier hiện tại (GET /api/v1/products)
export const getSupplierProductsApi = async (params?: GetProductsParams) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
    }

    if (params?.name) {
        queryParams.name = params.name
    }
    if (params?.isActive !== undefined) {
        queryParams.isActive = params.isActive
    }
    const response = await axiosClient.get<BaseResponse<ProductListResponse>>(
        '/v1/products',
        { params: queryParams }
    )

    return response.data
}

// 📦 Lấy chi tiết Product (GET /api/v1/products/{id})
export const getSupplierProductByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<Product>>(`/v1/products/${id}`)
    return response.data
}

// 📦 Tạo mới Product (POST /api/v1/products - multipart/form-data)
export const createSupplierProductApi = async (data: CreateProductRequest) => {
    const formData = new FormData()

    formData.append('Name', data.name)
    formData.append('Description', data.description)
    formData.append('CategoryId', data.categoryId)
    if (data.price !== null) {
        formData.append('Price', data.price.toString())
    }
    formData.append('IsHasVariant', data.isHasVariant.toString())

    // Append ProductVariants as array of objects
    // Supports modifierOptionIds per variant when present
    if (data.isHasVariant && data.productVariants && data.productVariants.length > 0) {
        data.productVariants.forEach((variant, index) => {
            formData.append(`ProductVariants[${index}].name`, variant.name)
            formData.append(`ProductVariants[${index}].price`, variant.price.toString())
            if (variant.modifierOptionIds && variant.modifierOptionIds.length > 0) {
                variant.modifierOptionIds.forEach((id, j) => {
                    formData.append(`ProductVariants[${index}].ModifierOptionIds[${j}]`, id)
                })
            }
        })
    }

    // Append ModifierOptionIds at top-level when product has no variants
    if (!data.isHasVariant && data.modifierOptionIds && data.modifierOptionIds.length > 0) {
        data.modifierOptionIds.forEach((id, idx) => {
            formData.append(`ModifierOptionIds[${idx}]`, id)
        })
    }

    // Append ProductImages (multiple files)
    if (data.productImages && data.productImages.length > 0) {
        data.productImages.forEach((image) => {
            formData.append('ProductImages', image)
        })
    }

    // Debug: Log FormData contents
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
        console.log(key, value)
    }

    // Debug: Log full URL
    const fullUrl = `${axiosClient.defaults.baseURL}/v1/products`
    console.log('POST URL:', fullUrl)
    console.log('Request config:', {
        baseURL: axiosClient.defaults.baseURL,
        endpoint: '/v1/products',
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: localStorage.getItem('accessToken') ? 'Bearer ***' : 'None'
        }
    })

    const response = await axiosClient.post<BaseResponse<string>>('/v1/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })

    return response.data
}

// 📦 Cập nhật Product (PATCH /api/v1/products/{id} - multipart/form-data)
export const updateSupplierProductApi = async (id: string, data: UpdateProductRequest) => {
    const formData = new FormData()

    if (data.name) formData.append('Name', data.name)
    if (data.description) formData.append('Description', data.description)
    if (data.categoryId) formData.append('CategoryId', data.categoryId)
    if (data.price !== undefined && data.price !== null) {
        formData.append('Price', data.price.toString())
    }
    if (data.isHasVariant !== undefined) formData.append('IsHasVariant', data.isHasVariant.toString())

    // Append ProductVariants if provided
    if (data.isHasVariant && data.productVariants && data.productVariants.length > 0) {
        data.productVariants.forEach((variant, index) => {
            formData.append(`ProductVariants[${index}].name`, variant.name)
            formData.append(`ProductVariants[${index}].price`, variant.price.toString())
            if (variant.modifierOptionIds && variant.modifierOptionIds.length > 0) {
                variant.modifierOptionIds.forEach((id, j) => {
                    formData.append(`ProductVariants[${index}].ModifierOptionIds[${j}]`, id)
                })
            }
        })
    }

    // Append top-level ModifierOptionIds when updating a non-variant product
    if (data.isHasVariant === false && data.modifierOptionIds && data.modifierOptionIds.length > 0) {
        data.modifierOptionIds.forEach((id, idx) => {
            formData.append(`ModifierOptionIds[${idx}]`, id)
        })
    }

    // Append ProductImages if provided (multiple files)
    if (data.productImages && data.productImages.length > 0) {
        data.productImages.forEach((image) => {
            formData.append('ProductImages', image)
        })
    }

    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
}

// �️ Soft Delete Product (PATCH /api/v1/products/{id} - set IsActive = false)
export const deleteSupplierProductApi = async (id: string) => {
    const formData = new FormData()
    formData.append('IsActive', 'false')
    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}
// ♾️ Restore Product (PATCH /api/v1/products/{id} - set IsActive = true)
export const restoreSupplierProductApi = async (id: string) => {
    const formData = new FormData()
    formData.append('IsActive', 'true')
    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}
