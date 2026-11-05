import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncOptions } from '@wfh/nest-common/microservice';

import { AttendanceModule } from './attendance/attendance.module';
import { envSchema } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    TypeOrmModule.forRootAsync(typeOrmAsyncOptions),
    AttendanceModule,
  ],
})
export class AppModule {}
