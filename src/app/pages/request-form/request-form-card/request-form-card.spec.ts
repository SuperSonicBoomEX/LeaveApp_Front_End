// @vitest-environment jsdom

import '@angular/compiler';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LeaveRequestService } from '../../../services/leave-request-service';
import { LeaveBalanceService } from '../../../services/leave-balance-service';

import { RequestFormCard } from './request-form-card';

describe('RequestFormCard', () => {
  let component: RequestFormCard;

  let leaveRequestService: any;
  let leaveBalanceService: any;
  let router: any;
  let cdr: any;
  let snackBar: any;

  beforeEach(() => {
    leaveRequestService = {
      createLeaveRequest: vi.fn(),
    };

    leaveBalanceService = {
      clearBalanceCache: vi.fn(),
    };

    router = {
      navigate: vi.fn(),
    };

    cdr = {
      detectChanges: vi.fn(),
    };

    snackBar = {
      open: vi.fn(),
    };

    component = new RequestFormCard(
      leaveRequestService,
      leaveBalanceService,
      router,
      cdr,
      snackBar,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit a leave request successfully', () => {
    component.leaveType = 'ANNUAL';
    component.startDate = '2026-08-01';
    component.endDate = '2026-08-03';
    component.reason = 'Vacation';

    leaveRequestService.createLeaveRequest.mockReturnValue(of({}));

    component.submitRequest();

    expect(leaveRequestService.createLeaveRequest).toHaveBeenCalledWith({
      leaveType: 'ANNUAL',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      reason: 'Vacation',
    });

    expect(component.leaveType).toBe('');
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.reason).toBe('');

    expect(leaveBalanceService.clearBalanceCache).toHaveBeenCalled();

    expect(snackBar.open).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  it('should submit without a reason', () => {
    component.leaveType = 'SICK';
    component.startDate = '2026-08-01';
    component.endDate = '2026-08-02';

    leaveRequestService.createLeaveRequest.mockReturnValue(of({}));

    component.submitRequest();

    expect(leaveRequestService.createLeaveRequest).toHaveBeenCalledWith({
      leaveType: 'SICK',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
    });
  });

  it('should show insufficient balance message', () => {
    leaveRequestService.createLeaveRequest.mockReturnValue({
      subscribe: ({ error }: any) => {
        error({
          error: {
            errorCode: 'INSUFFICIENT_BALANCE',
          },
        });
      },
    });

    component.submitRequest();

    expect(component.errorMessage).toBe('Your current balance is not enough for this request!');

    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('should show weekend error', () => {
    leaveRequestService.createLeaveRequest.mockReturnValue({
      subscribe: ({ error }: any) => {
        error({
          error: {
            errorCode: 'WEEKEND_NOT_ALLOWED',
          },
        });
      },
    });

    component.submitRequest();

    expect(component.errorMessage).toBe('Weekend dates are not allowed for leave request!');
  });

  it('should allow weekdays', () => {
    expect(component.weekdaysOnly(new Date('2026-08-03'))).toBe(true);
  });

  it('should reject weekends', () => {
    expect(component.weekdaysOnly(new Date('2026-08-02'))).toBe(false);
  });

  it('should clear end date when it is before start date', () => {
    component.startDate = '2026-08-10';
    component.endDate = '2026-08-05';

    component.onStartDateChange();

    expect(component.endDate).toBe('');
  });

  it('should keep end date when valid', () => {
    component.startDate = '2026-08-05';
    component.endDate = '2026-08-10';

    component.onStartDateChange();

    expect(component.endDate).toBe('2026-08-10');
  });

  it('should convert string to Date', () => {
    const date = component.StringtoDate('2026-08-01');

    expect(date).toBeInstanceOf(Date);

    expect(date.getFullYear()).toBe(2026);
  });

  it('should disable submit when empty', () => {
    expect(component.isSubmitDisabled()).toBe(true);
  });

  it('should enable submit when all fields are filled', () => {
    component.leaveType = 'ANNUAL';
    component.startDate = '2026-08-01';
    component.endDate = '2026-08-02';

    expect(component.isSubmitDisabled()).toBe(false);
  });

  it('should cancel the request and reset the form', () => {
    component.leaveType = 'ANNUAL';
    component.startDate = '2026-08-01';
    component.endDate = '2026-08-02';
    component.reason = 'Holiday';

    component.cancelRequest();

    expect(component.leaveType).toBe('');
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
    expect(component.reason).toBe('');

    expect(leaveBalanceService.clearBalanceCache).toHaveBeenCalled();

    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  it('should cancel when Escape is pressed', () => {
    const spy = vi.spyOn(component, 'cancelRequest');

    component.onEscape();

    expect(spy).toHaveBeenCalled();
  });
});
