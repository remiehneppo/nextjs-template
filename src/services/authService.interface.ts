import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RefreshRequest 
} from '../types/api';

/**
 * Interface for AuthService
 * Allows swapping implementations for testing
 */
export interface IAuthService {
  /**
   * User login
   */
  login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>>;

  /**
   * User logout
   */
  logout(): Promise<ApiResponse>;

  /**
   * Refresh access token
   */
  refreshToken(refreshRequest: RefreshRequest): Promise<ApiResponse<LoginResponse>>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get current access token
   */
  getAccessToken(): string | null;
}
