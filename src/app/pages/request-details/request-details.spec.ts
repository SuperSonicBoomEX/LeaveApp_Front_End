// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LeaveRequestService } from '../../services/leave-request-service';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { EmployeesService } from '../../services/employees-service';

import { RequestDetails } from './request-details';

describe('RequestDetails', () => {
  let component: RequestDetails;
  let route: any;
  let router: any;
  let leaveRequestService: any;
  let leaveBalanceService: any;
  let employeeService: any;
  let cdr: any;
  let snackBar: any;

  beforeEach(() => {
    route = {
      snapshot: {
        paramMap: {
          get: vi.fn(),
        },
      },
    };

    router = {
      navigate: vi.fn(),
    };

    leaveRequestService = {
      getLeaveRequestById: vi.fn(),
      cancelRequest: vi.fn(),
    };

    leaveBalanceService = {
      getLeaveBalances: vi.fn(),
      clearBalanceCache: vi.fn(),
    };

    employeeService = {
      getEmployee: vi.fn(),
    };

    cdr = {
      detectChanges: vi.fn(),
    };

    snackBar = {
      open: vi.fn(),
    };

    component = new RequestDetails(
      route as ActivatedRoute,
      router as Router,
      leaveRequestService as LeaveRequestService,
      leaveBalanceService as LeaveBalanceService,
      employeeService as EmployeesService,
      cdr as ChangeDetectorRef,
      snackBar as MatSnackBar,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load request details on init', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    const request = {
      id: 1,
      leaveType: 'ANNUAL',
      decidedBy: 2,
    };

    leaveRequestService.getLeaveRequestById.mockReturnValue(of(request));

    employeeService.getEmployee.mockReturnValue(
      of({
        id: 2,
        name: 'John Smith',
      }),
    );

    leaveBalanceService.getLeaveBalances.mockReturnValue(
      of([
        {
          leaveType: 'ANNUAL',
          availableDays: 10,
        },
      ]),
    );

    component.ngOnInit();

    expect(leaveRequestService.getLeaveRequestById).toHaveBeenCalledWith(1);

    expect(component.leaveRequest).toEqual(request);

    expect(component.decidedByName).toBe('John Smith');

    expect(component.leaveBalance?.leaveType).toBe('ANNUAL');

    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('should handle request loading error', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    leaveRequestService.getLeaveRequestById.mockReturnValue({
      subscribe: ({ error }: any) => {
        error('Failed');
      },
    });

    component.ngOnInit();

    expect(component.leaveRequest).toBeNull();

    expect(component.leaveBalance).toBeNull();
  });

  it('should return annual class', () => {
    expect(component.getTypeClass('Annual Leave')).toBe('type-pill type-annual');
  });

  it('should return sick class', () => {
    expect(component.getTypeClass('Sick Leave')).toBe('type-pill type-sick');
  });

  it('should convert leave type to uppercase', () => {
    expect(component.getTypeLabel('annual')).toBe('ANNUAL');
  });

  it('should return default label when type is null', () => {
    expect(component.getTypeLabel(null as any)).toBe('ANNUAL LEAVE');
  });

  it('should format a valid date', () => {
    const result = component.formatDate('2026-07-15');

    expect(result).toBe('Jul 15, 2026');
  });

  it('should return an empty string when date is empty', () => {
    expect(component.formatDate('')).toBe('');
  });

  it('should return original string when date is invalid', () => {
    expect(component.formatDate('Not a date')).toBe('Not a date');
  });

  it('should return approved class', () => {
    expect(component.getStatusClass('APPROVED')).toBe('status-pill status-approved');
  });

  it('should return rejected class', () => {
    expect(component.getStatusClass('REJECTED')).toBe('status-pill status-rejected');
  });

  it('should return cancelled class', () => {
    expect(component.getStatusClass('CANCELLED')).toBe('status-pill status-cancelled');
  });

  it('should return pending class by default', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pill status-pending');
  });

  it('should uppercase the status', () => {
    expect(component.getStatusLabel('approved')).toBe('APPROVED');
  });

  it('should return PENDING when status is null', () => {
    expect(component.getStatusLabel(null as any)).toBe('PENDING');
  });

  it('should return true for parental leave', () => {
    component.leaveRequest = {
      leaveType: 'PARENTAL',
    } as any;

    expect(component.isParentalLeave).toBe(true);
  });

  it('should return false for annual leave', () => {
    component.leaveRequest = {
      leaveType: 'ANNUAL',
    } as any;

    expect(component.isParentalLeave).toBe(false);
  });

  it('should return 0 when there is no request', () => {
    component.leaveRequest = null;

    expect(component.currentStep).toBe(0);
  });

  it('should return step 1 for pending request', () => {
    component.leaveRequest = {
      leaveType: 'ANNUAL',
      status: 'PENDING',
    } as any;

    expect(component.currentStep).toBe(1);
  });

  it('should return step 2 for approved request', () => {
    component.leaveRequest = {
      leaveType: 'ANNUAL',
      status: 'APPROVED',
    } as any;

    expect(component.currentStep).toBe(2);
  });

  it('should return step 2 for rejected request', () => {
    component.leaveRequest = {
      leaveType: 'ANNUAL',
      status: 'REJECTED',
    } as any;

    expect(component.currentStep).toBe(2);
  });

  it('should return step 2 for cancelled request', () => {
    component.leaveRequest = {
      leaveType: 'ANNUAL',
      status: 'CANCELLED',
    } as any;

    expect(component.currentStep).toBe(2);
  });

  it('should return step 1 for parental submitted', () => {
    component.leaveRequest = {
      leaveType: 'PARENTAL',
      stage: 'SUBMITTED',
    } as any;

    expect(component.currentStep).toBe(1);
  });

  it('should return step 2 for waiting manager', () => {
    component.leaveRequest = {
      leaveType: 'PARENTAL',
      stage: 'WAITING_MANAGER',
    } as any;

    expect(component.currentStep).toBe(2);
  });

  it('should return step 3 for completed parental leave', () => {
    component.leaveRequest = {
      leaveType: 'PARENTAL',
      stage: 'COMPLETED',
    } as any;

    expect(component.currentStep).toBe(3);
  });

  it('should cancel request successfully', () => {
    const updatedRequest = {
      id: 1,
      status: 'CANCELLED',
    };

    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.cancelRequest.mockReturnValue(of(updatedRequest));

    component.cancelRequest();

    expect(leaveRequestService.cancelRequest).toHaveBeenCalledWith(1);

    expect(component.leaveRequest).toEqual(updatedRequest);

    expect(leaveBalanceService.clearBalanceCache).toHaveBeenCalled();

    expect(snackBar.open).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  it('should do nothing when no request exists', () => {
    component.leaveRequest = null;

    component.cancelRequest();

    expect(leaveRequestService.cancelRequest).not.toHaveBeenCalled();
  });

  it('should handle cancel request error', () => {
    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.cancelRequest.mockReturnValue({
      subscribe: ({ error }: any) => {
        error('Server Error');
      },
    });

    component.cancelRequest();

    expect(router.navigate).not.toHaveBeenCalled();

    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('should navigate back to requester', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  it('should go back when escape is pressed', () => {
    const goBackSpy = vi.spyOn(component, 'goBack');

    component.onEscape();

    expect(goBackSpy).toHaveBeenCalled();
  });
});
