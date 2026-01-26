import type { IAuthService } from './authService.interface';
import { AuthService, authService as defaultAuthService } from './authService';
import { MockAuthService, mockAuthService } from './mockAuthService';

/**
 * AuthService Registry
 * Allows swapping auth service implementation at runtime
 * Useful for testing and mocking
 */
class AuthServiceRegistry {
  private currentService: IAuthService;

  constructor() {
    this.currentService = defaultAuthService;
  }

  /**
   * Get the current auth service instance
   */
  get(): IAuthService {
    return this.currentService;
  }

  /**
   * Set a custom auth service implementation
   */
  set(service: IAuthService): void {
    this.currentService = service;
  }

  /**
   * Use the real auth service (default)
   */
  useReal(): void {
    this.currentService = defaultAuthService;
  }

  /**
   * Use the mock auth service for testing
   */
  useMock(): MockAuthService {
    this.currentService = mockAuthService;
    return mockAuthService;
  }

  /**
   * Use a custom mock with specific configuration
   */
  useCustomMock(config?: Parameters<MockAuthService['configure']>[0]): MockAuthService {
    const mock = new MockAuthService();
    if (config) {
      mock.configure(config);
    }
    this.currentService = mock;
    return mock;
  }

  /**
   * Reset to default real service
   */
  reset(): void {
    this.useReal();
  }
}

/**
 * Singleton registry instance
 */
export const authServiceRegistry = new AuthServiceRegistry();

/**
 * Convenience function to get current auth service
 */
export const getAuthService = (): IAuthService => authServiceRegistry.get();

export { AuthService, MockAuthService };
export default authServiceRegistry;
