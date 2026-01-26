import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getRuntimeConfig } from '@/config/runtime';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private onUnauthorized?: () => void;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];
  private configLoaded = false;
  private configLoadPromise?: Promise<void>;

  constructor() {
    // Temporary baseURL, will be updated after loading runtime config
    this.baseURL = 'http://localhost:8080/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });

    this.setupInterceptors();
    this.configLoadPromise = this.loadRuntimeConfig();
  }

  private async loadRuntimeConfig(): Promise<void> {
    if (typeof window !== 'undefined' && !this.configLoaded) {
      try {
        const config = await getRuntimeConfig();
        if (config) {
          this.baseURL = config.apiUrl;
          this.client.defaults.baseURL = config.apiUrl;
          this.configLoaded = true;
          console.log('Runtime config loaded, API URL:', config.apiUrl);
        }
      } catch (error) {
        console.error('Failed to load runtime config:', error);
      }
    }
  }

  private async ensureConfigLoaded(): Promise<void> {
    if (!this.configLoaded && this.configLoadPromise) {
      await this.configLoadPromise;
    }
  }

  public setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message
        });

        const originalRequest = error.config;

        // Check if error is 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh for login and refresh endpoints
          if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
          }

          const refreshToken = this.getRefreshToken();
          
          // If no refresh token, clear and redirect
          if (!refreshToken) {
            this.clearTokens();
            this.handleUnauthorized();
            return Promise.reject(error);
          }

          // If already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshTokenRequest(refreshToken);
            
            if (response.data.status && response.data.data?.access_token) {
              const newAccessToken = response.data.data.access_token;
              const newRefreshToken = response.data.data.refresh_token;
              
              this.setAccessToken(newAccessToken);
              if (newRefreshToken) {
                this.setRefreshToken(newRefreshToken);
              }
              
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              this.processQueue(null, newAccessToken);
              
              return this.client(originalRequest);
            } else {
              throw new Error('Invalid refresh token response');
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearTokens();
            this.handleUnauthorized();
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleUnauthorized() {
    if (this.onUnauthorized) {
      this.onUnauthorized();
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async refreshTokenRequest(refreshToken: string) {
    const refreshClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return refreshClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  public logout(): void {
    this.clearTokens();
  }

  // HTTP Methods
  public async get<T>(url: string, config?: AxiosRequestConfig) {
    await this.ensureConfigLoaded();
    return this.client.get<T>(url, config);
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    await this.ensureConfigLoaded();
    return this.client.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    await this.ensureConfigLoaded();
    return this.client.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    await this.ensureConfigLoaded();
    return this.client.delete<T>(url, config);
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    await this.ensureConfigLoaded();
    return this.client.patch<T>(url, data, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
