// vitest-environment jsdom

import '@angular/compiler';
import { describe, expect, it, vi, beforeEach} from 'vitest';
import { of } from 'rxjs';

import { HttpClient } from '@angular/common/http';

import { EmployeesService } from './employees-service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let http: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      get: vi.fn(),
    };

    service = new EmployeesService(http as unknown as HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // This test case verifies that the EmployeesService fetches employee data from the API correctly. It mocks the HTTP GET request to return a mock employee object and checks that the result of the getEmployee method matches the expected mock employee data. Additionally, it verifies that the HTTP GET method was called with the correct URL for fetching the employee data.
  it('should fetch employees name from API', () => {
    const mockEmployee = {
      id: 1,
      name: 'Ethan Requester',
    };

    http.get.mockReturnValue(of(mockEmployee));

    service.getEmployee(1).subscribe(result => {
      expect(result).toEqual(mockEmployee);
    });

    expect(http.get).toHaveBeenCalledWith(
      'http://localhost:8080/employees/1'
    );
  });

  // This test case verifies that the EmployeesService uses the cached employee data on the second call to getEmployee. It mocks the HTTP GET request to return a mock employee object and checks that the HTTP GET method is only called once, indicating that the cached data was used for the second call.
  it('should use cached employee on second call', () => {
    const mockEmployee = {
      id: 1,
      name: 'Ethan Requester'
    };

    http.get.mockReturnValue(of(mockEmployee));

    service.getEmployee(1).subscribe();
    service.getEmployee(1).subscribe();

    // Verify that the HTTP GET method was called only once, indicating that the cached data was used for the second call
    expect(http.get).toHaveBeenCalledTimes(1);
  })
});
