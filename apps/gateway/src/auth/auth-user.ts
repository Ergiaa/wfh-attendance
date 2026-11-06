import type { EmployeeView } from '@wfh/contracts';
import type { Request } from 'express';

// Loaded fresh on every request, so role and active status reflect the database, not the token.
export type AuthUser = EmployeeView;

export interface JwtPayload {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
