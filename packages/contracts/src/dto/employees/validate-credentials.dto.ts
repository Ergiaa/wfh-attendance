import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { NormalizeEmail } from '../common/transforms';

export class ValidateCredentialsDto {
  @ApiProperty({ format: 'email', example: 'admin@wfh.local' })
  @NormalizeEmail()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
