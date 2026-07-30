import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeesService } from '../../services/employees-service';
import { EmployeeResponse } from '../models/employee-leave-models/employee-response.model';
import { ChangeDetectorRef } from '@angular/core';
import { LeaveBalanceService } from '../../services/leave-balance-service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit {
  employee?: EmployeeResponse;
  displayName = 'Guest';

  constructor(
    private authService: AuthService,
    private employeeService: EmployeesService,
    public router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private leaveBalanceService: LeaveBalanceService
  ) {}

  get username(): string {
    return this.displayName;
  }

  // ngOnInit lifecycle hook to fetch employee details and set display name
  ngOnInit(): void {
    const userId = this.authService.getUserId?.();

    if (userId) {
      this.employeeService.getEmployee(userId).subscribe({
        next: (employee) => {
          this.employee = employee;
          this.displayName = employee?.name || this.authService.getUsername() || 'Guest';
          this.cdr.detectChanges();
        },
        error: () => {
          this.displayName = this.authService.getUsername() || 'Guest';
        },
      });
      return;
    }

    // This will show default as Guest
    this.displayName = this.authService.getUsername() || 'Guest';
  }

  logout(): void {
    this.leaveBalanceService.clearBalanceCache();
    this.employeeService.clearEmployeesCache();
    this.authService.logout();
    this.snackBar.open('You Have Successfully Logged Out Your Account!', 'Close', {
      duration: 3000,
    });

  }

  toRequester(): void {
    this.router.navigate(['/requester']);
  }

  toRequestForm(): void {
    this.router.navigate(['/request-form']);
  }
}
