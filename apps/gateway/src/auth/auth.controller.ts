import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { EmployeeView, LoginResponse } from '@wfh/contracts';
import { ValidateCredentialsDto } from '@wfh/contracts/dto';

import { ResponseMessage } from '../common/http/response-message.decorator';
import type { AuthUser } from './auth-user';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ResponseMessage('Login successful')
  login(@Body() credentials: ValidateCredentialsDto): Promise<LoginResponse> {
    return this.auth.login(credentials);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<EmployeeView> {
    return this.auth.me(user);
  }
}
