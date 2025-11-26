// src/api/booking/bookingApi.ts

import axiosClient from '@/api/axiosClient'
import type { BaseResponse, BookingListResponse, GetBookingsParams, BookingDetailResponse } from '@/types/Booking/booking'

export const getBookingsApi = async (params?: GetBookingsParams) => {
    const query: Record<string, any> = {}
    if (params?.page) query.page = params.page
    if (params?.size) query.size = params.size
    if (params?.sortBy) query.sortBy = params.sortBy
    if (params?.isAsc !== undefined) query.isAsc = params.isAsc

    const response = await axiosClient.get<BaseResponse<BookingListResponse>>('/v1/bookings', { params: query })
    return response.data
}

export const getBookingByIdApi = async (id: string) => {
    const response = await axiosClient.get<BaseResponse<BookingDetailResponse>>(`/v1/bookings/${id}`)
    return response.data
}

export default {
    getBookingsApi,
    getBookingByIdApi,
}
