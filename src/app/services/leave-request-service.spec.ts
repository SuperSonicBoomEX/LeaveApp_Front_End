// @vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LeaveRequestService } from './leave-request-service';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;
  let http: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      get: vi.fn(),
      post: vi.fn(),
    };

    service = new LeaveRequestService(http as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch leave requests from API', () => {
    const mockLeaveRequests = [
      {
        id: 1,
        employeeId: 1,
        leaveType: 'ANNUAL',
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        status: 'PENDING',
      },
    ];

    http.get.mockReturnValue(of(mockLeaveRequests));

    service.getLeaveRequests().subscribe((result) => {
      expect(result).toEqual(mockLeaveRequests);
    });

    expect(http.get).toHaveBeenCalledWith('http://localhost:8080/leave-requests');
  });

  it('should create a leave request via API', () => {
    const newLeaveRequest = {
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-02-01',
      endDate: '2026-02-05',
    };

    const mockResponse = {
      id: 2,
      ...newLeaveRequest,
      status: 'PENDING',
    };

    http.post.mockReturnValue(of(mockResponse));

    service.createLeaveRequest(newLeaveRequest).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(http.post).toHaveBeenCalledWith('http://localhost:8080/leave-requests', newLeaveRequest);
  });

  it('should fetch a leave request by ID from API', () => {
    const leaveRequestId = 1;
    const mockLeaveRequest = {
      id: leaveRequestId,
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'PENDING',
    };

    http.get.mockReturnValue(of(mockLeaveRequest));

    service.getLeaveRequestById(leaveRequestId).subscribe((result) => {
      expect(result).toEqual(mockLeaveRequest);
    });

    expect(http.get).toHaveBeenCalledWith(`http://localhost:8080/leave-requests/${leaveRequestId}`);
  });

  it('should cancel a leave request via API', () => {
    const leaveRequestId = 1;
    const mockResponse = {
      id: leaveRequestId,
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'CANCELLED',
    };

    http.post.mockReturnValue(of(mockResponse));

    service.cancelRequest(leaveRequestId).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(http.post).toHaveBeenCalledWith(`http://localhost:8080/leave-requests/${leaveRequestId}/cancel`, {});
  });

  it('should approve a leave request via API', () => {
    const leaveRequestId = 1;
    const mockResponse = {
      id: leaveRequestId,
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'APPROVED',
    };

    http.post.mockReturnValue(of(mockResponse));

    service.approveRequest(leaveRequestId).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(http.post).toHaveBeenCalledWith(`http://localhost:8080/leave-requests/${leaveRequestId}/approve`, {});
  });

  it('should reject a leave request via API', () => {
    const leaveRequestId = 1;
    const mockResponse = {
      id: leaveRequestId,
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'REJECTED',
    };

    http.post.mockReturnValue(of(mockResponse));

    service.rejectRequest(leaveRequestId).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    expect(http.post).toHaveBeenCalledWith(`http://localhost:8080/leave-requests/${leaveRequestId}/reject`, {});
  });

  it('should fetch all employee leave requests from API', () => {
    const mockEmployeeLeaveRequests = [
      {
        id: 1,
        employeeId: 1,
        leaveType: 'ANNUAL',
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        status: 'PENDING',
      },
    ];

    http.get.mockReturnValue(of(mockEmployeeLeaveRequests));

    service.getAllEmployeeLeaveRequests().subscribe((result) => {
      expect(result).toEqual(mockEmployeeLeaveRequests);
    });

    expect(http.get).toHaveBeenCalledWith('http://localhost:8080/leave-requests/all', {
      params: {
        status: 'PENDING',
      },
    });
  });

  it('should fetch all employee leave requests for manager from API', () => {
    const mockEmployeeLeaveRequestsForManager = [
      {
        id: 1,
        employeeId: 1,
        leaveType: 'ANNUAL',
        startDate: '2026-01-01',
        endDate: '2026-01-05',
        status: 'PENDING',
      },
    ];

    http.get.mockReturnValue(of(mockEmployeeLeaveRequestsForManager));

    service.getAllEmployeeLeaveRequestsForManager().subscribe((result) => {
      expect(result).toEqual(mockEmployeeLeaveRequestsForManager);
    });

    expect(http.get).toHaveBeenCalledWith('http://localhost:8080/leave-requests/pending-manager', {
      params: {
        status: 'PENDING',
      },
    });
  });
});
