// src/components/auth/ProtectedRoute.tsx
"use client"

import { Navigate } from "react-router-dom"
import type { Role } from "@/types/enums"

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRole: Role
}

/**
 * Component bảo vệ route - chỉ cho phép truy cập nếu đã đăng nhập và có role phù hợp
 */
export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
    const token = localStorage.getItem("accessToken")
    const userRole = localStorage.getItem("userRole") as Role | null

    // Nếu chưa đăng nhập, redirect về trang login
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // Nếu role không khớp
    if (userRole !== allowedRole) {
        // Nếu là Supplier, redirect về supplier dashboard
        if (userRole === "Supplier") {
            return <Navigate to="/supplier/dashboard" replace />
        }
        // Nếu là Boatyard nhưng không phải, redirect về login
        return <Navigate to="/login" replace />
    }

    // Nếu đã đăng nhập và role đúng, render children
    return <>{children}</>
}

