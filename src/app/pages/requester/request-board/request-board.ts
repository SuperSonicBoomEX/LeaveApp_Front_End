import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { LeaveRequest } from '../../../components/models/leave-request.model';
import { LeaveBalance } from '../../../components/models/leave-balance.model';
import { LeaveRequestService } from '../../../services/leave-request-service';
import { LeaveBalanceService } from '../../../services/leave-balance-service';
import { ReportService } from '../../../services/report-service';
import { MatIcon } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-request-board',
  imports: [
    MatProgressBarModule,
    MatTableModule,
    MatButtonModule,
    MatIcon,
    MatSortModule,
  ],
  templateUrl: './request-board.html',
  styleUrl: './request-board.scss',
})

// Using OnInit
export class RequestBoard implements OnInit, AfterViewInit {
  constructor(
    private readonly router: Router,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly reportService: ReportService,
    private readonly snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}
  leaveRequests: LeaveRequest[] = [];
  leaveBalances: LeaveBalance[] = [];

  // Setting up the table columns and data source for the leave requests
  displayedColumns = ['type', 'dates', 'days', 'status', 'submittedDate', 'icon'];
  dataSource = new MatTableDataSource<LeaveRequest>([]);
  selectedRequest: LeaveRequest | null = null;

  @ViewChild(MatSort)
  sort!: MatSort;

  // The get functions below are used to get the leave balances for annual and sick leaves, as well as their total and remaining days, and the percentage of remaining days. These functions are used in the template to display the leave balances in a user-friendly way.
  get annualLeave(): LeaveBalance | undefined {
    return this.leaveBalances.find((balance) =>
      balance.leaveType?.toLowerCase().includes('annual'),
    ); // This function searches through the leaveBalances array to find the balance for annual leave by checking if the leaveType includes the word 'annual' (case-insensitive). If it finds a match, it returns that LeaveBalance object; otherwise, it returns undefined.
  }

  get sickLeave(): LeaveBalance | undefined {
    return this.leaveBalances.find((balance) => balance.leaveType?.toLowerCase().includes('sick')); // This function searches through the leaveBalances array to find the balance for sick leave by checking if the leaveType includes the word 'sick' (case-insensitive). If it finds a match, it returns that LeaveBalance object; otherwise, it returns undefined.
  }

  get parentalLeave(): LeaveBalance | undefined {
    return this.leaveBalances.find((balance) =>
      balance.leaveType?.toLowerCase().includes('parental'),
    );
  }

  // Annual Leave Calculations
  get annualTotal(): number {
    return this.annualLeave?.totalDays ?? 0; // If annualLeave is undefined, return 0
  }

  get annualRemaining(): number {
    return this.annualLeave?.availableDays ?? 0;
  }

  get annualPercentage(): number {
    return this.annualTotal > 0 ? Math.round((this.annualRemaining / this.annualTotal) * 100) : 0;
  }

  get annualReserved(): number {
    return this.annualLeave?.reservedDays ?? 0;
  }

  get annualUsed(): number {
    return this.annualLeave?.usedDays ?? 0;
  }

  // Sick Leave Calculations
  get sickTotal(): number {
    return this.sickLeave?.totalDays ?? 0;
  }

  get sickRemaining(): number {
    return this.sickLeave?.availableDays ?? 0;
  }

  get sickPercentage(): number {
    return this.sickTotal > 0 ? Math.round((this.sickRemaining / this.sickTotal) * 100) : 0;
  }

  get sickReserved(): number {
    return this.sickLeave?.reservedDays ?? 0;
  }

  get sickUsed(): number {
    return this.sickLeave?.usedDays ?? 0;
  }

  // Parental Leave Calculations
  get parentalTotal(): number {
    return this.parentalLeave?.totalDays ?? 0;
  }

  get parentalRemaining(): number {
    return this.parentalLeave?.availableDays ?? 0;
  }

  get parentalPercentage(): number {
    return this.parentalTotal > 0
      ? Math.round((this.parentalRemaining / this.parentalTotal) * 100)
      : 0;
  }

  get parentalReserved(): number {
    return this.parentalLeave?.reservedDays ?? 0;
  }

  get parentalUsed(): number {
    return this.parentalLeave?.usedDays ?? 0;
  }

  ngOnInit(): void {
    this.leaveRequestService.getLeaveRequests().subscribe({
      next: (requests) => {
        // This is where we set the leave requests and update the data source for the table
        this.leaveRequests = requests;
        this.dataSource.data = requests;
        this.selectedRequest = requests.length ? requests[0] : null;
      },
      error: (error) => {
        console.error('Failed to load leave requests', error);
      },
    });

    this.leaveBalanceService.getLeaveBalances().subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load leave balances', error);
      },
    });
  }

  // This is the sorting function for the table, it sorts by the createdAt date and submittedDate date, and if those are not available, it sorts by the other properties of the LeaveRequest object.
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      // Custom sorting logic for the table
      switch (property) {
        case 'createdAt':
        case 'submittedDate':
          return item.createdAt ? new Date(item.createdAt).getTime() : 0;
        case 'days':
          return item.days ?? 0;
        case 'status':
          return item.status ?? '';
        case 'type':
          return item.leaveType ?? '';
        default:
          return (item as any)[property];
      }
    };
    this.cdr.detectChanges();
  }

  // Formatting submit date to be more cleaner
  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    // Changes the format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getTypeClass(type: string): string {
    return type?.toLowerCase().includes('sick') ? 'type-pill type-sick' : 'type-pill type-annual';
  }

  getTypeLabel(type: string): string {
    return type?.toUpperCase() ?? 'ANNUAL LEAVE';
  }
  // Conditions for each status in the request table
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
  // If the remaining days is not 0, the show the status as available, otherwise it's spent
  getSummaryState(remaining: number): string {
    return remaining > 0 ? 'Available' : 'Spent';
  }
  // Same as the above but as a class
  getSummaryStateClass(remaining: number): string {
    return remaining > 0 ? 'pill_available' : 'pill_spent';
  }

  // Helper function to select a request and display its details
  selectRequest(request: LeaveRequest): void {
    this.selectedRequest = request;
    const requestId = request.id ?? (request as any)._id;
    this.router.navigate(['/request-details', requestId]);
  }

  exportSummary(): void {
    this.reportService.downloadMyPdf().subscribe({
      next: () => {
        console.log('PDF report downloaded successfully.');
        this.snackBar.open('You Have Successfully Downloaded Your Report!', 'Close', {
        duration: 3000,
    });
      },
      error: (error) => {
        console.error('Failed to export PDF report', error);
      },
    });
  }

  toForm() {
    this.router.navigate(['/request-form']);
  }
}
