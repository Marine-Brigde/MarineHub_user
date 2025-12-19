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

export interface ChatBoatyard {
    [key: string]: any
}

export interface ChatSupplier {
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
}

