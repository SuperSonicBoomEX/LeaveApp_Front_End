// @vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LeaveBalance } from '../components/models/leave-balance.model';
import { LeaveBalanceService } from './leave-balance-service';

describe('LeaveBalanceService', () => {
  let service: LeaveBalanceService;
  let http: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      get: vi.fn(),
    };

    service = new LeaveBalanceService(http as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('caches balances after the first API load', () => {
    const balances: LeaveBalance[] = [
      {
        leaveType: 'ANNUAL',
        year: 2026,
        totalDays: 20,
        reservedDays: 3,
        usedDays: 5,
        availableDays: 12,
      } as LeaveBalance,
    ];

    http.get.mockReturnValue(of(balances));

    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    expect(http.get).toHaveBeenCalledWith('http://localhost:8080/leave-balances');
  });

  it('should use cached balances on subsequent calls', () => {
    const balances: LeaveBalance[] = [
      {
        leaveType: 'ANNUAL',
        year: 2026,
        totalDays: 20,
        reservedDays: 3,
        usedDays: 5,
        availableDays: 12,
      } as LeaveBalance,
    ];

    http.get.mockReturnValue(of(balances));

    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Call getLeaveBalances again to test caching
    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Verify that the HTTP GET method was called only once, indicating that the cached data was used for the second call
    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('should reload balances from the API when forceRefresh is true', () => {
    const balances: LeaveBalance[] = [
      {
        leaveType: 'ANNUAL',
        year: 2026,
        totalDays: 20,
        reservedDays: 3,
        usedDays: 5,
        availableDays: 12,
      } as LeaveBalance,
    ];

    http.get.mockReturnValue(of(balances));

    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Call getLeaveBalances with forceRefresh set to true
    service.getLeaveBalances(true).subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Verify that the HTTP GET method was called twice, indicating that the API was called again due to forceRefresh
    expect(http.get).toHaveBeenCalledTimes(2);
  });

  // This test case verifies that the LeaveBalanceService fetches employee leave balances from the API correctly. It mocks the HTTP GET request to return an empty array and checks that the result of the getEmployeeLeaveBalances method matches the expected empty array. Additionally, it verifies that the HTTP GET method was called with the correct URL and query parameters for fetching the employee leave balances.
  it('should fetch an employee leave balances from the API', () => {
    http.get.mockReturnValue(of([]));

    service.getEmployeeLeaveBalances(1).subscribe((result) => {
      expect(result).toEqual([]);
    });

    expect(http.get).toHaveBeenCalledTimes(1);

    const expectedUrl = 'http://localhost:8080/leave-balances';
    const [url, options] = http.get.mock.calls[0];

    expect(url).toBe(expectedUrl);

    expect(options.params.get('employeeId')).toBe('1');
  });

  it('should clear the cached balances', () => {
    const balances: LeaveBalance[] = [
      {
        leaveType: 'ANNUAL',
        year: 2026,
        totalDays: 20,
        reservedDays: 3,
        usedDays: 5,
        availableDays: 12,
      } as LeaveBalance,
    ];

    http.get.mockReturnValue(of(balances));

    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Clear the cached balances
    service.clearBalanceCache();

    // Call getLeaveBalances again to test that the cache has been cleared
    service.getLeaveBalances().subscribe((result) => {
      expect(result).toEqual(balances);
    });

    // Verify that the HTTP GET method was called twice, indicating that the API was called again after clearing the cache
    expect(http.get).toHaveBeenCalledTimes(2);
  });
});
