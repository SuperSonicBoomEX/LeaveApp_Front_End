// @vitest-environment jsdom

import '@angular/compiler';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveRequestService } from '../../../services/leave-request-service';
import { ManageBoard } from './manage-board';

describe('ApproveBoard', () => {
  let component: ManageBoard;

  let router: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let leaveRequestService: {
    getAllEmployeeLeaveRequestsForManager: ReturnType<typeof vi.fn>;
    approveRequest: ReturnType<typeof vi.fn>;
    rejectRequest: ReturnType<typeof vi.fn>;
  };

  let snackBar: {
    open: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    router = {
      navigate: vi.fn(),
    };

    leaveRequestService = {
      getAllEmployeeLeaveRequestsForManager: vi.fn(),
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
    };

    snackBar = {
      open: vi.fn(),
    };

    component = new ManageBoard(router as any, leaveRequestService as any, snackBar as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load only pending requests', () => {
    const requests = [
      {
        id: 1,
        status: 'PENDING',
      },
      {
        id: 2,
        status: 'APPROVED',
      },
      {
        id: 3,
        status: 'pending',
      },
    ];

    leaveRequestService.getAllEmployeeLeaveRequestsForManager.mockReturnValue(of(requests));

    component.ngOnInit();

    expect(component.employeeRequests.length).toBe(2);

    expect(component.selectedRequest).toEqual(requests[0]);

    expect(component.dataSource.data.length).toBe(2);
  });

  it('should format a valid date', () => {
    expect(component.formatDate('2026-07-01')).toBe('Jul 1, 2026');
  });

  it('should return empty string for empty date', () => {
    expect(component.formatDate('')).toBe('');
  });

  it('should return original string for invalid date', () => {
    expect(component.formatDate('hello')).toBe('hello');
  });

  it('should return annual class', () => {
    expect(component.getTypeClass('Annual Leave')).toBe('type-pill type-annual');
  });

  it('should return sick class', () => {
    expect(component.getTypeClass('Sick Leave')).toBe('type-pill type-sick');
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

  it('should return pending class', () => {
    expect(component.getStatusClass('PENDING')).toBe('status-pill status-pending');
  });

  it('should select a request', () => {
    const request = {
      id: 99,
    };

    component.selectRequest(request as any);

    expect(component.selectedRequest).toEqual(request);
  });

  it('should navigate to manage details', () => {
    const request = {
      id: 99,
    };

    component.viewRequest(request as any);

    expect(component.selectedRequest).toEqual(request);

    expect(router.navigate).toHaveBeenCalledWith(['/manage-details', 99]);
  });

  it('should approve a request', () => {
    leaveRequestService.approveRequest.mockReturnValue(of({}));

    leaveRequestService.getAllEmployeeLeaveRequestsForManager.mockReturnValue(of([]));

    component.approveRequest({
      id: 1,
    } as any);

    expect(leaveRequestService.approveRequest).toHaveBeenCalledWith(1);

    expect(snackBar.open).toHaveBeenCalledWith('Leave Request Has Been Approved!', 'Close', {
      duration: 3000,
    });
  });

  it('should reject a request', () => {
    leaveRequestService.rejectRequest.mockReturnValue(of({}));

    leaveRequestService.getAllEmployeeLeaveRequestsForManager.mockReturnValue(of([]));

    component.rejectRequest({
      id: 1,
    } as any);

    expect(leaveRequestService.rejectRequest).toHaveBeenCalledWith(1);

    expect(snackBar.open).toHaveBeenCalledWith('Leave Request Has Been Rejected!', 'Close', {
      duration: 3000,
    });
  });
});