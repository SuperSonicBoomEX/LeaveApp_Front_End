import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { LoginError } from '../../components/models/login-models/login-error.model';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { EmployeesService } from '../../services/employees-service';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  // Login inputs
  username: string = '';
  password: string = '';

  errorCode: string = '';
  message: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private leaveBalanceService: LeaveBalanceService,
    private employeeService: EmployeesService
  ) {}

  // Make a button progress indicator to show upon toggle
  isLoading = false;
  submit() {
    this.isLoading = true;
  }

  // Checking in console to see whether the login was successful or not
  onLogin() {
    const credentials = { username: this.username, password: this.password };
    this.authService.login(credentials).subscribe(
      (response) => {
        // Display and keep token information
        localStorage.setItem('token', response.token);
        localStorage.setItem('tokenType', response.tokenType);
        localStorage.setItem('expiresAt', response.expiresAt);
        // This function decodes the JWT token to get the user's role to avoid repeatedly decoding the JWT token
        localStorage.setItem('role', this.authService.getUserRole() || '');

        this.snackBar.open('Login Successful!', 'Close', { duration: 3000 });

        this.leaveBalanceService.clearBalanceCache();
        this.employeeService.clearEmployeesCache();

        // This is the condition function for navigating users to a different page according to their roles
        const role_condition = localStorage.getItem('role');
        switch (role_condition) {
          case 'ROLE_EMPLOYEE':
            this.router.navigate(['/requester']);
            break;

          case 'ROLE_APPROVER':
            this.router.navigate(['/approver']);
            break;

          case 'ROLE_MANAGER':
            this.router.navigate(['/manager']);
            break;

          default:
            this.router.navigate(['/requester']);
        }

        this.authService.startLogoutTimer(response.token);

        this.isLoading = false;
        console.log('Login successful:', response);
      },
      (error) => {
        const errorResponse = error.error as LoginError;

        // Display error messages
        console.error('Login failed:', error);
        console.log(errorResponse.message);

        const code = error.error?.errorCode;

        switch (code) {
          case 'VALIDATION_ERROR':
            this.message = 'Please enter your account information!';
            break;

          case 'UNAUTHORIZED':
            this.message = 'Your username or password is incorrect!';
            break;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
    );
  }
}
