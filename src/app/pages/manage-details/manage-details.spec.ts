import '@angular/compiler';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LeaveRequestService } from '../../services/leave-request-service';
import { LeaveBalanceService } from '../../services/leave-balance-service';
import { EmployeesService } from '../../services/employees-service';

import { ManageDetails } from './manage-details';

describe('ManageDetails', () => {
  let component: ManageDetails;

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
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
    };

    leaveBalanceService = {
      getEmployeeLeaveBalances: vi.fn(),
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

    component = new ManageDetails(
      route,
      router,
      leaveRequestService,
      leaveBalanceService,
      employeeService,
      cdr,
      snackBar,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow actions for pending requests', () => {
    component.leaveRequest = {
      status: 'PENDING',
    } as any;

    expect(component.canActOnRequest).toBe(true);
  });

  it('should not allow actions for approved requests', () => {
    component.leaveRequest = {
      status: 'APPROVED',
    } as any;

    expect(component.canActOnRequest).toBe(false);
  });

  it('should not allow actions when request is null', () => {
    component.leaveRequest = null;

    expect(component.canActOnRequest).toBe(false);
  });

  it('should load request details', () => {
    route.snapshot.paramMap.get.mockReturnValue('1');

    const request = {
      id: 1,
      employeeId: 5,
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

    leaveBalanceService.getEmployeeLeaveBalances.mockReturnValue(
      of([
        {
          leaveType: 'ANNUAL',
        },
      ]),
    );

    component.ngOnInit();

    expect(component.leaveRequest).toEqual(request);

    expect(component.decidedByName).toBe('John Smith');

    expect(component.leaveBalance?.leaveType).toBe('ANNUAL');
  });

  it('should approve a request', () => {
    const updated = {
      id: 1,
      status: 'APPROVED',
    };

    component.leaveRequest = {
      id: 1,
    } as any;

    leaveRequestService.approveRequest.mockReturnValue(of(updated));

    component.approveRequest();

    expect(leaveRequestService.approveRequest).toHaveBeenCalledWith(1);

    expect(component.leaveRequest).toEqual(updated);

    expect(snackBar.open).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/manager']);
  });

  it('should not approve when request is null', () => {
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

    expect(component.leaveRequest).toEqual(updated);

    expect(router.navigate).toHaveBeenCalledWith(['/manager']);
  });

  it('should navigate back to manager page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/manager']);
  });

  it('should call goBack when escape is pressed', () => {
    const spy = vi.spyOn(component, 'goBack');

    component.onEscape();

    expect(spy).toHaveBeenCalled();
  });
});
