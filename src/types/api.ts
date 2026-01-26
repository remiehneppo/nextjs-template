// API Response Types

export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> {
  status: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: number;
  updated_at: number;
}

export interface UserProfileUpdate {
  full_name?: string;
  email?: string;
}

export interface UserChangePassword {
  old_password: string;
  new_password: string;
}
