import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { ApproveDetails } from '../../approve-details/approve-details';
import { LeaveRequestService } from '../../../services/leave-request-service';
import { EmployeeLeaveRequest } from '../../../components/models/employee-leave-models/employee-leave-request.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-approve-board',
  imports: [MatTableModule, MatButtonModule, RouterLink, ApproveDetails, MatSortModule],
  templateUrl: './approve-board.html',
  styleUrl: './approve-board.scss',
})
export class ApproveBoard implements OnInit, AfterViewInit {
  constructor(
    private readonly router: Router,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly snackBar: MatSnackBar,
  ) {}

  employeeRequests: EmployeeLeaveRequest[] = [];

  // Setting up the table columns and data source for the leave requests
  displayedColumns = ['employee', 'type', 'dates', 'days', 'reason', 'submittedDate', 'actions'];
  dataSource = new MatTableDataSource<EmployeeLeaveRequest>([]);
  selectedRequest: EmployeeLeaveRequest | null = null;

  @ViewChild(MatSort)
  sort!: MatSort;

  // This is where the approver page will get api from the leave request and show only the requests from the employee that has a status of pending only
  ngOnInit(): void {
    this.loadPendingRequests();
  }

  // This function will load the pending requests from the leave request service and filter them to only show the requests that have a status of pending. It will then set the data source for the table to be the filtered requests and set the selected request to be the first request in the list.
  private loadPendingRequests(): void {
    this.leaveRequestService.getAllEmployeeLeaveRequests().subscribe({
      next: (requests) => {
        this.employeeRequests = requests.filter(
          (request) => request.status?.toUpperCase() === 'PENDING',
        );
        this.dataSource.data = this.employeeRequests;
        this.selectedRequest = this.employeeRequests[0] ?? null;
      },
      error: (error) => {
        console.error('Failed to load leave requests', error);
      },
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      // Custom sorting logic for the table
      switch (property) {
        case 'employee':
          return item.employeeName?.toLowerCase() ?? '';
        case 'type':
          return item.leaveType ?? '';
        case 'days':
          return item.days ?? 0;
        case 'reason':
          return item.reason?.toLowerCase() ?? '';
        case 'submittedDate':
          return new Date(item.createdAt).getTime();
        default:
          return '';
      }
    };
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

  // Conditions for each status pills and type pills
  getTypeClass(type: string): string {
    return type?.toLowerCase().includes('sick') ? 'type-pill type-sick' : 'type-pill type-annual';
  }

  getTypeLabel(type: string): string {
    return type?.toUpperCase() ?? 'ANNUAL LEAVE';
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

  //Helper function to select a request and display its details, make sure that
  selectRequest(request: EmployeeLeaveRequest): void {
    this.selectedRequest = request;
  }

  viewRequest(request: EmployeeLeaveRequest): void {
    this.selectedRequest = request;
    this.router.navigate(['/approve-details', request.id]);
  }

  // Approve function that will call the api to approve the request and show a snack bar message if successful or not
  approveRequest(request: EmployeeLeaveRequest): void {
    this.leaveRequestService.approveRequest(request.id).subscribe({
      next: () => {
        this.snackBar.open('Leave Request Has Been Approved!', 'Close', { duration: 3000 });
        this.loadPendingRequests();
      },
      error: (error) => {
        console.error('Failed to approve request', error);
        this.snackBar.open('Unable to approve request.', 'Close', { duration: 3000 });
      },
    });
  }

  // Reject function that will call the api to reject the request and show a snack bar message if successful or not
  rejectRequest(request: EmployeeLeaveRequest): void {
    this.leaveRequestService.rejectRequest(request.id).subscribe({
      next: () => {
        this.snackBar.open('Leave Request Has Been Rejected!', 'Close', { duration: 3000 });
        this.loadPendingRequests();
      },
      error: (error) => {
        console.error('Failed to reject request', error);
        this.snackBar.open('Unable to reject request.', 'Close', { duration: 3000 });
      },
    });
  }
}
