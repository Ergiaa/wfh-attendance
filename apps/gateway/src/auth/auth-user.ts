import type { Role } from '@wfh/contracts';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
