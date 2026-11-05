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
  @Trim()
  @IsString()
  @Length(3, 20)
  employeeCode: string;

  @Trim()
  @IsString()
  @Length(1, 100)
  name: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(150)
  email: string;

  // bcrypt ignores everything past 72 bytes (not chars), so cap the byte length
  @IsString()
  @MinLength(8)
  @IsByteLength(0, 72)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
