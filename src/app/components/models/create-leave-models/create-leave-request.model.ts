export interface CreateLeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}