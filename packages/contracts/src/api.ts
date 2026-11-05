import type { EmployeeView } from './views';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errors?: string[];
}

export interface LoginResponse {
  accessToken: string;
  employee: EmployeeView;
}
