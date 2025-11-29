import axiosClient from '../axiosClient'

export interface CreatePaymentRequest {
    id: string
    type?: string
    address?: string
}

export interface ApiResponse<T> {
    status: number
    message: string
    data: T
}

export const createPaymentApi = async (payload: CreatePaymentRequest) => {
    const response = await axiosClient.post<ApiResponse<any>>('/v1/payments', payload)
    return response.data
}

export default { createPaymentApi }
