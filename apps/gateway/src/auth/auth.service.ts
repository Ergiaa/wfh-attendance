import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { EmployeeView, LoginResponse } from '@wfh/contracts';
import type { ValidateCredentialsDto } from '@wfh/contracts/dto';

import { EmployeesClient } from '../employees/employees.client';
import type { AuthUser, JwtPayload } from './auth-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly employees: EmployeesClient,
    private readonly jwt: JwtService,
  ) {}

  async login(credentials: ValidateCredentialsDto): Promise<LoginResponse> {
    const employee = await this.employees.validate(credentials);
    const payload: JwtPayload = { sub: employee.id, role: employee.role };
    return { accessToken: await this.jwt.signAsync(payload), employee };
  }

  me(user: AuthUser): Promise<EmployeeView> {
    return this.employees.findOne(user.id);
  }
}
