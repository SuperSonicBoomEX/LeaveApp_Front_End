// @vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { NavBar } from './nav-bar';

describe('NavBar', () => {
  let component: NavBar;
  let authService: {
    getUserId:ReturnType<typeof vi.fn>;
    getUsername: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  }
  let employeeService: {
    getEmployee: ReturnType<typeof vi.fn>;
    clearEmployeesCache: ReturnType<typeof vi.fn>;
  }
  let leaveBalanceService: {
    clearBalanceCache: ReturnType<typeof vi.fn>;
  }
  let router: {
    navigate: ReturnType<typeof vi.fn>;
  }
  let snackBar: {
    open: ReturnType<typeof vi.fn>;
  }
  let cdr: {
    detectChanges: ReturnType<typeof vi.fn>;
  }

  beforeEach(() => {
    authService = {
      getUserId: vi.fn(),
      getUsername: vi.fn(),
      logout: vi.fn(),
    };
    employeeService = {
      getEmployee: vi.fn(),
      clearEmployeesCache: vi.fn(),
    };
    leaveBalanceService = {
      clearBalanceCache: vi.fn(),
    };
    router = {
      navigate: vi.fn(),
    };
    snackBar = {
      open: vi.fn(),
    };
    cdr = {
      detectChanges: vi.fn(),
    };

    component = new NavBar(
      authService as any,
      employeeService as any,
      router as any,
      snackBar as any,
      cdr as any,
      leaveBalanceService as any
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the correct username', () => {
    component.displayName = 'testuser';
    expect(component.username).toBe('testuser');
  });

  it('should set displayName to username when userId is not available', () => {
    authService.getUserId.mockReturnValue(null);
    authService.getUsername.mockReturnValue('testuser');

    component.ngOnInit();

    expect(component.displayName).toBe('testuser');
  });

  it('should load employee details and set displayName when userId is available', () => {
    const mockEmployee = { name: 'John Doe' };
    authService.getUserId.mockReturnValue(1);
    employeeService.getEmployee.mockReturnValue(of(mockEmployee));

    component.ngOnInit();

    expect(employeeService.getEmployee).toHaveBeenCalledWith(1);
    expect(component.displayName).toBe('John Doe');
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('should use username when employee details fail to load', () => {
    authService.getUserId.mockReturnValue(1);
    authService.getUsername.mockReturnValue('testuser');
    employeeService.getEmployee.mockReturnValue({
      subscribe: ({ error }: { error: () => void }) => {
        error();
      },
  
    });

    component.ngOnInit();

    expect(component.displayName).toBe('testuser');
  });

  it('should clear caches and logout on logout', () => {
    component.logout();

    expect(leaveBalanceService.clearBalanceCache).toHaveBeenCalled();
    expect(employeeService.clearEmployeesCache).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'You Have Successfully Logged Out Your Account!',
      'Close',
      { duration: 3000 }
    );
  });

  it('should navigate to requester on toRequester', () => {
    component.toRequester();
    expect(router.navigate).toHaveBeenCalledWith(['/requester']);
  });

  it('should navigate to request form on toRequestForm', () => {
    component.toRequestForm();
    expect(router.navigate).toHaveBeenCalledWith(['/request-form']);
  });
});
