import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest } from '../components/models/login-models/login-request.model';
import { LoginResponse } from '../components/models/login-models/login-response.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

// Authentication service, use POST to create login requests
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  private logoutTimer?: ReturnType<typeof setTimeout>;
  // private apiUrl = 'https://leave-management-api-dujj.onrender.com/auth';
  private apiUrl = 'http://localhost:8080/auth';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the token is expired by decoding the JWT token and comparing the expiration time with the current time. If the token is expired or invalid, return true; otherwise, return false.
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiresAt;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return true;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('role');

    this.router.navigate(['/login'], {
      replaceUrl: true,
    });
  }

  // Decoding information from the JWT token
  getPayload(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const payloadBase64 = token.split('.')[1];
    // ASCII to Binary
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  }

  getUserRole(): string | null {
    const payload = this.getPayload();
    return payload ? payload.role : null;
  }

  getUsername(): string | null {
    const payload = this.getPayload();
    return payload ? payload.username : null;
  }

  // Get the user ID from the JWT token payload. The function checks for various possible fields that may contain the user ID, such as userId, id, sub, employeeId, or employee.id. It returns the user ID as a number if found, or null if not found or if the value cannot be converted to a number.
  getUserId(): number | null {
    const payload = this.getPayload();
    if (!payload) {
      return null;
    }

    const candidate =
      payload.userId ?? payload.id ?? payload.sub ?? payload.employeeId ?? payload.employee?.id;

    if (typeof candidate === 'number') {
      return candidate;
    }

    if (typeof candidate === 'string') {
      const parsed = Number(candidate);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  // Start a timer to automatically log out the user when the token expires
  startLogoutTimer(token: string): void {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const expiresAt = payload.exp * 1000; // Convert to milliseconds
    const timeUntilExpiration = expiresAt - Date.now();

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
      alert('Your session has expired. Please log in again.');
    }, timeUntilExpiration);
  }
}
