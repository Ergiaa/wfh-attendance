import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AttendanceView } from '@wfh/contracts';
import { CalendarX2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { attendanceKeys, fetchMyAttendance } from '../api/attendance';
import { AuthImage } from '../components/AuthImage';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { PageHeader } from '../components/PageHeader';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Table, type Column } from '../components/ui/Table';
import { paths } from '../lib/paths';
import { useListParams } from '../lib/use-list-params';
import { formatTime, formatWorkDate, WORK_TIMEZONE_LABEL } from '../lib/work-date';

const PAGE_SIZE = 10;

export function MyAttendancePage() {
  const { page, get, update, setPage } = useListParams();
  const dateFrom = get('dateFrom');
  const dateTo = get('dateTo');
  const [viewing, setViewing] = useState<AttendanceView | null>(null);

  const query = {
    page,
    limit: PAGE_SIZE,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };
  const attendance = useQuery({
    queryKey: attendanceKeys.mine(query),
    queryFn: ({ signal }) => fetchMyAttendance(query, signal),
    placeholderData: keepPreviousData,
  });

  const columns: Column<AttendanceView>[] = [
    {
      id: 'date',
      header: 'Date',
      cell: (row) => <span className="font-medium">{formatWorkDate(row.workDate)}</span>,
    },
    {
      id: 'time',
      header: `Check-in (${WORK_TIMEZONE_LABEL})`,
      cell: (row) => <span className="tabular-nums">{formatTime(row.checkedInAt)}</span>,
    },
    {
      id: 'photo',
      header: 'Photo',
      align: 'right',
      cell: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          aria-label={`View photo for ${formatWorkDate(row.workDate)}`}
          className="ml-auto block overflow-hidden rounded-md border transition-opacity hover:opacity-80"
        >
          <AuthImage src={row.photoUrl} alt="" className="size-10" />
        </button>
      ),
    },
  ];

  const filtered = Boolean(dateFrom || dateTo);

  return (
    <>
      <PageHeader title="My attendance" description="Your check-in history." />

      <div className="mb-4">
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={(range) => update({ ...range })}
        />
      </div>

      {attendance.isError ? (
        <Alert tone="danger" title="Couldn't load your attendance">
          <p>{attendance.error.message}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => void attendance.refetch()}
          >
            Try again
          </Button>
        </Alert>
      ) : (
        <Table
          caption="My attendance"
          columns={columns}
          rows={attendance.data?.items}
          getRowId={(row) => row.id}
          loading={attendance.isPending}
          stale={attendance.isPlaceholderData}
          empty={
            filtered ? (
              <EmptyState
                icon={CalendarX2}
                title="No check-ins in this date range"
                action={
                  <Button variant="secondary" onClick={() => update({ dateFrom: '', dateTo: '' })}>
                    Clear dates
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={CalendarX2}
                title="No check-ins yet"
                description="Your daily check-ins will appear here."
                action={
                  <Link
                    to={paths.checkIn}
                    className="text-sm font-medium text-primary-ink underline-offset-4 hover:underline"
                  >
                    Check in for today
                  </Link>
                }
              />
            )
          }
          footer={
            attendance.data && (
              <Pagination
                page={attendance.data.page}
                limit={attendance.data.limit}
                total={attendance.data.total}
                onPageChange={setPage}
                disabled={attendance.isPlaceholderData}
              />
            )
          }
        />
      )}

      <PhotoLightbox attendance={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
