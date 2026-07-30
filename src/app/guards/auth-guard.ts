import { CanActivateFn, Router } from '@angular/router';
import { inject, Inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isTokenExpired()) {
    authService.logout();
    return false;
  }

  return true;
};
