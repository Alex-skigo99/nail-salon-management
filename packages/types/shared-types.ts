// Shared TypeScript interfaces and types

// Example interface for a User
export interface User {
    id: number;
    name: string;
    email: string;
}

// Example interface for a Service
export interface Service {
    id: number;
    name: string;
    price: number;
}

// Example type for a Response
export type ApiResponse<T> = {
    status: string;
    data: T;
    message?: string;
};
