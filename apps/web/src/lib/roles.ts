import type { EmployeeView, Role } from '@wfh/contracts';

// @wfh/contracts is CommonJS, which Vite won't serve from a linked workspace, so the web app
// imports only its types and mirrors the enum values it needs.
export const HRD_ADMIN = 'HRD_ADMIN' as Role.HRD_ADMIN;
export const EMPLOYEE = 'EMPLOYEE' as Role.EMPLOYEE;

export const ROLE_LABELS: Record<Role, string> = {
  [HRD_ADMIN]: 'HRD Admin',
  [EMPLOYEE]: 'Employee',
};

export function isHrdAdmin(user: Pick<EmployeeView, 'role'>): boolean {
  return user.role === HRD_ADMIN;
}
