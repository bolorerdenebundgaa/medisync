export interface Client {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientSearchResponse {
    success: boolean;
    data: Client[];
}

export interface ClientResponse {
    success: boolean;
    data: Client;
}

export interface ClientCreateRequest {
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface ClientUpdateRequest {
    id: string;
    updates: Partial<Client>;
}
