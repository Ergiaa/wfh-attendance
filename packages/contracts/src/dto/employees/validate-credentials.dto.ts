import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { NormalizeEmail } from '../common/transforms';

export class ValidateCredentialsDto {
  @NormalizeEmail()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
