import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest } from '../components/models/leave-request.model';
import { CreateLeaveRequest } from '../components/models/create-leave-models/create-leave-request.model';
import { EmployeeLeaveRequest } from '../components/models/employee-leave-models/employee-leave-request.model';
import { EmployeeLeaveRequestManager } from '../components/models/employee-leave-models/employee-leave-request-manager.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveRequestService {
  constructor(private readonly http: HttpClient) {}

  // private apiUrl = 'https://leave-management-api-dujj.onrender.com/leave-requests';
  private apiUrl = 'http://localhost:8080/leave-requests';

  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.apiUrl);
  }

  createLeaveRequest(leaveRequest: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, leaveRequest);
  }

  getLeaveRequestById(id: number): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`);
  }

  cancelRequest(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${id}/cancel`, {});
  }

  approveRequest(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/${id}/reject`, {});
  }

  //get api for employees' request from the swagger api endpoint of (thisurl/all). This will be used for the approver to receive all employees' requests
  getAllEmployeeLeaveRequests(): Observable<EmployeeLeaveRequest[]> {
    return this.http.get<EmployeeLeaveRequest[]>(`${this.apiUrl}/all`, {
      params: {
        status: 'PENDING',
      },
    });
  }

  getAllEmployeeLeaveRequestsForManager(): Observable<EmployeeLeaveRequestManager[]> {
    return this.http.get<EmployeeLeaveRequestManager[]>(`${this.apiUrl}/pending-manager`, {
      params: {
        status: 'PENDING',
      },
    });
  }

  // Might implement some of these later
  // updateLeaveRequest(id: number, leaveRequest: LeaveRequest): Observable<LeaveRequest> {
  //   return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}`, leaveRequest);
  // }

  // deleteLeaveRequest(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}
