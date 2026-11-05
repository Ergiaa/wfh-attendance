import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import type { Env } from '../config/env';
import { EMPLOYEES_SERVICE, EmployeesClient } from './employees.client';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: EMPLOYEES_SERVICE,
        inject: [ConfigService],
        useFactory: (config: ConfigService<Env, true>) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('EMPLOYEES_SERVICE_HOST', { infer: true }),
            port: config.get('EMPLOYEES_SERVICE_PORT', { infer: true }),
          },
        }),
      },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesClient],
  exports: [EmployeesClient],
})
export class EmployeesModule {}
