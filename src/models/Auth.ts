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


