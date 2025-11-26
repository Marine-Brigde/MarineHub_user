export interface SupplierRequest {
    name: string;
    longitude: string;
    latitude: string;
    fullName: string;
    username: string;
    email: string;
    password: string;
    address: string;
    phoneNumber: string;
    avatar?: File | null;
    bankName?: string | null;
    bankNo?: string | null;
    otp: string;
}

export interface SupplierItem {
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
    bankName?: string | null;
    bankNo?: string | null;
    createdDate: string;
    lastModifiedDate: string;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
