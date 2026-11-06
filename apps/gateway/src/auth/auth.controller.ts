import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { EmployeeView, LoginResponse } from '@wfh/contracts';
import { ValidateCredentialsDto } from '@wfh/contracts/dto';

import { ResponseMessage } from '../common/http/response-message.decorator';
import { ApiEnvelope, ApiErrors } from '../docs/decorators';
import { EmployeeModel, LoginModel } from '../docs/models';
import type { AuthUser } from './auth-user';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Log in', description: 'Public. Limited to 5 attempts per minute.' })
  @ApiEnvelope(LoginModel)
  @ApiErrors(400, 401, 429)
  login(@Body() credentials: ValidateCredentialsDto): Promise<LoginResponse> {
    return this.auth.login(credentials);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current employee' })
  @ApiEnvelope(EmployeeModel)
  @ApiErrors(401)
  me(@CurrentUser() user: AuthUser): EmployeeView {
    return user;
  }
}
