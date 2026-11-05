import {
  IsBoolean,
  IsByteLength,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../role';

import { NormalizeEmail, Trim } from '../transforms';
import { EmployeeIdDto } from './employee-id.dto';

// employeeCode is deliberately not updatable
export class UpdateEmployeeDto extends EmployeeIdDto {
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @IsByteLength(0, 72)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
