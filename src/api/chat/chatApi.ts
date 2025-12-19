// src/api/chat/chatApi.ts

import axios from 'axios'
import type { ChatStatusResponse, ChatResponse, ChatRequest } from '@/types/chat/chat'

// Base URL cho chat API (khác với API chính)
const chatApiClient = axios.create({
    baseURL: import.meta.env.VITE_CHAT_API_BASE_URL || 'https://marine-bridge.harmon.love:18443',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

// GET - Kiểm tra trạng thái API
export const getChatStatusApi = async (): Promise<ChatStatusResponse> => {
    const response = await chatApiClient.get<ChatStatusResponse>('/')
    return response.data
}

// POST - Gửi chat message
export const sendChatMessageApi = async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await chatApiClient.post<ChatResponse>('/chat', data)
    return response.data
}

