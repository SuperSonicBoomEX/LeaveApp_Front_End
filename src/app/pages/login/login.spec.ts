// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { Login } from './login';

// This is a mock implementation of localStorage for testing purposes. It uses a Map to store key-value pairs in memory, allowing us to simulate the behavior of localStorage without relying on the actual browser API. The mock provides methods for getting, setting, removing, and clearing items, and it also tracks calls to these methods using vi.fn() for easy verification in tests.
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMap.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    storageMap.delete(key);
  }),
  clear: vi.fn(() => {
    storageMap.clear();
  }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { EmployeesService } from '../../services/employees-service';

// This is for testing the login page. It uses the Vitest testing framework to define a suite of tests for the Login component. The tests cover various scenarios, including successful login, navigation based on user roles, and handling of validation and unauthorized errors. The tests use mock implementations of dependencies like AuthService, Router, ChangeDetectorRef, and MatSnackBar to isolate the component's behavior and verify its functionality in different situations.
describe('Login', () => {
  let component: Login;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    getUserRole: ReturnType<typeof vi.fn>;
    startLogoutTimer: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let cdr: { detectChanges: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let leaveBalanceService: { clearBalanceCache: ReturnType<typeof vi.fn> };
  let employeeService: { clearEmployeesCache: ReturnType<typeof vi.fn> };

  // Here is the setup for each test case. It initializes the component and its dependencies before each test runs. The mock implementations of AuthService, Router, ChangeDetectorRef, and MatSnackBar are created using vi.fn() to allow for easy tracking of method calls and return values. The localStorageMock is also cleared before each test to ensure a clean state for testing.
  beforeEach(() => {
    authService = {
      login: vi.fn(),
      getUserRole: vi.fn(),
      startLogoutTimer: vi.fn(),
    };
    router = {
      navigate: vi.fn(),
    };
    cdr = {
      detectChanges: vi.fn(),
    };
    snackBar = {
      open: vi.fn(),
    };
    leaveBalanceService = {
      clearBalanceCache: vi.fn(),
    };
    employeeService = {
      clearEmployeesCache: vi.fn(),
    };

    component = new Login(
      authService as unknown as AuthService,
      router as unknown as Router,
      cdr as unknown as ChangeDetectorRef,
      snackBar as unknown as MatSnackBar,
      leaveBalanceService as unknown as LeaveBalanceService,
      employeeService as unknown as EmployeesService
    );

    localStorageMock.clear();
  });

  // Test cases for the Login component. Each test verifies a specific behavior or functionality of the component, such as successful login, navigation based on user roles, and handling of validation and unauthorized errors. The tests use assertions to check the expected outcomes and ensure that the component behaves as intended in different scenarios.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit() should toggle the loading state on', () => {
    component.submit();

    expect(component.isLoading).toBe(true);
  });

  // Test case for storage user data and navigate the employee to requester
  it('onLogin() should store auth data and navigate to requester for an employee', () => {
    component.username = 'jane';
    component.password = 'secret';
    authService.getUserRole.mockReturnValue('ROLE_EMPLOYEE');
    authService.login.mockReturnValue(
      of({
        token: 'abc123',
        tokenType: 'Bearer',
        expiresAt: '2026-07-01T00:00:00Z',
      }),
    );

    component.onLogin();

    // Case check for following data
    expect(authService.login).toHaveBeenCalledWith({ username: 'jane', password: 'secret' });
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(localStorage.getItem('tokenType')).toBe('Bearer');
    expect(localStorage.getItem('expiresAt')).toBe('2026-07-01T00:00:00Z');
    expect(localStorage.getItem('role')).toBe('ROLE_EMPLOYEE');
    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
    expect(snackBar.open).toHaveBeenCalledWith('Login Successful!', 'Close', { duration: 3000 });
    expect(leaveBalanceService.clearBalanceCache).toHaveBeenCalled();
    expect(employeeService.clearEmployeesCache).toHaveBeenCalled();
    expect(authService.startLogoutTimer).toHaveBeenCalledWith('abc123');
    expect(component.isLoading).toBe(false);
  });

  // Case check for approver making sure they go to the approver page
  it('onLogin() should navigate to approver when the user role is approver', () => {
    component.username = 'alex';
    component.password = 'password';
    authService.getUserRole.mockReturnValue('ROLE_APPROVER');
    authService.login.mockReturnValue(
      of({
        token: 'xyz789',
        tokenType: 'Bearer',
        expiresAt: '2026-07-02T00:00:00Z',
      }),
    );

    component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/approver']);
  });

  it('onLogin() should navigate to manager when the user role is manager', () => {
    component.username = 'sam';
    component.password = 'pass';
    authService.getUserRole.mockReturnValue('ROLE_MANAGER');
    authService.login.mockReturnValue(
      of({
        token: 'zzz000',
        tokenType: 'Bearer',
        expiresAt: '2026-07-03T00:00:00Z',
      }),
    );

    component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/manager']);
  });

  it('onLogin() should fall back to requester for an unknown role', () => {
    component.username = 'guest';
    component.password = 'guest';
    authService.getUserRole.mockReturnValue('UNKNOWN_ROLE');
    authService.login.mockReturnValue(
      of({
        token: 'fallback',
        tokenType: 'Bearer',
        expiresAt: '2026-07-04T00:00:00Z',
      }),
    );

    component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  // Case for validation error or not inputting the user data
  it('onLogin() should set a friendly message for validation errors', () => {
    authService.login.mockReturnValue({
      subscribe: (_next: any, error: any) => {
        error({ error: { errorCode: 'VALIDATION_ERROR', message: 'Please enter your account information' } });
        return { unsubscribe: () => undefined };
      },
    } as any);

    component.onLogin();

    expect(component.message).toBe('Please enter your account information!');
    expect(component.isLoading).toBe(false);
  });

  // Case for invalid username or password error
  it('onLogin() should set a friendly message for unauthorized errors', () => {
    authService.login.mockReturnValue({
      subscribe: (_next: any, error: any) => {
        error({ error: { errorCode: 'UNAUTHORIZED', message: 'invalid credentials' } });
        return { unsubscribe: () => undefined };
      },
    } as any);

    component.onLogin();

    expect(component.message).toBe('Your username or password is incorrect!');
    expect(component.isLoading).toBe(false);
    expect(cdr.detectChanges).toHaveBeenCalled();
  });
});
