import type { AttendanceView, Paginated } from '@wfh/contracts';
import type { ListAttendanceDto, ListMyAttendanceDto } from '@wfh/contracts/dto';

import { request, requestBlob } from './client';

export const attendanceKeys = {
  all: ['attendance'] as const,
  mine: (query: ListMyAttendanceDto) => ['attendance', 'mine', query] as const,
  list: (query: ListAttendanceDto) => ['attendance', 'list', query] as const,
  photo: (url: string) => ['attendance', 'photo', url] as const,
};

export function checkIn(photo: File): Promise<AttendanceView> {
  const body = new FormData();
  body.append('photo', photo);
  return request('/attendance/check-in', { method: 'POST', body });
}

export function fetchMyAttendance(
  query: ListMyAttendanceDto,
  signal?: AbortSignal,
): Promise<Paginated<AttendanceView>> {
  return request('/attendance/me', { query, signal });
}

export function fetchAttendance(
  query: ListAttendanceDto,
  signal?: AbortSignal,
): Promise<Paginated<AttendanceView>> {
  return request('/attendance', { query, signal });
}

export function fetchPhoto(url: string, signal?: AbortSignal): Promise<Blob> {
  return requestBlob(url, signal);
}
