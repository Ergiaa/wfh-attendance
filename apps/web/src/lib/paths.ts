import type { EmployeeView } from '@wfh/contracts';

import { isHrdAdmin } from './roles';

export const paths = {
  login: '/login',
  checkIn: '/check-in',
  myAttendance: '/my-attendance',
  employees: '/admin/employees',
  attendance: '/admin/attendance',
} as const;

export function homePathFor(user: Pick<EmployeeView, 'role'>): string {
  return isHrdAdmin(user) ? paths.employees : paths.checkIn;
}
