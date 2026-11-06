import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { LoginResponse } from '@wfh/contracts';
import type { ValidateCredentialsDto } from '@wfh/contracts/dto';

import { EmployeesClient } from '../employees/employees.client';
import type { JwtPayload } from './auth-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly employees: EmployeesClient,
    private readonly jwt: JwtService,
  ) {}

  async login(credentials: ValidateCredentialsDto): Promise<LoginResponse> {
    const employee = await this.employees.validate(credentials);
    const payload: JwtPayload = { sub: employee.id };
    return { accessToken: await this.jwt.signAsync(payload), employee };
  }
}
