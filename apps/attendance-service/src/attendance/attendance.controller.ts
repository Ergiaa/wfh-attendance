import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ATTENDANCE, type AttendanceRecord, type Paginated } from '@wfh/contracts';
import {
  AttendanceIdDto,
  CheckInPayload,
  ListAttendanceDto,
  ListMyAttendancePayload,
} from '@wfh/contracts/dto';

import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern(ATTENDANCE.checkIn)
  checkIn(@Payload() payload: CheckInPayload): Promise<AttendanceRecord> {
    return this.attendanceService.checkIn(payload);
  }

  @MessagePattern(ATTENDANCE.findMine)
  findMine(@Payload() payload: ListMyAttendancePayload): Promise<Paginated<AttendanceRecord>> {
    return this.attendanceService.findMine(payload);
  }

  @MessagePattern(ATTENDANCE.findAll)
  findAll(@Payload() dto: ListAttendanceDto): Promise<Paginated<AttendanceRecord>> {
    return this.attendanceService.findAll(dto);
  }

  @MessagePattern(ATTENDANCE.findOne)
  findOne(@Payload() { id }: AttendanceIdDto): Promise<AttendanceRecord> {
    return this.attendanceService.findOne(id);
  }
}
