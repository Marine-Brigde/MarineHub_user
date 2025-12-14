// src/api/modifierOptionApi.ts
import type { DefaultResponse, ModifierOptionResponse } from '@/types/Modifier/modifier';
import axiosClient from '../axiosClient'



// 🔹 GET /modifier-options/{id}
export const getModifierOptionByIdApi = (id: string): Promise<ModifierOptionResponse> => {
    return axiosClient.get(`/v1/modifier-options/${id}`).then((res) => res.data)
}

// 🔹 PATCH /modifier-options/{id}
export const updateModifierOptionApi = (
    id: string,
    body: { name: string; displayOrder: number }
): Promise<DefaultResponse> => {
    return axiosClient.patch(`/v1/modifier-options/${id}`, body).then((res) => res.data)
}
