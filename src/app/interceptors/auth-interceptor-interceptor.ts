import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const authService = inject(AuthService);

  // console.log('Interceptor Token is Here: ', token);
  // This will allow passing tokens to the other api isCallSignatureDeclaration, to prevent api request function's duplication
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Handle unauthorized error, e.g., redirect to login page
        console.error('Unauthorized request. Redirecting to login.');
        authService.logout(); // Call the logout method to clear local storage and redirect to login
      }
      return throwError(() => error);
    })
  );
};
