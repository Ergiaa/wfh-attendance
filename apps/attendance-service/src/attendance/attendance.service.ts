import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { AttendanceRecord, Paginated } from '@wfh/contracts';
import type {
  CheckInPayload,
  ListAttendanceDto,
  ListMyAttendancePayload,
} from '@wfh/contracts/dto';
import { escapeLike } from '@wfh/nest-common/microservice';
import {
  Between,
  FindOperator,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import type { Env } from '../config/env';
import { Attendance } from './attendance.entity';
import { toAttendanceRecord } from './attendance.mapper';
import { toWorkDate } from './work-date';

type AttendanceWhere = FindOptionsWhere<Attendance>;

@Injectable()
export class AttendanceService {
  private readonly timeZone: string;

  constructor(
    @InjectRepository(Attendance)
    private readonly attendances: Repository<Attendance>,
    config: ConfigService<Env, true>,
  ) {
    this.timeZone = config.get('WORK_TIMEZONE', { infer: true });
  }

  async checkIn(payload: CheckInPayload): Promise<AttendanceRecord> {
    const checkedInAt = new Date();
    const workDate = toWorkDate(checkedInAt, this.timeZone);

    if (await this.attendances.existsBy({ employeeId: payload.employeeId, workDate })) {
      throw new ConflictException('You have already checked in today');
    }

    const attendance = this.attendances.create({
      employeeId: payload.employeeId,
      employeeCode: payload.employeeCode,
      employeeName: payload.employeeName,
      photoKey: payload.photoKey,
      workDate,
      checkedInAt,
    });
    return toAttendanceRecord(await this.attendances.save(attendance));
  }

  findMine({ employeeId, page, limit, dateFrom, dateTo }: ListMyAttendancePayload) {
    return this.paginate([{ employeeId, ...workDateFilter(dateFrom, dateTo) }], page, limit);
  }

  findAll({ employeeId, search, page, limit, dateFrom, dateTo }: ListAttendanceDto) {
    const base: AttendanceWhere = {
      ...(employeeId && { employeeId }),
      ...workDateFilter(dateFrom, dateTo),
    };
    if (!search) {
      return this.paginate([base], page, limit);
    }

    const pattern = Like(`%${escapeLike(search)}%`);
    return this.paginate(
      [
        { ...base, employeeName: pattern },
        { ...base, employeeCode: pattern },
      ],
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<AttendanceRecord> {
    const attendance = await this.attendances.findOneBy({ id });
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }
    return toAttendanceRecord(attendance);
  }

  private async paginate(
    where: AttendanceWhere[],
    page: number,
    limit: number,
  ): Promise<Paginated<AttendanceRecord>> {
    const [attendances, total] = await this.attendances.findAndCount({
      where,
      // UUIDv7 ids are time-ordered, so this is newest-first and stable across pages.
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: attendances.map(toAttendanceRecord), total, page, limit };
  }
}

function workDateFilter(dateFrom?: string, dateTo?: string): { workDate?: FindOperator<string> } {
  if (dateFrom && dateTo) {
    if (dateFrom > dateTo) {
      throw new BadRequestException('dateFrom must not be after dateTo');
    }
    return { workDate: Between(dateFrom, dateTo) };
  }
  if (dateFrom) return { workDate: MoreThanOrEqual(dateFrom) };
  if (dateTo) return { workDate: LessThanOrEqual(dateTo) };
  return {};
}
