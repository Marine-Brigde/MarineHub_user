// src/types/api.ts
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: {
        data: T; // Nested data structure
    };
}