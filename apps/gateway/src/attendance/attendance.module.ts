import { Module } from '@nestjs/common';

import { registerTcpClient } from '../common/rpc/tcp-client.module';
import { EmployeesModule } from '../employees/employees.module';
import { PhotosModule } from '../photos/photos.module';
import { ATTENDANCE_SERVICE, AttendanceClient } from './attendance.client';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [
    registerTcpClient(ATTENDANCE_SERVICE, {
      host: 'ATTENDANCE_SERVICE_HOST',
      port: 'ATTENDANCE_SERVICE_PORT',
    }),
    EmployeesModule,
    PhotosModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceClient, AttendanceService],
})
export class AttendanceModule {}
