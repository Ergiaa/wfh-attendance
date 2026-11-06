import type { AttendanceView } from '@wfh/contracts';

import { formatTime, formatWorkDate, WORK_TIMEZONE_LABEL } from '../lib/work-date';
import { AuthImage } from './AuthImage';
import { Modal } from './ui/Modal';

export interface PhotoLightboxProps {
  attendance: AttendanceView | null;
  onClose: () => void;
}

export function PhotoLightbox({ attendance, onClose }: PhotoLightboxProps) {
  return (
    <Modal
      open={attendance !== null}
      onClose={onClose}
      size="lg"
      title={attendance ? `${attendance.employeeName} · ${attendance.employeeCode}` : ''}
      description={
        attendance &&
        `${formatWorkDate(attendance.workDate)}, checked in at ${formatTime(attendance.checkedInAt, { seconds: true })} ${WORK_TIMEZONE_LABEL}`
      }
    >
      {attendance && (
        <div className="pb-4">
          <AuthImage
            src={attendance.photoUrl}
            alt={`Check-in photo of ${attendance.employeeName} on ${formatWorkDate(attendance.workDate)}`}
            fit="contain"
            className="max-h-[70dvh] min-h-48 w-full rounded-lg bg-surface-muted"
          />
        </div>
      )}
    </Modal>
  );
}
