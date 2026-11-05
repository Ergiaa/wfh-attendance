import type { AttendanceRecord } from '@wfh/contracts';

import type { Attendance } from './attendance.entity';

export function toAttendanceRecord(attendance: Attendance): AttendanceRecord {
  return {
    id: attendance.id,
    employeeId: attendance.employeeId,
    employeeCode: attendance.employeeCode,
    employeeName: attendance.employeeName,
    workDate: attendance.workDate,
    checkedInAt: attendance.checkedInAt.toISOString(),
    photoKey: attendance.photoKey,
  };
}
