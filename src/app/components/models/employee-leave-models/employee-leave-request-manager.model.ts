export interface EmployeeLeaveRequestManager {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeUsername: string;
  leaveType: string;
  status: string;
  stage: string;
  days: number;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
  decidedBy: string;
  decidedAt: string;
}
