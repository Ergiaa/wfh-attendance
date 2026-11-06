import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Role,
  type ApiErrorResponse,
  type AttendanceView,
  type EmployeeView,
  type LoginResponse,
} from '@wfh/contracts';

// Response shapes are interfaces in @wfh/contracts, which Swagger can't reflect. These classes
// exist only for the docs; `implements` keeps them from drifting out of sync with the real types.

export class EmployeeModel implements EmployeeView {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'EMP001' })
  employeeCode: string;

  @ApiProperty({ example: 'Budi Santoso' })
  name: string;

  @ApiProperty({ format: 'email', example: 'budi@wfh.local' })
  email: string;

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}

export class AttendanceModel implements AttendanceView {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  employeeId: string;

  @ApiProperty({ description: 'As it was at check-in time', example: 'EMP001' })
  employeeCode: string;

  @ApiProperty({ description: 'As it was at check-in time', example: 'Budi Santoso' })
  employeeName: string;

  @ApiProperty({ format: 'date', description: 'Day in WORK_TIMEZONE', example: '2026-11-06' })
  workDate: string;

  @ApiProperty({ format: 'date-time', description: 'Recorded by the server' })
  checkedInAt: string;

  @ApiProperty({ example: '/api/attendance/{id}/photo', description: 'Needs the bearer token' })
  photoUrl: string;
}

export class LoginModel implements LoginResponse {
  @ApiProperty({ description: 'JWT for the Authorization: Bearer header' })
  accessToken: string;

  @ApiProperty({ type: EmployeeModel })
  employee: EmployeeModel;
}

export class ApiErrorModel implements ApiErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Per-field messages, present on validation errors',
    example: ['email must be an email'],
  })
  errors?: string[];
}
