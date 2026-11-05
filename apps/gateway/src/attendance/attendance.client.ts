import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ATTENDANCE, type AttendanceRecord, type Paginated } from '@wfh/contracts';
import type {
  CheckInPayload,
  ListAttendanceDto,
  ListMyAttendancePayload,
} from '@wfh/contracts/dto';

import { sendRpc } from '../common/rpc/send-rpc';

export const ATTENDANCE_SERVICE = Symbol('ATTENDANCE_SERVICE');

@Injectable()
export class AttendanceClient {
  constructor(@Inject(ATTENDANCE_SERVICE) private readonly client: ClientProxy) {}

  checkIn(payload: CheckInPayload): Promise<AttendanceRecord> {
    return sendRpc(this.client, ATTENDANCE.checkIn, payload);
  }

  findMine(payload: ListMyAttendancePayload): Promise<Paginated<AttendanceRecord>> {
    return sendRpc(this.client, ATTENDANCE.findMine, payload);
  }

  findAll(dto: ListAttendanceDto): Promise<Paginated<AttendanceRecord>> {
    return sendRpc(this.client, ATTENDANCE.findAll, dto);
  }

  findOne(id: string): Promise<AttendanceRecord> {
    return sendRpc(this.client, ATTENDANCE.findOne, { id });
  }
}
