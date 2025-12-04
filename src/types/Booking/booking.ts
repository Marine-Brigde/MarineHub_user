// src/types/Booking/booking.ts

export interface Booking {
    id: string
    shipId?: string | null
    shipName?: string
    shipOwnerName?: string
    shipOwnerPhoneNumber?: string
    dockSlotId?: string
    dockSlotName?: string
    startTime?: string
    endTime?: string
    type?: number
    totalAmount?: number
    status?: string
}

export interface BookingListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: Booking[]
}

export interface BookingService {
    id: string
    typeService?: string
    price?: number
}

export interface BookingDetailResponse {
    id: string
    status: string
    totalAmount: number
    longitude?: string
    latitude?: string
    type?: number
    startTime?: string
    endTime?: string
    shipId?: string
    shipName?: string
    shipOwnerName?: string
    shipOwnerPhoneNumber?: string
    dockSlotId?: string
    dockSlotName?: string
    services?: BookingService[]
}

export interface GetBookingsParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}
