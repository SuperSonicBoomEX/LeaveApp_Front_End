import { Injectable, inject } from '@angular/core';
import { LeaveBalance } from '../components/models/leave-balance.model';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LeaveBalanceService {
  constructor(private readonly http: HttpClient) {}
  
  private readonly apiUrl = 'http://localhost:8080/leave-balances';
  private cachedBalances: LeaveBalance[] | null = null;

  getLeaveBalances(forceRefresh = false): Observable<LeaveBalance[]> {
    if (!forceRefresh && this.cachedBalances) {
      console.log('Using Cached Balance');
      return of(this.cachedBalances);
    }

    console.log('Loading Balance From API');

    return this.http.get<LeaveBalance[]>(this.apiUrl).pipe(
      tap((balances) => {
        this.cachedBalances = balances;
      }),
    );
  }

  getEmployeeLeaveBalances(employeeId: number): Observable<LeaveBalance[]> {
    const params = new HttpParams().set('employeeId', employeeId);

    return this.http.get<LeaveBalance[]>(this.apiUrl, { params });
  }

  clearBalanceCache(): void {
    this.cachedBalances = null;
  }
}
