import type { IAuthService } from './authService.interface';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RefreshRequest 
} from '../types/api';

/**
 * Mock credentials for testing
 */
export interface MockUser {
  username: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Mock AuthService for testing purposes
 * Allows configuring responses and simulating various scenarios
 */
export class MockAuthService implements IAuthService {
  private _isAuthenticated = false;
  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private readonly accessTokenKey = 'mock_access_token';
  private readonly refreshTokenKey = 'mock_refresh_token';

  constructor() {
    if (typeof window !== 'undefined') {
      this._accessToken = localStorage.getItem(this.accessTokenKey);
      this._refreshToken = localStorage.getItem(this.refreshTokenKey);
      this._isAuthenticated = !!this._accessToken;
    }
  }
  
  // Configurable mock users
  private mockUsers: MockUser[] = [
    {
      username: 'testuser',
      password: 'testpass',
      accessToken: 'mock_access_token_123',
      refreshToken: 'mock_refresh_token_456'
    },
    {
      username: 'admin',
      password: 'admin123',
      accessToken: 'mock_admin_access_token',
      refreshToken: 'mock_admin_refresh_token'
    }
  ];

  // Configurable delays to simulate network latency
  private delay = 100;

  // Configurable error scenarios
  private shouldFailLogin = false;
  private shouldFailLogout = false;
  private shouldFailRefresh = false;
  private customError: string | null = null;

  /**
   * Configure mock behavior
   */
  configure(options: {
    delay?: number;
    shouldFailLogin?: boolean;
    shouldFailLogout?: boolean;
    shouldFailRefresh?: boolean;
    customError?: string;
    mockUsers?: MockUser[];
  }): this {
    if (options.delay !== undefined) this.delay = options.delay;
    if (options.shouldFailLogin !== undefined) this.shouldFailLogin = options.shouldFailLogin;
    if (options.shouldFailLogout !== undefined) this.shouldFailLogout = options.shouldFailLogout;
    if (options.shouldFailRefresh !== undefined) this.shouldFailRefresh = options.shouldFailRefresh;
    if (options.customError !== undefined) this.customError = options.customError;
    if (options.mockUsers !== undefined) this.mockUsers = options.mockUsers;
    return this;
  }

  /**
   * Reset mock state
   */
  reset(): this {
    this._isAuthenticated = false;
    this._accessToken = null;
    this._refreshToken = null;
    this.clearStoredTokens();
    this.shouldFailLogin = false;
    this.shouldFailLogout = false;
    this.shouldFailRefresh = false;
    this.customError = null;
    return this;
  }

  /**
   * Add a mock user
   */
  addMockUser(user: MockUser): this {
    this.mockUsers.push(user);
    return this;
  }

  /**
   * Simulate async delay
   */
  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    await this.simulateDelay();

    if (this.shouldFailLogin) {
      return {
        status: false,
        message: this.customError || 'Mock login failed'
      };
    }

    const user = this.mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      return {
        status: false,
        message: 'Invalid credentials'
      };
    }

    this._isAuthenticated = true;
    this._accessToken = user.accessToken;
    this._refreshToken = user.refreshToken;
    this.storeTokens(user.accessToken, user.refreshToken);

    return {
      status: true,
      message: 'Login successful',
      data: {
        access_token: user.accessToken,
        refresh_token: user.refreshToken
      }
    };
  }

  async logout(): Promise<ApiResponse> {
    await this.simulateDelay();

    if (this.shouldFailLogout) {
      return {
        status: false,
        message: this.customError || 'Mock logout failed'
      };
    }

    this._isAuthenticated = false;
    this._accessToken = null;
    this._refreshToken = null;
    this.clearStoredTokens();

    return {
      status: true,
      message: 'Logout successful'
    };
  }

  async refreshToken(refreshRequest: RefreshRequest): Promise<ApiResponse<LoginResponse>> {
    await this.simulateDelay();

    if (this.shouldFailRefresh) {
      return {
        status: false,
        message: this.customError || 'Mock refresh failed'
      };
    }

    const user = this.mockUsers.find(u => u.refreshToken === refreshRequest.refresh_token);

    if (!user) {
      return {
        status: false,
        message: 'Invalid refresh token'
      };
    }

    // Generate new tokens
    const newAccessToken = `${user.accessToken}_refreshed_${Date.now()}`;
    const newRefreshToken = `${user.refreshToken}_refreshed_${Date.now()}`;

    this._accessToken = newAccessToken;
    this._refreshToken = newRefreshToken;
    this.storeTokens(newAccessToken, newRefreshToken);

    return {
      status: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      }
    };
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  getAccessToken(): string | null {
    return this._accessToken;
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  private clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  /**
   * Set authenticated state directly (for testing)
   */
  setAuthenticated(value: boolean, accessToken?: string): this {
    this._isAuthenticated = value;
    if (accessToken) {
      this._accessToken = accessToken;
    }
    return this;
  }
}

/**
 * Pre-configured mock instance for testing
 */
export const mockAuthService = new MockAuthService();
export default mockAuthService;
