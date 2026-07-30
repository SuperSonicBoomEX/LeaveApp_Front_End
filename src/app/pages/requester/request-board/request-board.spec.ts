// @vitest-environment jsdom

import '@angular/compiler';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { RequestBoard } from './request-board';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../../services/report-service';
import { LeaveBalanceService } from '../../../services/leave-balance-service';
import { LeaveRequestService } from '../../../services/leave-request-service';
import { Router } from '@angular/router';

describe('RequestBoard', () => {
  let component: RequestBoard;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let leaveRequestService: { getLeaveRequests: ReturnType<typeof vi.fn> };
  let leaveBalanceService: { getLeaveBalances: ReturnType<typeof vi.fn> };
  let reportService: { downloadMyPdf: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let cdr: { detectChanges: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    router = {
      navigate: vi.fn(),
    };
    leaveRequestService = {
      getLeaveRequests: vi.fn(),
    };
    leaveBalanceService = {
      getLeaveBalances: vi.fn(),
    };
    reportService = {
      downloadMyPdf: vi.fn(),
    };
    snackBar = {
      open: vi.fn(),
    };
    cdr = {
      detectChanges: vi.fn(),
    };

    component = new RequestBoard(
      router as unknown as Router,
      leaveRequestService as unknown as LeaveRequestService,
      leaveBalanceService as unknown as LeaveBalanceService,
      reportService as unknown as ReportService,
      snackBar as unknown as MatSnackBar,
      cdr as unknown as ChangeDetectorRef,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load leave requests and balances', () => {
    const requests = [
      {
        id: 1,
        leaveType: 'ANNUAL',
      },
    ];

    const balances = [
      {
        leaveType: 'ANNUAL',
        totalDays: 14,
        availableDays: 10,
        reservedDays: 2,
        usedDays: 2,
      },
    ];

    leaveRequestService.getLeaveRequests.mockReturnValue(of(requests));
    leaveBalanceService.getLeaveBalances.mockReturnValue(of(balances));

    component.ngOnInit();

    expect(component.leaveRequests).toEqual(requests);
    expect(component.leaveBalances).toEqual(balances);
    expect(component.selectedRequest).toEqual(requests[0]);
    expect(component.dataSource.data).toEqual(requests);
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('should format dates correctly', () => {
    expect(component.formatDate('2026-07-01')).toBe('Jul 1, 2026');
  });

  it('should return empty string for empty data', () => {
    expect(component.formatDate('')).toBe('');
  });

  it('should return original string if date is invalid', () => {
    expect(component.formatDate('hello')).toBe('hello');
  });

  it('should return approved status class', () => {
    expect(component.getStatusClass('APPROVED')).toBe('status-pill status-approved');
  });

  it('should return cancelled status class', () => {
    expect(component.getStatusClass('CANCELLED')).toBe('status-pill status-cancelled');
  });

  it('should return rejected status class', () => {
    expect(component.getStatusClass('REJECTED')).toBe('status-pill status-rejected');
  });

  it('should return pending status class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pill status-pending');
  });

  it('should return Available when remaining days exist', () => {
    expect(component.getSummaryState(5)).toBe('Available');
  });

  it('should return Spent when remaining days is zero', () => {
    expect(component.getSummaryState(0)).toBe('Spent');
  });

  it('should return available pill class', () => {
    expect(component.getSummaryStateClass(5)).toBe('pill_available');
  });

  it('should return spent pill class', () => {
    expect(component.getSummaryStateClass(0)).toBe('pill_spent');
  });

  it('should navigate to request details', () => {
    const request = {
      id: 99,
    };

    component.selectRequest(request as any);

    expect(component.selectedRequest).toEqual(request);
    expect(router.navigate).toHaveBeenCalledWith(['/request-details', 99]);
  });

  it('should download report successfully', () => {
    reportService.downloadMyPdf.mockReturnValue(of(new Blob()));

    component.exportSummary();

    expect(reportService.downloadMyPdf).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'You Have Successfully Downloaded Your Report!',
      'Close',
      { duration: 3000 },
    );
  });

  it('should navigate to request form', () => {
    component.toForm();

    expect(router.navigate).toHaveBeenCalledWith(['/request-form']);
  });

  it('should calculate annual leave values correctly', () => {
    component.leaveBalances = [
      {
        leaveType: 'Annual Leave',
        totalDays: 14,
        availableDays: 10,
        reservedDays: 2,
        usedDays: 2,
      } as any,
    ];

    expect(component.annualTotal).toBe(14);
    expect(component.annualRemaining).toBe(10);
    expect(component.annualReserved).toBe(2);
    expect(component.annualUsed).toBe(2);
    expect(component.annualPercentage).toBe(71);
  });

  it('should calculate sick leave values correctly', () => {
    component.leaveBalances = [
      {
        leaveType: 'Sick Leave',
        totalDays: 10,
        availableDays: 7,
        reservedDays: 1,
        usedDays: 2,
      } as any,
    ];

    expect(component.sickTotal).toBe(10);
    expect(component.sickRemaining).toBe(7);
    expect(component.sickReserved).toBe(1);
    expect(component.sickUsed).toBe(2);
    expect(component.sickPercentage).toBe(70);
  });

  it('should calculate parental leave values correctly', () => {
    component.leaveBalances = [
      {
        leaveType: 'Parental Leave',
        totalDays: 30,
        availableDays: 15,
        reservedDays: 5,
        usedDays: 10,
      } as any,
    ];

    expect(component.parentalTotal).toBe(30);
    expect(component.parentalRemaining).toBe(15);
    expect(component.parentalReserved).toBe(5);
    expect(component.parentalUsed).toBe(10);
    expect(component.parentalPercentage).toBe(50);
  });
});
