// src/types/dockSlot.ts

export interface DockSlot {
    id: string
    name: string
    assignedFrom: string | null
    assignedUntil: string | null
    isActive: boolean
    createdDate?: string | null
}

export interface DockSlotListResponse {
    size: number
    page: number
    total: number
    totalPages: number
    items: DockSlot[]
}

export interface BaseResponse<T> {
    status: number
    message: string
    data: T
}

export interface CreateDockSlotRequest {
    name: string
    assignedFrom: string | null
    assignedUntil: string | null
}

export interface UpdateDockSlotRequest {
    name: string
    assignedFrom: string | null
    assignedUntil: string | null
    isActive: boolean
}

export interface GetDockSlotParams {
    page?: number
    size?: number
    sortBy?: string
    isAsc?: boolean
    name?: string
}
