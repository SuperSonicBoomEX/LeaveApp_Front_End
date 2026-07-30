import { Component, OnInit } from '@angular/core';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { LeaveRequest } from '../../components/models/leave-request.model';
import { LeaveBalance } from '../../components/models/leave-balance.model';
import { LeaveRequestService } from '../../services/leave-request-service';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeesService } from '../../services/employees-service';
import { MatStepperModule } from '@angular/material/stepper';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-request-details',
  imports: [NavBar, MatButtonModule, CommonModule, MatStepperModule],
  templateUrl: './request-details.html',
  styleUrl: './request-details.scss',
})
export class RequestDetails implements OnInit {
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
    this.leaveBalanceService.getLeaveBalances().subscribe({
      next: (balances) => {
        const normalizedType = request.leaveType?.toUpperCase() ?? '';
        this.leaveBalance =
          balances.find((balance) => balance.leaveType?.toUpperCase().includes(normalizedType)) ??
          null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load leave balances', error);
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
    } else {
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
  }

  cancelRequest(): void {
    if (!this.leaveRequest) {
      return;
    }

    this.leaveRequestService.cancelRequest(this.leaveRequest.id).subscribe({
      next: (updatedRequest) => {
        console.log('Request cancelled successfully:', updatedRequest);
        this.leaveRequest = updatedRequest;
        this.leaveBalanceService.clearBalanceCache();
        this.snackBar.open('The Leave Request is Cancelled!', 'Close', { duration: 3000 });

        this.router.navigate(['/requester']);
      },
      error: (error) => {
        console.error('Failed to cancel request', error);
      },
    });
  }

  goBack() {
    this.router.navigate(['/requester']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.goBack();
  }
}
