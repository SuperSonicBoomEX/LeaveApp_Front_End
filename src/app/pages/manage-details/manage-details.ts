import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveRequest } from '../../components/models/leave-request.model';
import { LeaveBalance } from '../../components/models/leave-balance.model';
import { LeaveRequestService } from '../../services/leave-request-service';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavBarManager } from '../../components/nav-bar-manager/nav-bar-manager';
import { EmployeesService } from '../../services/employees-service';
import { MatStepperModule } from '@angular/material/stepper';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-manage-details',
  imports: [NavBarManager, MatButtonModule, CommonModule, MatStepperModule],
  templateUrl: './manage-details.html',
  styleUrl: './manage-details.scss',
})
export class ManageDetails implements OnInit {
  leaveRequest: LeaveRequest | null = null;
  leaveBalance: LeaveBalance | null = null;
  decidedByName: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly employeeService: EmployeesService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  get canActOnRequest(): boolean {
    return this.leaveRequest?.status?.toUpperCase() === 'PENDING';
  }

  ngOnInit(): void {
    const requestId = Number(this.route.snapshot.paramMap.get('id'));

    // console.log('test 1');

    if (requestId) {
      this.leaveRequestService.getLeaveRequestById(requestId).subscribe({
        next: (request) => {
          this.leaveRequest = request;
          this.loadDecidedByName(request.decidedBy);
          this.loadBalanceImpact(request);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to load request details', error);
          this.leaveRequest = null;
          this.leaveBalance = null;
        },
      });
    }
  }

  private loadDecidedByName(decidedBy: string | number | null | undefined): void {
    if (!decidedBy) {
      this.decidedByName = null;
      return;
    }

    const parsedId = Number(decidedBy);
    if (!Number.isNaN(parsedId)) {
      this.employeeService.getEmployee(parsedId).subscribe({
        next: (employee) => {
          this.decidedByName = employee?.name || String(decidedBy);
          this.cdr.detectChanges();
        },
        error: () => {
          this.decidedByName = String(decidedBy);
        },
      });
      return;
    }

    this.decidedByName = String(decidedBy);
  }

  private loadBalanceImpact(request: LeaveRequest): void {
    this.leaveBalanceService.getEmployeeLeaveBalances(request.employeeId).subscribe({
      next: (balances) => {
        const normalizedType = request.leaveType?.toUpperCase() ?? '';
        this.leaveBalance =
          balances.find((balance) => balance.leaveType?.toUpperCase().includes(normalizedType)) ??
          null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load leave balances for employee', error);
        this.leaveBalance = null;
      },
    });
  }

  getTypeClass(type: string): string {
    return type?.toLowerCase().includes('sick') ? 'type-pill type-sick' : 'type-pill type-annual';
  }

  getTypeLabel(type: string): string {
    return type?.toUpperCase() ?? 'ANNUAL LEAVE';
  }

  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getStatusClass(status: string): string {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case 'APPROVED':
        return 'status-pill status-approved';
      case 'REJECTED':
        return 'status-pill status-rejected';
      case 'CANCELLED':
        return 'status-pill status-cancelled';
      default:
        return 'status-pill status-pending';
    }
  }

  getStatusLabel(status: string): string {
    return status?.toUpperCase() ?? 'PENDING';
  }

  get isParentalLeave(): boolean {
    return this.leaveRequest?.leaveType === 'PARENTAL';
  }

  get currentStep(): number {
    if (!this.leaveRequest) return 0;

    if (!this.isParentalLeave) {
      switch (this.leaveRequest.status) {
        case 'PENDING':
          return 1;

        case 'APPROVED':
        case 'REJECTED':
        case 'CANCELLED':
          return 2;

        default:
          return 0;
      }
    }

    switch (this.leaveRequest.stage) {
      case 'SUBMITTED':
        return 1;

      case 'WAITING_MANAGER':
        return 2;

      case 'COMPLETED':
        return 3;

      default:
        return 0;
    }
  }

  approveRequest(): void {
    if (!this.leaveRequest) {
      return;
    }

    this.leaveRequestService.approveRequest(this.leaveRequest.id).subscribe({
      next: (updatedRequest) => {
        console.log('Request approved successfully:', updatedRequest);
        this.leaveRequest = updatedRequest;
        this.snackBar.open('The Leave Request is Approved!', 'Close', { duration: 3000 });

        this.router.navigate(['/manager']);
      },
      error: (error) => {
        console.error('Failed to approve request', error);
      },
    });
  }

  rejectRequest(): void {
    if (!this.leaveRequest) {
      return;
    }

    this.leaveRequestService.rejectRequest(this.leaveRequest.id).subscribe({
      next: (updatedRequest) => {
        console.log('Request rejected successfully:', updatedRequest);
        this.leaveRequest = updatedRequest;
        this.snackBar.open('The Leave Request is Rejected!', 'Close', { duration: 3000 });

        this.router.navigate(['/manager']);
      },
      error: (error) => {
        console.error('Failed to reject request', error);
      },
    });
  }

  goBack() {
    this.router.navigate(['/manager']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.goBack();
  }
}
