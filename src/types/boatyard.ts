// src/types/boatyard.ts
export interface DockSlot {
    name: string;
    assignedFrom: string; // ISO date string
    assignedUntil: string; // ISO date string
}

export interface BoatyardRequest {
    name: string;
    longitude: string;
    latitude: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    address: string;
    phoneNumber: string;
    bankName?: string;
    bankNo?: string;
    otp: string;
    avatar?: File | null;
    dockSlots: DockSlot[];
}

export interface BoatyardItem {
    id: string;
    name: string;
    longitude: string;
    latitude: string;
    accountId: string;
    fullName: string;
    username: string;
    email: string;
    address: string;
    phoneNumber: string;
    avatarUrl: string;
    createdDate: string;
    lastModifiedDate: string;
}

export interface PaginatedResponse<T> {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: T[];
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
