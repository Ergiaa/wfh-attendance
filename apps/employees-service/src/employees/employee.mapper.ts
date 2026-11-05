import type { EmployeeView } from '@wfh/contracts';

import type { Employee } from './employee.entity';

export function toEmployeeView(employee: Employee): EmployeeView {
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    isActive: employee.isActive,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
}
