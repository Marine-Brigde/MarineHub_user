// src/api/categoryApi.ts



import type {
    BaseResponse,
    Category,
    CategoryListResponse,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    GetCategoryParams
} from '@/types/Category/category'
import axiosClient from '../axiosClient'



// 🧩 Lấy danh sách Category (GET /api/v1/categories)
export const getCategoriesApi = async (params?: GetCategoryParams) => {
    const queryParams = {
        page: params?.page ?? 1,
        size: params?.size ?? 30,
        sortBy: params?.sortBy ?? 'name',
        isAsc: params?.isAsc ?? false,
        name: params?.name ?? ''
    }

    const response = await axiosClient.get<BaseResponse<CategoryListResponse>>(
        '/v1/categories',
        { params: queryParams }
    )

    return response.data
}

// 🧩 Lấy chi tiết Category (GET /api/v1/categories/{id})
export const getCategoryByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<Category>>(`/v1/categories/${id}`)
    return response.data
}

// 🧩 Tạo mới Category (POST /api/v1/categories - multipart/form-data)
export const createCategoryApi = async (data: CreateCategoryRequest) => {
    const formData = new FormData()
    formData.append('Name', data.name)
    formData.append('Description', data.description)
    if (data.image) formData.append('Image', data.image)

    const response = await axiosClient.post<BaseResponse<string>>('/v1/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
}

// 🧩 Cập nhật Category (PATCH /api/v1/categories/{id} - multipart/form-data)
export const updateCategoryApi = async (id: string, data: UpdateCategoryRequest) => {
    const formData = new FormData()
    if (data.name) formData.append('Name', data.name)
    if (data.description) formData.append('Description', data.description)
    if (data.image) formData.append('Image', data.image)
    if (data.isActive !== undefined) formData.append('IsActive', String(data.isActive))

    const response = await axiosClient.patch<BaseResponse<string>>(`/v1/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
}
