// src/types/modifier.ts

export interface ModifierOption {
    id?: string
    name: string
    displayOrder: number
}

export interface ModifierGroup {
    id?: string
    name: string
    createdDate?: string
    lastModifiedDate?: string
    modifierOptions?: ModifierOption[]
}

export interface ModifierGroupListResponse {
    status: number
    message: string
    data: {
        size: number
        page: number
        total: number
        totalPages: number
        items: ModifierGroup[]
    }
}

export interface ModifierOptionResponse {
    status: number
    message: string
    data: ModifierOption
}

export interface DefaultResponse {
    status: number
    message: string
    data: string
}
