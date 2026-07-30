import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployeeResponse } from '../components/models/employee-leave-models/employee-response.model';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';
import { of } from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly apiUrl = 'http://localhost:8080/employees';
  private cachedEmployees: Map<number, EmployeeResponse> = new Map();

  constructor(private http: HttpClient) {}

  getEmployee(id: number): Observable<EmployeeResponse> {
    const cached = this.cachedEmployees.get(id);
    if (cached) {
      console.log(`Using cached employee data for ID: ${id}`);
      return of(cached);
    }

    console.log(`Fetching employee data from API for ID: ${id}`);

    return this.http.get<EmployeeResponse>(`${this.apiUrl}/${id}`).pipe(
      tap((employee) => {
        this.cachedEmployees.set(id, employee);
      }),
    );
  }

  clearEmployeesCache(): void {
    this.cachedEmployees.clear();
  }
}
