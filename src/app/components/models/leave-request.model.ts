export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  stage: string;
  reason: string;
  createdAt: string;
  decidedBy: string;
  decidedAt: string;
}
