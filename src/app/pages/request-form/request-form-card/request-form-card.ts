import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { LeaveRequestService } from '../../../services/leave-request-service';
import { CreateLeaveRequest } from '../../../components/models/create-leave-models/create-leave-request.model';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveBalanceService } from '../../../services/leave-balance-service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-request-form-card',
  imports: [
    RouterLink,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
  ],
  templateUrl: './request-form-card.html',
  styleUrl: './request-form-card.scss',
})
export class RequestFormCard {
  leaveType = '';
  startDate = '';
  endDate = '';
  reason = '';

  errorCode = '';
  errorMessage = '';

  constructor(
    private readonly leaveRequestService: LeaveRequestService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  submitRequest(): void {
    const newRequest: CreateLeaveRequest = {
      leaveType: this.leaveType,
      startDate: this.startDate,
      endDate: this.endDate,
      ...(this.reason ? { reason: this.reason } : {}),
    };

    this.leaveRequestService.createLeaveRequest(newRequest).subscribe({
      next: (response) => {
        console.log('Leave request submitted successfully:', response);
        // Optionally, you can reset the form fields here
        this.leaveType = '';
        this.startDate = '';
        this.endDate = '';
        this.reason = '';

        this.leaveBalanceService.clearBalanceCache();

        this.snackBar.open('Leave Request Submitted Successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/requester']);
      },
      error: (err) => {
        console.error('Failed to submit leave request:', err);

        const code = err.error?.errorCode;

        switch (code) {
          case 'INSUFFICIENT_BALANCE':
            this.errorMessage = 'Your current balance is not enough for this request!';
            break;

          case 'WEEKEND_NOT_ALLOWED':
            this.errorMessage = 'Weekend dates are not allowed for leave request!';
            break;
        }
        this.cdr.detectChanges();
      },
    });
  }

  today = new Date();

  // Filters the calendar to exclude weekends from selection
  weekdaysOnly = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

  onStartDateChange(): void {
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.endDate = '';
    }
  }

  // Convert string to dateTimestampProvider, used for end date restrictions
  StringtoDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Disable submit button unless filled in every requirements
  isSubmitDisabled(): boolean {
    return !this.leaveType || !this.startDate || !this.endDate;
  }

  cancelRequest(): void {
    // Reset form fields
    this.leaveType = '';
    this.startDate = '';
    this.endDate = '';
    this.reason = '';

    this.leaveBalanceService.clearBalanceCache();

    // Navigate back to the requester page
    this.router.navigate(['/requester']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelRequest();
  }
}
