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
import { ChangeDetectorRef } from '@angular/core';
import { LeaveBalanceService } from '../../services/leave-balance-service';

@Component({
  selector: 'app-nav-bar-approver',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  templateUrl: './nav-bar-approver.html',
  styleUrl: './nav-bar-approver.scss',
})
export class NavBarApprover implements OnInit {
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

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    if (userId) {
      this.employeeService.getEmployee(userId).subscribe({
        next: (employee) => {
          this.displayName = employee?.name || this.authService.getUsername() || 'Guest';
          this.cdr.detectChanges();
        },
        error: () => {
          this.displayName = this.authService.getUsername() || 'Guest';
        },
      });
      return;
    }

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

  toApprover(): void {
    this.router.navigate(['/approver']);
  }
}
