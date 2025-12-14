// src/api/modifierGroupApi.ts

import type { DefaultResponse, ModifierGroupListResponse, ModifierGroup, ModifierOption } from '@/types/Modifier/modifier'
import axiosClient from '../axiosClient'


// 🔹 GET /modifier-groups
export const getModifierGroupsApi = (params?: {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}): Promise<ModifierGroupListResponse> => {
    return axiosClient.get('/v1/modifier-groups', {
        params: {
            page: params?.page ?? 1,
            size: params?.size ?? 30,
            sortBy: params?.sortBy,
            isAsc: params?.isAsc ?? false,
            name: params?.name
        }
    }).then((res) => res.data)
}

// 🔹 POST /modifier-groups
export const createModifierGroupApi = (body: {
    name: string
    modifierOptions: { name: string; displayOrder: number }[]
}): Promise<DefaultResponse> => {
    return axiosClient.post('/v1/modifier-groups', body).then((res) => res.data)
}

// 🔹 GET /modifier-groups/{id}
export const getModifierGroupByIdApi = (id: string): Promise<{ status: number; message: string; data: ModifierGroup }> => {
    return axiosClient.get(`/v1/modifier-groups/${id}`).then((res) => res.data)
}

// 🔹 PUT /modifier-groups/{id}
export const updateModifierGroupApi = (id: string, body: { name: string }): Promise<DefaultResponse> => {
    return axiosClient.put(`/v1/modifier-groups/${id}`, body).then((res) => res.data)
}

// 🔹 GET /modifier-groups/{id}/modifier-options
export const getModifierOptionsByGroupApi = (id: string): Promise<{
    status: number
    message: string
    data: ModifierOption[]
}> => {
    return axiosClient.get(`/v1/modifier-groups/${id}/modifier-options`).then((res) => res.data)
}

// 🔹 POST /modifier-groups/{id}/modifier-options
export const addModifierOptionToGroupApi = (
    id: string,
    body: { name: string; displayOrder: number }
): Promise<DefaultResponse> => {
    return axiosClient.post(`/v1/modifier-groups/${id}/modifier-options`, body).then((res) => res.data)
}
