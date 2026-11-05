import type { Role } from './role';

// Dates are ISO strings because payloads are JSON-serialized over TCP.
export interface EmployeeView {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Internal shape returned by attendance-service; photoKey never leaves the gateway.
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  workDate: string;
  checkedInAt: string;
  photoKey: string;
}

export interface AttendanceView extends Omit<AttendanceRecord, 'photoKey'> {
  photoUrl: string;
}
