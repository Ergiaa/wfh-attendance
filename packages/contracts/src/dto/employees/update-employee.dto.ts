import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsByteLength,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../role';

import { NormalizeEmail, Trim } from '../common/transforms';

// employeeCode is deliberately not updatable
export class UpdateEmployeeDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100 })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ format: 'email', maxLength: 150 })
  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ minLength: 8, description: 'At most 72 bytes' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @IsByteLength(0, 72)
  password?: string;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmployeePayload extends UpdateEmployeeDto {
  @IsUUID('7')
  id: string;
}
