import type { AttendanceRecord, AttendanceView, Paginated } from '@wfh/contracts';

export function toAttendanceView({
  photoKey: _photoKey,
  ...record
}: AttendanceRecord): AttendanceView {
  return { ...record, photoUrl: `/api/attendance/${record.id}/photo` };
}

export function toAttendancePage(page: Paginated<AttendanceRecord>): Paginated<AttendanceView> {
  return { ...page, items: page.items.map(toAttendanceView) };
}
