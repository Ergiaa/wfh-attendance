import { SetMetadata } from '@nestjs/common';
import type { Role } from '@wfh/contracts';

export const ROLES = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
