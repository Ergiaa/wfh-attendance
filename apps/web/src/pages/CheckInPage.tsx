import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceView } from '@wfh/contracts';
import { CircleCheck, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { attendanceKeys, checkIn, fetchMyAttendance } from '../api/attendance';
import { ApiError } from '../api/client';
import { AuthImage } from '../components/AuthImage';
import { CameraCapture } from '../components/CameraCapture';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/toast/toast-context';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { paths } from '../lib/paths';
import { useNow } from '../lib/use-now';
import { formatTime, formatWorkDate, todayWorkDate, WORK_TIMEZONE_LABEL } from '../lib/work-date';

export function CheckInPage() {
  const now = useNow();
  const today = todayWorkDate(now);
  const todayQuery = { page: 1, limit: 1, dateFrom: today, dateTo: today };

  const todayAttendance = useQuery({
    queryKey: attendanceKeys.mine(todayQuery),
    queryFn: ({ signal }) => fetchMyAttendance(todayQuery, signal),
    select: (page): AttendanceView | null => page.items[0] ?? null,
  });

  return (
    <>
      <PageHeader
        title="Check in"
        description={`${formatWorkDate(today)} · ${formatTime(now, { seconds: true })} ${WORK_TIMEZONE_LABEL}`}
      />
      <div className="mx-auto max-w-xl">
        {todayAttendance.isPending ? (
          <div className="aspect-4/3 animate-pulse rounded-xl border bg-surface" />
        ) : todayAttendance.isError ? (
          <Alert tone="danger" title="Couldn't load today's status">
            <p>{todayAttendance.error.message}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => void todayAttendance.refetch()}
            >
              Try again
            </Button>
          </Alert>
        ) : todayAttendance.data ? (
          <CheckedIn attendance={todayAttendance.data} />
        ) : (
          <CheckInForm onConflict={() => void todayAttendance.refetch()} />
        )}
      </div>
    </>
  );
}

function CheckInForm({ onConflict }: { onConflict: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [photo, setPhoto] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: checkIn,
    onSuccess: async (attendance) => {
      toast.success(
        'Checked in',
        `Recorded at ${formatTime(attendance.checkedInAt)} ${WORK_TIMEZONE_LABEL}.`,
      );
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (error) => {
      // Checked in from another tab or device: show today's record instead of the form.
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message);
        onConflict();
      }
    },
  });

  const error =
    mutation.error instanceof ApiError && mutation.error.status !== 409 ? mutation.error : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-surface p-4 shadow-xs sm:p-6">
      <div>
        <h2 className="font-semibold">Today's check-in</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-muted">
          <Clock aria-hidden className="size-4" />
          The time is recorded by the server when you submit.
        </p>
      </div>

      <CameraCapture value={photo} onChange={setPhoto} disabled={mutation.isPending} />

      {error && <Alert tone="danger">{error.message}</Alert>}

      <Button
        size="md"
        disabled={!photo}
        loading={mutation.isPending}
        onClick={() => photo && mutation.mutate(photo)}
        className="w-full"
      >
        Check in now
      </Button>
    </div>
  );
}

function CheckedIn({ attendance }: { attendance: AttendanceView }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-surface p-4 shadow-xs sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheck aria-hidden className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">You're checked in for today</h2>
          <p className="text-sm text-fg-muted">
            Recorded at{' '}
            <span className="font-medium text-fg tabular-nums">
              {formatTime(attendance.checkedInAt, { seconds: true })} {WORK_TIMEZONE_LABEL}
            </span>
          </p>
        </div>
      </div>
      <AuthImage
        src={attendance.photoUrl}
        alt="Your check-in photo for today"
        className="aspect-4/3 w-full rounded-xl border"
      />
      <Link
        to={paths.myAttendance}
        className="text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
      >
        View my attendance history
      </Link>
    </div>
  );
}
