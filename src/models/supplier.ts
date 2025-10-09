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
    otp: string;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}
