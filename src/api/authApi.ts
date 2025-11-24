// src/api/authApi.ts

import type { LoginRequest, LoginResponseData, OtpRequest, RegisterRequest, RegisterResponseData, ProfileData, UpdateProfileRequest, ProfileApiResponse } from "@/models/Auth"
import type { ApiResponse } from "@/types/api"
import axiosClient from "./axiosClient"


export const authApi = {
    // 🔐 Đăng nhập
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponseData>> => {
        const url = '/v1/auth/login'
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
}

// 👤 GET - Lấy thông tin profile của người dùng hiện tại
export const getProfileApi = async (): Promise<ProfileApiResponse<ProfileData>> => {
    const response = await axiosClient.get<ProfileApiResponse<ProfileData>>("/v1/auth/profile")
    return response.data
}

// ✏️ PATCH - Cập nhật profile
export const updateProfileApi = async (
    data: UpdateProfileRequest
): Promise<ProfileApiResponse<string>> => {
    const formData = new FormData()

    if (data.fullName) formData.append("FullName", data.fullName)
    if (data.phoneNumber) formData.append("PhoneNumber", data.phoneNumber)
    if (data.address) formData.append("Address", data.address)
    if (data.personalIntroduction !== undefined) formData.append("PersonalIntroduction", data.personalIntroduction)
    if (data.avatar) formData.append("Avatar", data.avatar)

    const response = await axiosClient.patch<ProfileApiResponse<string>>("/v1/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })

    return response.data
}

