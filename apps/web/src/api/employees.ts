import type { EmployeeView, Paginated } from '@wfh/contracts';
import type { CreateEmployeeDto, ListEmployeesDto, UpdateEmployeeDto } from '@wfh/contracts/dto';

import { request } from './client';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (query: ListEmployeesDto) => ['employees', 'list', query] as const,
};

export function fetchEmployees(
  query: ListEmployeesDto,
  signal?: AbortSignal,
): Promise<Paginated<EmployeeView>> {
  return request('/employees', { query, signal });
}

export function createEmployee(dto: CreateEmployeeDto): Promise<EmployeeView> {
  return request('/employees', { method: 'POST', body: dto });
}

export function updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<EmployeeView> {
  return request(`/employees/${id}`, { method: 'PATCH', body: dto });
}

export function deleteEmployee(id: string): Promise<EmployeeView> {
  return request(`/employees/${id}`, { method: 'DELETE' });
}
