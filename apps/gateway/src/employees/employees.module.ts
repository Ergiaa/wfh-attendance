import { Module } from '@nestjs/common';

import { registerTcpClient } from '../common/rpc/tcp-client.module';
import { EMPLOYEES_SERVICE, EmployeesClient } from './employees.client';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [
    registerTcpClient(EMPLOYEES_SERVICE, {
      host: 'EMPLOYEES_SERVICE_HOST',
      port: 'EMPLOYEES_SERVICE_PORT',
    }),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesClient],
  exports: [EmployeesClient],
})
export class EmployeesModule {}
