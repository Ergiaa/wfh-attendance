import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, type AttendanceView, type Paginated } from '@wfh/contracts';
import type { ListAttendanceDto, ListMyAttendanceDto } from '@wfh/contracts/dto';
import { access } from 'node:fs/promises';

import type { AuthUser } from '../auth/auth-user';
import { EmployeesClient } from '../employees/employees.client';
import { mimeTypeForKey } from '../photos/image-type';
import { PhotoStorage } from '../photos/photo-storage.service';
import { AttendanceClient } from './attendance.client';
import { toAttendancePage, toAttendanceView } from './attendance.mapper';

export interface StoredPhoto {
  path: string;
  mimeType: string;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendance: AttendanceClient,
    private readonly employees: EmployeesClient,
    private readonly photos: PhotoStorage,
  ) {}

  async checkIn(user: AuthUser, photo: Buffer): Promise<AttendanceView> {
    const employee = await this.employees.findOne(user.id);
    if (!employee.isActive) {
      throw new ForbiddenException('Your account is inactive');
    }

    const photoKey = await this.photos.save(photo);
    try {
      const record = await this.attendance.checkIn({
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.name,
        photoKey,
      });
      return toAttendanceView(record);
    } catch (error) {
      await this.photos.remove(photoKey);
      throw error;
    }
  }

  async findMine(user: AuthUser, query: ListMyAttendanceDto): Promise<Paginated<AttendanceView>> {
    return toAttendancePage(
      await this.attendance.findMine(Object.assign(query, { employeeId: user.id })),
    );
  }

  async findAll(query: ListAttendanceDto): Promise<Paginated<AttendanceView>> {
    return toAttendancePage(await this.attendance.findAll(query));
  }

  async photo(user: AuthUser, id: string): Promise<StoredPhoto> {
    const record = await this.attendance.findOne(id);
    // 404 rather than 403 so employees can't probe for other people's attendance ids.
    if (user.role !== Role.HRD_ADMIN && record.employeeId !== user.id) {
      throw new NotFoundException('Attendance not found');
    }

    const path = this.photos.pathFor(record.photoKey);
    const mimeType = mimeTypeForKey(record.photoKey);
    const exists = await access(path).then(
      () => true,
      () => false,
    );
    if (!exists || !mimeType) {
      throw new NotFoundException('Photo not found');
    }
    return { path, mimeType };
  }
}
