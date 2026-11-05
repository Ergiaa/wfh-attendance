import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { serviceEnvSchema, typeOrmAsyncOptions } from '@wfh/nest-common/microservice';

import { migrations } from './database/migrations';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: serviceEnvSchema({ port: 4001 }) }),
    TypeOrmModule.forRootAsync(typeOrmAsyncOptions(migrations)),
    EmployeesModule,
  ],
})
export class AppModule {}
