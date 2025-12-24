// src/types/chat/chat.ts

export interface ChatStatusResponse {
    status: string
}

export interface ChatProduct {
    Id: string
    Name: string
    Description: string
    IsHasVariant: boolean
}

export interface ChatSupplier {
    Id: string
    Name: string
    Longitude: string
    Latitude: string
    BankName?: string | null
    BankNo?: string | null
    distance_km: number
}

export interface ChatBoatyard {
    [key: string]: any
}

export interface ChatResponse {
    promptResponse: string
    boatyards: ChatBoatyard[] | null
    products: ChatProduct[] | null
    suppliers: ChatSupplier[] | null
    timestamp: string
}

export interface ChatRequest {
    prompt: string
    longitude: number
    latitude: number
}

