export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    full_name: string;
    token: string;
  };
  message?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}
