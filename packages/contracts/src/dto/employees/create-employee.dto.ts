import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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

import { NormalizeEmail, Trim } from '../common/transforms';

export class CreateEmployeeDto {
  @ApiProperty({ minLength: 3, maxLength: 20, example: 'EMP001' })
  @Trim()
  @IsString()
  @Length(3, 20)
  employeeCode: string;

  @ApiProperty({ minLength: 1, maxLength: 100, example: 'Budi Santoso' })
  @Trim()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ format: 'email', maxLength: 150, example: 'budi@wfh.local' })
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(150)
  email: string;

  // bcrypt ignores everything past 72 bytes (not chars), so cap the byte length
  @ApiProperty({ minLength: 8, description: 'At most 72 bytes', example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @IsByteLength(0, 72)
  password: string;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role', default: Role.EMPLOYEE })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
