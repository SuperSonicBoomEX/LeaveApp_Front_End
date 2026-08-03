// @vitest-environment jsdom

import '@angular/compiler';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LeaveRequestService } from '../../services/leave-request-service';
import { LeaveBalanceService } from '../../services/leave-balance-service';

import { ApproveDetails } from './approve-details';

describe('ApproveDetails', () => {
  let component: ApproveDetails;

  let route: any;
  let router: any;
  let leaveRequestService: any;
  let leaveBalanceService: any;
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
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
    };

    leaveBalanceService = {
      getEmployeeLeaveBalances: vi.fn(),
    };

    cdr = {
      detectChanges: vi.fn(),
    };

    snackBar = {
      open: vi.fn(),
    };

    component = new ApproveDetails(
      route as ActivatedRoute,
      router as Router,
      leaveRequestService as LeaveRequestService,
      leaveBalanceService as LeaveBalanceService,
      cdr as ChangeDetectorRef,
      snackBar as MatSnackBar,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load request details', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    const request = {
      id: 1,
      employeeId: 5,
      leaveType: 'ANNUAL',
    };

    leaveRequestService.getLeaveRequestById.mockReturnValue(of(request));

    leaveBalanceService.getEmployeeLeaveBalances.mockReturnValue(
      of([
        {
          leaveType: 'ANNUAL',
          availableDays: 10,
        },
      ]),
    );

    component.ngOnInit();

    expect(component.leaveRequest).toEqual(request);

    expect(component.leaveBalance?.leaveType).toBe('ANNUAL');
  });

  it('should not load balance when employee id is missing', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    const request = {
      id: 1,
      leaveType: 'ANNUAL',
      employeeId: null,
    };

    leaveRequestService.getLeaveRequestById.mockReturnValue(of(request));

    component.ngOnInit();

    expect(leaveBalanceService.getEmployeeLeaveBalances).not.toHaveBeenCalled();

    expect(component.leaveBalance).toBeNull();
  });

  it('should handle leave balance loading error', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    const request = {
      id: 1,
      employeeId: 3,
      leaveType: 'ANNUAL',
    };

    leaveRequestService.getLeaveRequestById.mockReturnValue(of(request));

    leaveBalanceService.getEmployeeLeaveBalances.mockReturnValue({
      subscribe: ({ error }: any) => {
        error('Server Error');
      },
    });

    component.ngOnInit();

    expect(component.leaveBalance).toBeNull();
  });

  it('should approve a request', () => {
    const updatedRequest = {
      id: 1,
      status: 'APPROVED',
    };

    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.approveRequest.mockReturnValue(of(updatedRequest));

    component.approveRequest();

    expect(leaveRequestService.approveRequest).toHaveBeenCalledWith(1);

    expect(component.leaveRequest).toEqual(updatedRequest);

    expect(snackBar.open).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/approver']);
  });

  it('should do nothing when no request exists', () => {
    component.leaveRequest = null;

    component.approveRequest();

    expect(leaveRequestService.approveRequest).not.toHaveBeenCalled();
  });

  it('should handle approve errors', () => {
    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.approveRequest.mockReturnValue({
      subscribe: ({ error }: any) => {
        error('Failed');
      },
    });

    component.approveRequest();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should reject a request', () => {
    const updated = {
      id: 1,
      status: 'REJECTED',
    };

    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.rejectRequest.mockReturnValue(of(updated));

    component.rejectRequest();

    expect(leaveRequestService.rejectRequest).toHaveBeenCalledWith(1);

    expect(component.leaveRequest).toEqual(updated);

    expect(router.navigate).toHaveBeenCalledWith(['/approver']);
  });

  it('should not reject when request is null', () => {
    component.leaveRequest = null;

    component.rejectRequest();

    expect(leaveRequestService.rejectRequest).not.toHaveBeenCalled();
  });

  it('should navigate back to approver page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/approver']);
  });

  it('should go back when escape is pressed', () => {
    const goBackSpy = vi.spyOn(component, 'goBack');

    component.onEscape();

    expect(goBackSpy).toHaveBeenCalled();
  });
});
