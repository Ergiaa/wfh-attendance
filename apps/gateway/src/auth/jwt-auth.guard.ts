import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { EmployeesClient } from '../employees/employees.client';
import type { AuthenticatedRequest, AuthUser, JwtPayload } from './auth-user';
import { IS_PUBLIC } from './decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly employees: EmployeesClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Your session has expired');
    }

    request.user = await this.loadActiveEmployee(payload.sub);
    return true;
  }

  private async loadActiveEmployee(id: string): Promise<AuthUser> {
    const inactive = new UnauthorizedException('Your account is no longer active');
    const employee = await this.employees.findOne(id).catch((error: unknown) => {
      // Soft-deleted employees come back as 404; anything else (e.g. service down) propagates.
      throw error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND
        ? inactive
        : error;
    });
    if (!employee.isActive) {
      throw inactive;
    }
    return employee;
  }
}

function extractBearerToken(request: Request): string | undefined {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : undefined;
}
