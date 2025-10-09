// src/api/authApi.ts

import type { LoginRequest, LoginResponseData, OAuthRequest, OAuthResponseData, OtpRequest, RegisterRequest, RegisterResponseData } from "@/models/Auth"
import type { ApiResponse } from "@/types/api"
import axiosClient from "./axiosClient"


export const authApi = {
    // 🔐 Đăng nhập
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
        const url = '/api/v1/auth/login'
        return axiosClient.post(url, data)
    },

    // ✉️ Gửi OTP
    sendOtp: (data: OtpRequest): Promise<ApiResponse<string>> => {
        const url = '/v1/auth/otp'
        return axiosClient.post(url, data)
    },

    // 📝 Đăng ký (multipart/form-data)
    register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponseData>> => {
        const url = '/v1/auth/register'
        const formData = new FormData()
        formData.append('FullName', data.FullName)
        formData.append('Username', data.Username)
        formData.append('Email', data.Email)
        formData.append('Password', data.Password)
        formData.append('Address', data.Address)
        formData.append('PhoneNumber', data.PhoneNumber)
        formData.append('Otp', data.Otp)
        if (data.Avatar) formData.append('Avatar', data.Avatar)

        return axiosClient.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    // 🌍 OAuth (Google Login)
    oauth: (data: OAuthRequest): Promise<ApiResponse<OAuthResponseData>> => {
        const url = '/v1/auth/oauth'
        return axiosClient.post(url, data)
    }
}
