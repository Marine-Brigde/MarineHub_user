// src/models/Auth.ts

import type { Role } from "@/types/enums"


// 🧠 Đăng nhập
export interface LoginRequest {
    usernameOrEmail: string
    password: string
}

export interface LoginResponseData {
    accountId: string
    username: string
    email: string
    accessToken: string
    role: Role
}

// ✉️ OTP
export interface OtpRequest {
    email: string
}

// 🧾 Đăng ký
export interface RegisterRequest {
    FullName: string
    Username: string
    Email: string
    Password: string
    Address: string
    PhoneNumber: string
    Otp: string
    Avatar?: File | null
}

export interface RegisterResponseData {
    accountId: string
    username: string
    email: string
    accessToken: string
    role: Role
}

// 👤 Profile Data
export interface ProfileData {
    id: string
    fullName: string
    address: string
    phoneNumber: string
    avatarUrl: string
}

// ✏️ Update Profile Request
export interface UpdateProfileRequest {
    fullName?: string
    phoneNumber?: string
    address?: string
    avatar?: File | null
    personalIntroduction?: string
}

// 📦 Profile ApiResponse (đồng bộ với các API khác)
export interface ProfileApiResponse<T> {
    status: number
    message: string
    data: T
}

