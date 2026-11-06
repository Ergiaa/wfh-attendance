import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AttendanceView } from '@wfh/contracts';
import { CalendarX2, Search, X } from 'lucide-react';
import { useState } from 'react';

import { attendanceKeys, fetchAttendance } from '../../api/attendance';
import { employeeKeys, fetchEmployee } from '../../api/employees';
import { AuthImage } from '../../components/AuthImage';
import { DateRangeFilter } from '../../components/DateRangeFilter';
import { PageHeader } from '../../components/PageHeader';
import { PhotoLightbox } from '../../components/PhotoLightbox';
import { SearchInput } from '../../components/SearchInput';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Table, type Column } from '../../components/ui/Table';
import { useListParams } from '../../lib/use-list-params';
import { formatTime, formatWorkDate, WORK_TIMEZONE_LABEL } from '../../lib/work-date';

const PAGE_SIZE = 15;

export function AttendancePage() {
  const { page, get, update, setPage } = useListParams();
  const search = get('search');
  const dateFrom = get('dateFrom');
  const dateTo = get('dateTo');
  const employeeId = get('employeeId');
  const [viewing, setViewing] = useState<AttendanceView | null>(null);

  const query = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    employeeId: employeeId || undefined,
  };
  const attendance = useQuery({
    queryKey: attendanceKeys.list(query),
    queryFn: ({ signal }) => fetchAttendance(query, signal),
    placeholderData: keepPreviousData,
  });

  const filteredEmployee = useQuery({
    queryKey: employeeKeys.detail(employeeId),
    queryFn: ({ signal }) => fetchEmployee(employeeId, signal),
    enabled: Boolean(employeeId),
  });
  // A deleted employee 404s but their attendance is kept, so fall back to the record's snapshot.
  const filteredEmployeeLabel = filteredEmployee.data
    ? `${filteredEmployee.data.name} · ${filteredEmployee.data.employeeCode}`
    : attendance.data?.items[0] &&
      `${attendance.data.items[0].employeeName} · ${attendance.data.items[0].employeeCode}`;

  const columns: Column<AttendanceView>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.employeeName}</span>
          <span className="font-mono text-xs text-fg-muted">{row.employeeCode}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => (
        <div className="flex flex-col">
          {formatWorkDate(row.workDate)}
          {/* Phones fold the time in here so the photo stays on screen. */}
          <span className="text-xs text-fg-muted tabular-nums sm:hidden">
            {formatTime(row.checkedInAt)} {WORK_TIMEZONE_LABEL}
          </span>
        </div>
      ),
    },
    {
      id: 'time',
      header: `Check-in (${WORK_TIMEZONE_LABEL})`,
      className: 'hidden sm:table-cell',
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
          aria-label={`View photo of ${row.employeeName} on ${formatWorkDate(row.workDate)}`}
          className="ml-auto block overflow-hidden rounded-md border transition-opacity hover:opacity-80"
        >
          <AuthImage src={row.photoUrl} alt="" className="size-10" />
        </button>
      ),
    },
  ];

  const filtered = Boolean(search || dateFrom || dateTo || employeeId);
  const clearFilters = () => update({ search: '', dateFrom: '', dateTo: '', employeeId: '' });

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Check-ins from every employee. Records can't be edited."
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            value={search}
            onSearch={(value) => update({ search: value })}
            label="Search attendance"
            placeholder="Search name or code"
            className="w-full sm:w-72"
          />
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(range) => update({ ...range })}
          />
        </div>

        {employeeId && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-fg-muted">Employee:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-0.5 pr-1 pl-3 font-medium text-primary-ink">
              {filteredEmployeeLabel ?? (filteredEmployee.isPending ? 'Loading…' : 'Unknown')}
              <button
                type="button"
                onClick={() => update({ employeeId: '' })}
                aria-label="Show all employees"
                className="rounded-full p-0.5 hover:bg-primary/15"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {attendance.isError ? (
        <Alert tone="danger" title="Couldn't load attendance">
          <p>{attendance.error.message}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => void attendance.refetch()}>
              Try again
            </Button>
            {filtered && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </Alert>
      ) : (
        <Table
          caption="Attendance"
          columns={columns}
          rows={attendance.data?.items}
          getRowId={(row) => row.id}
          loading={attendance.isPending}
          stale={attendance.isPlaceholderData}
          empty={
            filtered ? (
              <EmptyState
                icon={search ? Search : CalendarX2}
                title="No check-ins match these filters"
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={CalendarX2}
                title="No check-ins yet"
                description="Check-ins appear here as soon as employees submit them."
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
