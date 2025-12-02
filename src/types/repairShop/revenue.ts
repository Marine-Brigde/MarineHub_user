// src/types/repairShop/revenue.ts

export interface MonthlyRevenue {
    month: string // e.g. "11" or "12"
    year: string
    totalRevenue: number
    netRevenue: number
}

export interface RevenuesResponse {
    status: number
    message: string
    data: MonthlyRevenue[]
}
