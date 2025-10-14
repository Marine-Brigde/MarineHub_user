export interface BoatyardService {
    id: string;
    typeService: string;
    price: number;
    isActive: boolean;
    createdDate: string;
    lastModifiedDate: string;
}

export interface BoatyardServiceRequest {
    typeService: string;
    price: number;
}

export interface BoatyardServiceUpdateRequest extends BoatyardServiceRequest {
    isActive: boolean;
}

export interface PagedResponse<T> {
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
