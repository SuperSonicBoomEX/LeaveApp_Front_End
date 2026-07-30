// @vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth-service';
import { Router } from '@angular/router';

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

function createJwt(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Encode = (obj: object) => btoa(JSON.stringify(obj));

  return `${base64Encode(header)}.${base64Encode(payload)}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: {
    post: ReturnType<typeof vi.fn>;
  };

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      post: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    service = new AuthService(http as unknown as HttpClient, router as unknown as Router);

    localStorageMock.clear();

    vi.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login() should POST credentials and return a token', () => {
    const credentials = { username: 'test', password: 'password' };
    const mockResponse = {
      token: 'mockToken',
      tokenType: 'Bearer',
      expiresAt: '2026-01-01T00:00:00.000Z',
    };

    http.post.mockReturnValue(of(mockResponse));

    service.login(credentials).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(http.post).toHaveBeenCalledWith('http://localhost:8080/auth/login', credentials);
  });

  it('getToken() should return the token from localStorage', () => {
    localStorage.setItem('token', 'mockToken');
    expect(service.getToken()).toBe('mockToken');
  });

  it('isLoggedIn() should return true when the token exists', () => {
    localStorage.setItem('token', 'mockToken');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isLoggedIn() should return false when the token does not exist', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout() should clear localStorage and navigate to login', () => {
    localStorage.setItem('token', 'mockToken');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  });

  it('getPayload() should return the decoded payload of the token', () => {
    const payload = { sub: 'user123', exp: Math.floor(Date.now() / 1000) + 60 };
    const token = createJwt(payload);
    localStorage.setItem('token', token);

    const decodedPayload = service.getPayload();
    expect(decodedPayload).toEqual(payload);
  });

  it('getUserRole() should return the role from the token payload', () => {
    const payload = {
      sub: 'user123',
      role: 'ROLE_EMPLOYEE',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = createJwt(payload);
    localStorage.setItem('token', token);

    const role = service.getUserRole();
    expect(role).toBe('ROLE_EMPLOYEE');
  });

  it('getUsername() should return the username from the token payload', () => {
    const payload = {
      sub: 'user123',
      username: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = createJwt(payload);
    localStorage.setItem('token', token);

    const username = service.getUsername();
    expect(username).toBe('testuser');
  });

  it('getUserId() should return the user ID from the token payload', () => {
    const payload = { sub: 'user123', userId: 42, exp: Math.floor(Date.now() / 1000) + 60 };
    const token = createJwt(payload);
    localStorage.setItem('token', token);

    const userId = service.getUserId();
    expect(userId).toBe(42);
  });

  it('getUserId() should parse string userId to a number', () => {
    localStorage.setItem(
      'token',
      createJwt({
        userId: '123',
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    );

    expect(service.getUserId()).toBe(123);
  });

  it('isTokenExpired() should return true for an expired token', () => {
    const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 60 };
    const expiredToken = createJwt(expiredPayload);
    localStorage.setItem('token', expiredToken);

    expect(service.isTokenExpired()).toBe(true);
  });

  it('isTokenExpired() should return false for a valid token', () => {
    const validPayload = { exp: Math.floor(Date.now() / 1000) + 60 };
    const validToken = createJwt(validPayload);
    localStorage.setItem('token', validToken);

    expect(service.isTokenExpired()).toBe(false);
  });

  it('startLogoutTimer() should logout when the token expires', () => {
    vi.useFakeTimers();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const logoutSpy = vi.spyOn(service, 'logout');
    const token = createJwt({ exp: Math.floor(Date.now() / 1000) + 1 });

    service.startLogoutTimer(token);

    vi.advanceTimersByTime(1000);

    expect(logoutSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Your session has expired. Please log in again.');

    vi.useRealTimers();
  });
});
