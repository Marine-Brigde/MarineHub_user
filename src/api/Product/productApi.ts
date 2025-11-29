// src/api/Product/productApi.ts

import type {
    BaseResponse,
    Product,
    ProductListResponse,
    GetProductsParams,
    ProductVariant,
} from '@/types/Product/product'
import axiosClient from '../axiosClient'

// 📦 Lấy danh sách Products (GET /api/v1/products)
export const getProductsApi = async (params?: GetProductsParams) => {
    const queryParams: Record<string, any> = {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
    }

    if (params?.name) {
        queryParams.name = params.name
    }

    const response = await axiosClient.get<BaseResponse<ProductListResponse>>(
        '/v1/products',
        { params: queryParams }
    )

    return response.data
}

// 📦 Lấy chi tiết Product (GET /api/v1/products/{id})
export const getProductByIdApi = async (id: string) => {
    // Fetch raw response (backend may return Price at product-level or ProductVariants)
    const response = await axiosClient.get<BaseResponse<any>>(`/v1/products/${id}`)

    // Normalize data so that callers always get Product.productVariants as an array
    const raw = response.data?.data || {}
    const product: Product = {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        categoryId: raw.categoryId,
        categoryName: raw.categoryName,
        isHasVariant: !!raw.isHasVariant,
        supplierId: raw.supplierId,
        supplierName: raw.supplierName,
        imageUrl: raw.imageUrl || (raw.productImages && raw.productImages[0]?.imageUrl) || '',
        productImages: raw.productImages,
        productVariants: Array.isArray(raw.productVariants) ? raw.productVariants : [],
        createdDate: raw.createdDate,
        lastModifiedDate: raw.lastModifiedDate,
    }

    // If backend stored price at product level (when isHasVariant === false)
    // create a synthetic single variant so UI code can always treat variants uniformly.
    if ((!product.productVariants || product.productVariants.length === 0) && raw.price !== undefined) {
        const v: ProductVariant = {
            id: raw.id ? `${raw.id}-variant` : 'variant-0',
            name: raw.name || 'Mặc định',
            price: Number(raw.price) || 0,
        }
        product.productVariants = [v]
    }

    // Return typed base response with normalized product
    const out: BaseResponse<Product> = {
        status: response.data.status,
        message: response.data.message,
        data: product,
    }

    return out
}

// ✏️ PATCH - Cập nhật Product (multipart/form-data)
export const updateProductApi = async (id: string, data: {
    name?: string
    description?: string
    categoryId?: string
    // optional files
    images?: File[]
}) => {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('Name', data.name)
    if (data.description !== undefined) formData.append('Description', data.description)
    if (data.categoryId !== undefined) formData.append('CategoryId', data.categoryId)
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach((f) => formData.append('Images', f))
    }

    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}

// ➕ POST - Thêm product variant cho product (JSON)
export const createProductVariantApi = async (productId: string, payload: { name: string; price: number }) => {
    const response = await axiosClient.post<BaseResponse<string>>(`/v1/products/${productId}/product-variants`, payload)
    return response.data
}

// ✏️ PATCH - Cập nhật ProductVariant (application/json)
export const updateProductVariantApi = async (variantId: string, payload: { name?: string; price?: number }) => {
    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/product-variants/${variantId}`, payload)
    return response.data
}

